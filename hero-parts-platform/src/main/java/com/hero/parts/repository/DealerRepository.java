package com.hero.parts.repository;

import com.hero.parts.model.Dealer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DealerRepository extends JpaRepository<Dealer, Long> {

    Optional<Dealer> findByDealerCodeIgnoreCase(String dealerCode);

    boolean existsByDealerCodeIgnoreCase(String dealerCode);

    List<Dealer> findByActiveTrue();

    List<Dealer> findByCityIgnoreCase(String city);

    List<Dealer> findByStateIgnoreCase(String state);
}