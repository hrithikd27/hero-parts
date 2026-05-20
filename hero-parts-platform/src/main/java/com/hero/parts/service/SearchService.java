package com.hero.parts.service;

import com.hero.parts.dto.SearchRequest;
import com.hero.parts.dto.SearchResponse;
import com.hero.parts.dto.SearchResponse.SearchResultItem;
import com.hero.parts.model.Dealer;
import com.hero.parts.model.Part;
import com.hero.parts.model.SearchAlias;
import com.hero.parts.model.SearchLog;
import com.hero.parts.model.SearchLog.MatchType;
import com.hero.parts.repository.DealerRepository;
import com.hero.parts.repository.PartRepository;
import com.hero.parts.repository.SearchAliasRepository;
import com.hero.parts.repository.SearchLogRepository;
import com.hero.parts.util.FuzzyMatcher;
import com.hero.parts.util.PartMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SearchService {

    private final PartRepository partRepository;
    private final SearchAliasRepository aliasRepository;
    private final SearchLogRepository logRepository;
    private final DealerRepository dealerRepository;
    private final FuzzyMatcher fuzzyMatcher;
    private final PartMapper partMapper;

    @Value("${app.search.fuzzy-threshold:0.65}")
    private double fuzzyThreshold;

    @Value("${app.search.max-results:20}")
    private int maxResults;

    @Transactional
    public SearchResponse search(SearchRequest request) {
        String query = request.getQuery().trim();
        int page = request.getPage() != null ? request.getPage() : 0;
        int size = request.getSize() != null ? Math.min(request.getSize(), maxResults) : maxResults;

        List<RankedResult> ranked = new ArrayList<>();
        MatchType matchType = MatchType.NO_RESULT;

        // 1. Exact SKU match
        Optional<Part> bySku = partRepository.findBySkuIgnoreCase(query);
        if (bySku.isPresent()) {
            ranked.add(new RankedResult(bySku.get(), query, "SKU", 1.0));
            matchType = MatchType.EXACT_SKU;
        }

        // 2. Exact name / hindi name match
        if (ranked.isEmpty()) {
            List<Part> byName = partRepository.searchByNameOrDescription(query);
            for (Part p : byName) {
                double score = fuzzyMatcher.score(p.getName(), query);
                double hindiScore = p.getHindiName() != null ? fuzzyMatcher.score(p.getHindiName(), query) : 0;
                double best = Math.max(score, hindiScore);
                ranked.add(new RankedResult(p, query, "NAME", best));
            }
            if (!ranked.isEmpty()) matchType = MatchType.EXACT_NAME;
        }

        // 3. Alias exact match
        List<SearchAlias> exactAliases = aliasRepository.findByAliasExact(query);
        for (SearchAlias a : exactAliases) {
            if (ranked.stream().noneMatch(r -> r.part.getId().equals(a.getPart().getId()))) {
                ranked.add(new RankedResult(a.getPart(), a.getAlias(), a.getAliasType().name(), 0.95));
                if (matchType == MatchType.NO_RESULT) matchType = MatchType.ALIAS;
            }
        }

        // 4. Alias partial / fuzzy match
        List<SearchAlias> partialAliases = aliasRepository.findByAliasContaining(query);
        for (SearchAlias a : partialAliases) {
            if (ranked.stream().noneMatch(r -> r.part.getId().equals(a.getPart().getId()))) {
                double score = fuzzyMatcher.score(a.getAlias(), query);
                ranked.add(new RankedResult(a.getPart(), a.getAlias(), a.getAliasType().name(), score));
                if (matchType == MatchType.NO_RESULT) matchType = MatchType.ALIAS;
            }
        }

        // 5. Full fuzzy scan on all aliases if still sparse
        if (ranked.size() < 3) {
            List<SearchAlias> all = aliasRepository.findAllWithPart();
            for (SearchAlias a : all) {
                if (ranked.stream().noneMatch(r -> r.part.getId().equals(a.getPart().getId()))) {
                    double score = fuzzyMatcher.score(a.getAlias(), query);
                    if (score >= fuzzyThreshold) {
                        ranked.add(new RankedResult(a.getPart(), a.getAlias(), a.getAliasType().name(), score));
                        if (matchType == MatchType.NO_RESULT) matchType = MatchType.FUZZY;
                    }
                }
            }
        }

        // Filter by in-stock if requested
        if (Boolean.TRUE.equals(request.getInStockOnly())) {
            ranked.removeIf(r -> !Boolean.TRUE.equals(r.part.getInStock()));
        }

        // Filter by category if requested
        if (request.getCategoryId() != null) {
            ranked.removeIf(r -> r.part.getCategory() == null ||
                    !r.part.getCategory().getId().equals(request.getCategoryId()));
        }

        // Filter by bike model if requested
        if (request.getModel() != null && !request.getModel().isBlank()
                && !"All Models".equalsIgnoreCase(request.getModel().trim())) {
            String modelLower = request.getModel().trim().toLowerCase();
            ranked.removeIf(r -> r.part.getCompatibleModels() == null ||
                    !r.part.getCompatibleModels().toLowerCase().contains(modelLower));
        }

        // Sort by relevance score desc
        ranked.sort(Comparator.comparingDouble(RankedResult::score).reversed());

        // Deduplicate by part id (keep highest score)
        List<RankedResult> deduped = new ArrayList<>();
        Set<Long> seen = new HashSet<>();
        for (RankedResult r : ranked) {
            if (seen.add(r.part.getId())) deduped.add(r);
        }

        int total = deduped.size();
        int fromIdx = Math.min(page * size, total);
        int toIdx = Math.min(fromIdx + size, total);
        List<RankedResult> pageSlice = deduped.subList(fromIdx, toIdx);

        List<SearchResultItem> items = pageSlice.stream()
                .map(r -> partMapper.toSearchResult(r.part, r.matchedAlias, r.aliasType, r.score))
                .collect(Collectors.toList());

        return SearchResponse.builder()
                .query(query)
                .matchType(matchType.name())
                .totalResults(total)
                .page(page)
                .size(size)
                .results(items)
                .build();
    }

    private void saveLog(String query, Long dealerId, int resultCount,
                         String topSku, MatchType matchType,
                         String source, String sessionId) {
        Dealer dealer = dealerId != null
                ? dealerRepository.findById(dealerId).orElse(null)
                : null;
        SearchLog log = SearchLog.builder()
                .query(query)
                .dealer(dealer)
                .resultsCount(resultCount)
                .topPartSku(topSku)
                .matchType(matchType)
                .source(source != null ? source : "text")
                .sessionId(sessionId)
                .build();
        logRepository.save(log);
    }

    /** Called by the analytics endpoint when the user has finished typing (1.5 s idle). */
    @Transactional
    public void commitSearchLog(String rawQuery, String translatedQuery,
                                 String source, String sessionId, int resultsCount) {
        SearchLog log = SearchLog.builder()
                .query(rawQuery != null ? rawQuery : "")
                .resultsCount(resultsCount)
                .source(source != null ? source : "text")
                .sessionId(sessionId)
                .build();
        logRepository.save(log);
    }

    /**
     * Autocomplete: returns up to 10 alias/name suggestions that start with the given prefix.
     * Used for live search-as-you-type UIs.
     */
    @Transactional(readOnly = true)
    public List<String> suggest(String prefix) {
        String trimmed = prefix.trim().toLowerCase();
        List<String> aliasSuggestions = aliasRepository.findAliasSuggestions(trimmed);
        List<Part> nameSuggestions = partRepository.searchByNameOrDescription(trimmed);

        Set<String> seen = new LinkedHashSet<>();
        aliasSuggestions.forEach(s -> seen.add(s.toLowerCase()));
        nameSuggestions.forEach(p -> seen.add(p.getName().toLowerCase()));

        return seen.stream().limit(10).collect(Collectors.toList());
    }

    // Internal ranked result holder
    private record RankedResult(Part part, String matchedAlias, String aliasType, double score) {}
}