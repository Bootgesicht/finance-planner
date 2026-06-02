package com.bootgesicht.financeplanner.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bootgesicht.financeplanner.dto.CategorySummaryResponse;
import com.bootgesicht.financeplanner.dto.MonthlyBalanceResponse;
import com.bootgesicht.financeplanner.service.AnalyticsService;

@RestController
@RequestMapping("/analytics")
public class AnalyticsController {

    private AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/monthly-balance")
    public List<MonthlyBalanceResponse> getMonthlyBalance(@RequestParam int year) {
        return analyticsService.getMonthlyBalance(year);
    }

    @GetMapping("/category-summary")
    public List<CategorySummaryResponse> getCategorySummary(
            @RequestParam int year,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) String kind) {

        return analyticsService.getCategorySummary(year, month, kind);
    }
}