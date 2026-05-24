package com.bootgesicht.financeplanner.service;

import java.util.List;

import com.bootgesicht.financeplanner.dto.MonthlyBalanceResponse;
import com.bootgesicht.financeplanner.repository.AnalyticsRepository;

public class AnalyticsService {

    private AnalyticsRepository analyticsRepository = new AnalyticsRepository();

    public List<MonthlyBalanceResponse> getMonthlyBalance(int year) {
        return analyticsRepository.getMonthlyBalance(year);
    }
}