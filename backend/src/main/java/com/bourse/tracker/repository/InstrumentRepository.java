package com.bourse.tracker.repository;

import com.bourse.tracker.domain.Instrument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface InstrumentRepository extends JpaRepository<Instrument, String> {

    @Query("SELECT i FROM Instrument i WHERE LOWER(i.ticker) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(i.name) LIKE LOWER(CONCAT('%', :q, '%'))")
    List<Instrument> search(String q);
}
