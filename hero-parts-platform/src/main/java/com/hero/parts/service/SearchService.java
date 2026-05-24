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
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SearchService {

    // Words too generic to be useful as individual search terms in a motorcycle parts catalogue
    private static final Set<String> GENERIC_WORDS = Set.of(
        "motorcycle", "motorbike", "bike", "vehicle", "scooter", "moped", "two", "wheeler",
        "part", "parts", "spare", "component", "assembly", "unit", "piece", "item",
        "hero", "honda", "bajaj", "suzuki", "yamaha", "tvs", "royal", "enfield",
        "original", "genuine", "oem", "aftermarket", "compatible", "fits", "with"
    );

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

        // 6. Multi-word fallback: if the query has multiple words and results are still sparse,
        //    search each meaningful word independently so "steering head bearing" finds bearing parts.
        if (ranked.size() < 3 && query.contains(" ")) {
            String[] words = query.split("\\s+");
            for (String word : words) {
                if (word.length() <= 3 || GENERIC_WORDS.contains(word)) continue;
                List<Part> wordHits = partRepository.searchByNameOrDescription(word);
                for (Part p : wordHits) {
                    if (ranked.stream().noneMatch(r -> r.part.getId().equals(p.getId()))) {
                        ranked.add(new RankedResult(p, word, "WORD_FALLBACK", 0.45));
                        if (matchType == MatchType.NO_RESULT) matchType = MatchType.FUZZY;
                    }
                }
                List<SearchAlias> wordAliases = aliasRepository.findByAliasContaining(word);
                for (SearchAlias a : wordAliases) {
                    if (ranked.stream().noneMatch(r -> r.part.getId().equals(a.getPart().getId()))) {
                        ranked.add(new RankedResult(a.getPart(), a.getAlias(), a.getAliasType().name(), 0.45));
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
     * Image search: primary-label-first to prevent unrelated Gemini labels from
     * contaminating results (e.g. "mirror" should not pull in "meter assembly" hits).
     *
     * Phase 1 — search primary label through all tiers (exact → sub-phrase).
     * Phase 2 — if < 3 results, extend to secondary labels that share at least one
     *            significant keyword with the primary (related labels only).
     * Phase 3 — if still empty, fall back to individual significant words of the
     *            primary label only (never secondary label keywords).
     */
    @Transactional(readOnly = true)
    public SearchResponse searchByKeywords(List<String> labels, int size) {
        if (labels.isEmpty()) {
            return SearchResponse.builder().matchType("IMAGE_SEARCH")
                .totalResults(0).page(0).size(0).results(List.of()).build();
        }

        Map<Long, RankedResult> byPartId = new LinkedHashMap<>();
        String primaryLabel = labels.get(0).trim().toLowerCase();

        // Phase 1: primary label only
        collectLabelTiered(byPartId, primaryLabel, 1.0);
        log.info("[IMAGE-SEARCH] after primary label '{}': {} parts", primaryLabel, byPartId.size());

        // Phase 2: related secondary labels (share a keyword with primary)
        if (byPartId.size() < 3 && labels.size() > 1) {
            Set<String> primaryWords = significantWords(primaryLabel);
            for (int i = 1; i < labels.size() && byPartId.size() < 5; i++) {
                String secondary = labels.get(i).trim().toLowerCase();
                boolean related = significantWords(secondary).stream().anyMatch(primaryWords::contains);
                if (related) {
                    collectLabelTiered(byPartId, secondary, 0.8);
                    log.info("[IMAGE-SEARCH] related label '{}': {} total", secondary, byPartId.size());
                }
            }
        }

        // Phase 3: individual words of primary label only (no secondary contamination)
        if (byPartId.isEmpty()) {
            for (String word : primaryLabel.split("\\s+")) {
                if (word.length() <= 3 || GENERIC_WORDS.contains(word)) continue;
                collectHits(byPartId, word, 0.35);
            }
            log.info("[IMAGE-SEARCH] primary word fallback: {} parts", byPartId.size());
        }

        List<SearchResultItem> items = byPartId.values().stream()
            .sorted(Comparator.comparingDouble(RankedResult::score).reversed())
            .limit(size)
            .map(r -> partMapper.toSearchResult(r.part(), r.matchedAlias(), r.aliasType(), r.score()))
            .collect(Collectors.toList());

        return SearchResponse.builder()
            .matchType("IMAGE_SEARCH")
            .totalResults(byPartId.size())
            .page(0)
            .size(items.size())
            .results(items)
            .build();
    }

    /** Exact phrase then sub-phrases for one label at a given base score. */
    private void collectLabelTiered(Map<Long, RankedResult> map, String label, double baseScore) {
        collectHits(map, label, baseScore);
        if (map.size() >= 5) return;
        String[] words = label.split("\\s+");
        for (int len = words.length - 1; len >= 2; len--) {
            for (int start = 0; start + len <= words.length; start++) {
                String sub = String.join(" ", Arrays.copyOfRange(words, start, start + len));
                collectHits(map, sub, baseScore * (0.5 + 0.4 * (double) len / words.length));
            }
        }
    }

    /** Words that are long enough and not domain-generic. */
    private Set<String> significantWords(String text) {
        Set<String> result = new HashSet<>();
        for (String w : text.split("\\s+")) {
            if (w.length() > 3 && !GENERIC_WORDS.contains(w)) result.add(w);
        }
        return result;
    }

    private void collectHits(Map<Long, RankedResult> map, String term, double score) {
        List<Part> nameHits = partRepository.searchByNameOrDescription(term);
        for (Part p : nameHits) {
            map.merge(p.getId(), new RankedResult(p, term, "IMAGE_NAME", score),
                (a, b) -> a.score() >= b.score() ? a : b);
        }
        List<SearchAlias> aliasHits = aliasRepository.findByAliasContaining(term);
        for (SearchAlias a : aliasHits) {
            map.merge(a.getPart().getId(),
                new RankedResult(a.getPart(), a.getAlias(), "IMAGE_ALIAS", score + 0.05),
                (x, y) -> x.score() >= y.score() ? x : y);
        }
    }

    @Transactional
    public void logImageSearch(String query, int resultCount) {
        SearchLog entry = SearchLog.builder()
            .query(query)
            .resultsCount(resultCount)
            .matchType(MatchType.IMAGE)
            .source("image")
            .build();
        logRepository.save(entry);
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