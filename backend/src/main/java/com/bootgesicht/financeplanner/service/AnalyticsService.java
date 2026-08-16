package com.bootgesicht.financeplanner.service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.bootgesicht.financeplanner.dto.AnalyticsOverviewResponse;
import com.bootgesicht.financeplanner.dto.CategorySummaryResponse;
import com.bootgesicht.financeplanner.dto.MonthlyBalanceResponse;
import com.bootgesicht.financeplanner.dto.PersonSummaryResponse;
import com.bootgesicht.financeplanner.dto.SavingsSegmentResponse;
import com.bootgesicht.financeplanner.dto.SavingsSummaryResponse;
import com.bootgesicht.financeplanner.dto.SubcategorySummaryResponse;
import com.bootgesicht.financeplanner.repository.AnalyticsRepository;

@Service
public class AnalyticsService {

    private AnalyticsRepository analyticsRepository;

    public AnalyticsService(AnalyticsRepository analyticsRepository) {
        this.analyticsRepository = analyticsRepository;
    }

    public AnalyticsOverviewResponse getOverview(LocalDate from, LocalDate to) {
        validateDateRange(from, to);
        return analyticsRepository.getOverview(from, to);
    }

    public List<MonthlyBalanceResponse> getMonthlyBalance(LocalDate from, LocalDate to) {
        validateDateRange(from, to);
        return analyticsRepository.getMonthlyBalance(from, to);
    }

    public List<CategorySummaryResponse> getCategorySummary(LocalDate from, LocalDate to, String kind) {
        validateDateRange(from, to);
        long monthCount = getTouchedMonthCount(from, to);

        return analyticsRepository.getCategorySummary(from, to, kind).stream()
                .map(category -> new CategorySummaryResponse(
                        category.getCategoryId(),
                        category.getCategoryName(),
                        category.getCategoryKind(),
                        category.getTotalAmount(),
                        roundCurrency(category.getTotalAmount() / monthCount),
                        monthCount))
                .toList();
    }

    public List<SubcategorySummaryResponse> getSubcategorySummary(
            LocalDate from, LocalDate to, Integer categoryId, String kind) {
        validateDateRange(from, to);
        return analyticsRepository.getSubcategorySummary(from, to, categoryId, kind);
    }

    public List<PersonSummaryResponse> getPersonSummary(LocalDate from, LocalDate to) {
        validateDateRange(from, to);
        return analyticsRepository.getPersonSummary(from, to);
    }

    public SavingsSummaryResponse getSavingsSummary(LocalDate from, LocalDate to) {
        validateDateRange(from, to);
        List<SubcategorySummaryResponse> bookedItems = analyticsRepository
                .getSubcategorySummary(from, to, null, "SAVING");
        AnalyticsOverviewResponse overview = analyticsRepository.getOverview(from, to);
        List<SavingsSegmentResponse> items = new ArrayList<>();

        for (SubcategorySummaryResponse item : bookedItems) {
            items.add(new SavingsSegmentResponse(
                    "subcategory-" + item.getSubcategoryId(),
                    item.getSubcategoryName(),
                    item.getTotalAmount(),
                    "BOOKED"));
        }

        double bookedSavings = roundCurrency(bookedItems.stream()
                .mapToDouble(SubcategorySummaryResponse::getTotalAmount)
                .sum());
        double freeSurplus = overview.getFreeBalanceAfterSavings() > 0
                ? roundCurrency(overview.getFreeBalanceAfterSavings())
                : 0;

        if (freeSurplus > 0) {
            items.add(new SavingsSegmentResponse(
                    "free-surplus",
                    "Freier Überschuss",
                    freeSurplus,
                    "FREE_SURPLUS"));
        }

        return new SavingsSummaryResponse(
                items,
                bookedSavings,
                freeSurplus,
                roundCurrency(bookedSavings + freeSurplus));
    }

    long getTouchedMonthCount(LocalDate from, LocalDate to) {
        validateDateRange(from, to);
        return ChronoUnit.MONTHS.between(YearMonth.from(from), YearMonth.from(to)) + 1;
    }

    private void validateDateRange(LocalDate from, LocalDate to) {
        if (from == null || to == null || from.isAfter(to)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "'from' must not be after 'to'");
        }
    }

    private double roundCurrency(double amount) {
        return Math.round(amount * 100.0) / 100.0;
    }
}
