package com.hero.parts.repository;

import com.hero.parts.model.Part;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PartRepository extends JpaRepository<Part, Long> {

    Optional<Part> findBySkuIgnoreCase(String sku);

    boolean existsBySkuIgnoreCase(String sku);

    List<Part> findByCategoryId(Long categoryId);

    List<Part> findByInStockTrue();

    // Full-text search on name and hindi_name (case-insensitive LIKE)
    @Query("SELECT p FROM Part p WHERE " +
           "LOWER(p.name) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(p.hindiName) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :q, '%'))")
    List<Part> searchByNameOrDescription(@Param("q") String query);

    @Query("SELECT p FROM Part p WHERE " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(p.hindiName) LIKE LOWER(CONCAT('%', :q, '%'))) " +
           "AND p.inStock = true")
    List<Part> searchByNameInStock(@Param("q") String query);

    @Query("SELECT p FROM Part p WHERE " +
           "LOWER(p.compatibleModels) LIKE LOWER(CONCAT('%', :model, '%'))")
    List<Part> findByCompatibleModel(@Param("model") String model);

    @Query("SELECT p FROM Part p WHERE p.category.id = :catId AND " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(p.hindiName) LIKE LOWER(CONCAT('%', :q, '%')))")
    List<Part> searchInCategory(@Param("catId") Long categoryId, @Param("q") String query);

    @Query("SELECT COUNT(p) FROM Part p WHERE p.category.id = :catId")
    long countByCategoryId(@Param("catId") Long categoryId);

    @Query("SELECT p FROM Part p WHERE " +
           "(:catId IS NULL OR (p.category IS NOT NULL AND p.category.id = :catId)) AND " +
           "(:model IS NULL OR LOWER(p.compatibleModels) LIKE LOWER(CONCAT('%', :model, '%')))")
    Page<Part> findAllFiltered(
            @Param("catId") Long catId,
            @Param("model") String model,
            Pageable pageable);
}