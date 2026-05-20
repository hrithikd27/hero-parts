package com.hero.parts.repository;

import com.hero.parts.model.SearchAlias;
import com.hero.parts.model.SearchAlias.AliasType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface SearchAliasRepository extends JpaRepository<SearchAlias, Long> {

    List<SearchAlias> findByPartId(Long partId);

    @Modifying
    @Transactional
    void deleteByPartId(Long partId);

    // Exact match on alias text — joins part so no second SELECT is needed
    @Query("SELECT a FROM SearchAlias a JOIN FETCH a.part p WHERE LOWER(a.alias) = LOWER(:alias)")
    List<SearchAlias> findByAliasExact(@Param("alias") String alias);

    // Partial match on alias text
    @Query("SELECT a FROM SearchAlias a JOIN FETCH a.part p WHERE LOWER(a.alias) LIKE LOWER(CONCAT('%', :q, '%'))")
    List<SearchAlias> findByAliasContaining(@Param("q") String query);

    // Prefix match for autocomplete suggestions (faster than full LIKE scan)
    @Query("SELECT DISTINCT a.alias FROM SearchAlias a WHERE LOWER(a.alias) LIKE LOWER(CONCAT(:q, '%')) ORDER BY a.alias")
    List<String> findAliasSuggestions(@Param("q") String prefix);

    // All aliases for fuzzy matching (fetches part eagerly to avoid N+1)
    @Query("SELECT a FROM SearchAlias a JOIN FETCH a.part")
    List<SearchAlias> findAllWithPart();

    List<SearchAlias> findByPartIdAndAliasType(Long partId, AliasType aliasType);

    boolean existsByPartIdAndAliasIgnoreCase(Long partId, String alias);
}
