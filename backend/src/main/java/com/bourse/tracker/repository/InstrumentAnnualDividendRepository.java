package com.bourse.tracker.repository;

import com.bourse.tracker.domain.InstrumentAnnualDividend;
import com.bourse.tracker.domain.InstrumentAnnualDividendId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InstrumentAnnualDividendRepository
        extends JpaRepository<InstrumentAnnualDividend, InstrumentAnnualDividendId> {

    List<InstrumentAnnualDividend> findByTickerOrderByYearDesc(String ticker);
}
