package com.hero.parts.service;

import com.hero.parts.repository.SearchLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnalyticsService {

    private final SearchLogRepository logRepository;

    public Map<String, Long> getTopSearchTerms(int limit) {
        List<Object[]> rows = logRepository.findTopSearchTerms();
        Map<String, Long> result = new LinkedHashMap<>();
        rows.stream().limit(limit).forEach(r -> result.put((String) r[0], ((Number) r[1]).longValue()));
        return result;
    }

    public Map<String, Long> getTopNoResultQueries(int limit) {
        List<Object[]> rows = logRepository.findTopNoResultQueries();
        Map<String, Long> result = new LinkedHashMap<>();
        rows.stream().limit(limit).forEach(r -> result.put((String) r[0], ((Number) r[1]).longValue()));
        return result;
    }

    public long getSearchCountLast24Hours() {
        return logRepository.countSearchesSince(LocalDateTime.now().minusHours(24));
    }

    public long getSearchCountLast7Days() {
        return logRepository.countSearchesSince(LocalDateTime.now().minusDays(7));
    }

    public Map<String, Long> getSearchCountBySource() {
        List<Object[]> rows = logRepository.countBySource();
        Map<String, Long> result = new LinkedHashMap<>();
        rows.forEach(r -> result.put(r[0] != null ? (String) r[0] : "unknown", ((Number) r[1]).longValue()));
        return result;
    }

    public Map<String, Long> getTopVoiceQueries(int limit) {
        List<Object[]> rows = logRepository.findTopVoiceQueries();
        Map<String, Long> result = new LinkedHashMap<>();
        rows.stream().limit(limit).forEach(r -> result.put((String) r[0], ((Number) r[1]).longValue()));
        return result;
    }
}