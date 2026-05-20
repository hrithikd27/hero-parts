package com.hero.parts.repository;

import com.hero.parts.model.EshopClick;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface EshopClickRepository extends JpaRepository<EshopClick, Long> {

    @Query("SELECT e.partSku, e.partName, COUNT(e) as clicks " +
           "FROM EshopClick e GROUP BY e.partSku, e.partName ORDER BY clicks DESC")
    List<Object[]> findTopClickedParts();

    long countByPartSku(String partSku);
}
