package com.bootgesicht.financeplanner.service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.bootgesicht.financeplanner.dto.AnalyticsOverviewResponse;
import com.bootgesicht.financeplanner.dto.CategorySummaryResponse;
import com.bootgesicht.financeplanner.dto.IncomeSegmentResponse;
import com.bootgesicht.financeplanner.dto.IncomeSummaryResponse;
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
                        calculateAverage(category.getTotalAmount(), monthCount),
                        monthCount))
                .toList();
    }

    public List<SubcategorySummaryResponse> getSubcategorySummary(
            LocalDate from, LocalDate to, Integer categoryId, String kind) {
        validateDateRange(from, to);
        long monthCount = getTouchedMonthCount(from, to);

        return analyticsRepository.getSubcategorySummary(from, to, categoryId, kind).stream()
                .map(subcategory -> new SubcategorySummaryResponse(
                        subcategory.getSubcategoryId(),
                        subcategory.getSubcategoryName(),
                        subcategory.getCategoryId(),
                        subcategory.getCategoryName(),
                        subcategory.getCategoryKind(),
                        subcategory.getTotalAmount(),
                        calculateAverage(subcategory.getTotalAmount(), monthCount),
                        monthCount))
                .toList();
    }

    public List<PersonSummaryResponse> getPersonSummary(LocalDate from, LocalDate to) {
        validateDateRange(from, to);
        long monthCount = getTouchedMonthCount(from, to);

        return analyticsRepository.getPersonSummary(from, to).stream()
                .map(person -> withAverage(person, monthCount))
                .toList();
    }

    public SavingsSummaryResponse getSavingsSummary(LocalDate from, LocalDate to) {
        validateDateRange(from, to);
        List<SubcategorySummaryResponse> bookedItems = analyticsRepository
                .getSubcategorySummary(from, to, null, "SAVING");
        AnalyticsOverviewResponse overview = analyticsRepository.getOverview(from, to);
        List<SavingsSegmentResponse> items = new ArrayList<>();
        long monthCount = getTouchedMonthCount(from, to);

        for (SubcategorySummaryResponse item : bookedItems) {
            items.add(new SavingsSegmentResponse(
                    "subcategory-" + item.getSubcategoryId(),
                    item.getSubcategoryName(),
                    item.getTotalAmount(),
                    "BOOKED",
                    calculateAverage(item.getTotalAmount(), monthCount),
                    monthCount));
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
                    "FREE_SURPLUS",
                    calculateAverage(freeSurplus, monthCount),
                    monthCount));
        }

        return new SavingsSummaryResponse(
                items,
                bookedSavings,
                freeSurplus,
                roundCurrency(bookedSavings + freeSurplus));
    }

    public IncomeSummaryResponse getIncomeSummary(LocalDate from, LocalDate to, String groupBy) {
        validateDateRange(from, to);
        String normalizedGroupBy = groupBy == null ? "subcategory" : groupBy.toLowerCase(Locale.ROOT);
        long monthCount = getTouchedMonthCount(from, to);
        List<IncomeSegmentResponse> items;

        if ("subcategory".equals(normalizedGroupBy)) {
            items = analyticsRepository.getSubcategorySummary(from, to, null, "INCOME").stream()
                    .map(subcategory -> new IncomeSegmentResponse(
                            "subcategory-" + subcategory.getSubcategoryId(),
                            subcategory.getSubcategoryName(),
                            subcategory.getTotalAmount(),
                            calculateAverage(subcategory.getTotalAmount(), monthCount)))
                    .toList();
        } else if ("person".equals(normalizedGroupBy)) {
            items = analyticsRepository.getIncomePersonSummary(from, to).stream()
                    .map(person -> new IncomeSegmentResponse(
                            "person-" + person.getPersonId(),
                            person.getPersonName(),
                            person.getTotalAmount(),
                            calculateAverage(person.getTotalAmount(), monthCount)))
                    .toList();
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "'groupBy' must be 'subcategory' or 'person'");
        }

        double totalAmount = roundCurrency(items.stream()
                .mapToDouble(IncomeSegmentResponse::getTotalAmount)
                .sum());
        return new IncomeSummaryResponse(normalizedGroupBy, items, totalAmount, monthCount);
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

    private double calculateAverage(double totalAmount, long monthCount) {
        return roundCurrency(totalAmount / monthCount);
    }

    private PersonSummaryResponse withAverage(PersonSummaryResponse person, long monthCount) {
        return new PersonSummaryResponse(
                person.getPersonId(),
                person.getPersonName(),
                person.getTotalAmount(),
                calculateAverage(person.getTotalAmount(), monthCount),
                monthCount);
    }
}
