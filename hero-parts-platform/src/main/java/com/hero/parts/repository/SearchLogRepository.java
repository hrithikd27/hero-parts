package com.hero.parts.repository;

import com.hero.parts.model.SearchLog;
import com.hero.parts.model.SearchLog.MatchType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SearchLogRepository extends JpaRepository<SearchLog, Long> {

    List<SearchLog> findByDealerId(Long dealerId);

    List<SearchLog> findByMatchType(MatchType matchType);

    List<SearchLog> findBySearchedAtBetween(LocalDateTime from, LocalDateTime to);

    // Top zero-result queries – useful for discovering new aliases to add
    @Query("SELECT s.query, COUNT(s) as cnt FROM SearchLog s WHERE s.matchType = 'NO_RESULT' " +
           "GROUP BY s.query ORDER BY cnt DESC")
    List<Object[]> findTopNoResultQueries();

    // Most searched terms overall
    @Query("SELECT s.query, COUNT(s) as cnt FROM SearchLog s " +
           "GROUP BY s.query ORDER BY cnt DESC")
    List<Object[]> findTopSearchTerms();

    @Query("SELECT COUNT(s) FROM SearchLog s WHERE s.searchedAt >= :from")
    long countSearchesSince(@Param("from") LocalDateTime from);

    // Breakdown of searches by source (text vs voice)
    @Query("SELECT s.source, COUNT(s) as cnt FROM SearchLog s GROUP BY s.source ORDER BY cnt DESC")
    List<Object[]> countBySource();

    // Top voice-only queries
    @Query("SELECT s.query, COUNT(s) as cnt FROM SearchLog s WHERE s.source = 'voice' " +
           "GROUP BY s.query ORDER BY cnt DESC")
    List<Object[]> findTopVoiceQueries();
}