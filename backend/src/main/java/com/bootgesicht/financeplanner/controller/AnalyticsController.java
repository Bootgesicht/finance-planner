package com.bootgesicht.financeplanner.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bootgesicht.financeplanner.dto.AnalyticsOverviewResponse;
import com.bootgesicht.financeplanner.dto.CategorySummaryResponse;
import com.bootgesicht.financeplanner.dto.IncomeSummaryResponse;
import com.bootgesicht.financeplanner.dto.MonthlyBalanceResponse;
import com.bootgesicht.financeplanner.dto.PersonSummaryResponse;
import com.bootgesicht.financeplanner.dto.SavingsSummaryResponse;
import com.bootgesicht.financeplanner.dto.SubcategorySummaryResponse;
import com.bootgesicht.financeplanner.service.AnalyticsService;

@RestController
@RequestMapping("/analytics")
public class AnalyticsController {

    private AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/overview")
    public AnalyticsOverviewResponse getOverview(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return analyticsService.getOverview(from, to);
    }

    @GetMapping("/monthly-balance")
    public List<MonthlyBalanceResponse> getMonthlyBalance(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return analyticsService.getMonthlyBalance(from, to);
    }

    @GetMapping("/category-summary")
    public List<CategorySummaryResponse> getCategorySummary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) String kind) {
        return analyticsService.getCategorySummary(from, to, kind);
    }

    @GetMapping("/subcategory-summary")
    public List<SubcategorySummaryResponse> getSubcategorySummary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) String kind) {
        return analyticsService.getSubcategorySummary(from, to, categoryId, kind);
    }

    @GetMapping("/person-summary")
    public List<PersonSummaryResponse> getPersonSummary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return analyticsService.getPersonSummary(from, to);
    }

    @GetMapping("/savings-summary")
    public SavingsSummaryResponse getSavingsSummary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return analyticsService.getSavingsSummary(from, to);
    }

    @GetMapping("/income-summary")
    public IncomeSummaryResponse getIncomeSummary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "subcategory") String groupBy) {
        return analyticsService.getIncomeSummary(from, to, groupBy);
    }
}
