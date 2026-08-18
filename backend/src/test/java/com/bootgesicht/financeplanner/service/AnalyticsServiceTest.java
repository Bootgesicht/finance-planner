package com.bootgesicht.financeplanner.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Stream;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.bootgesicht.financeplanner.dto.AnalyticsOverviewResponse;
import com.bootgesicht.financeplanner.dto.CategorySummaryResponse;
import com.bootgesicht.financeplanner.dto.IncomeSummaryResponse;
import com.bootgesicht.financeplanner.dto.PersonSummaryResponse;
import com.bootgesicht.financeplanner.dto.SavingsSummaryResponse;
import com.bootgesicht.financeplanner.dto.SubcategorySummaryResponse;
import com.bootgesicht.financeplanner.repository.AnalyticsRepository;

@ExtendWith(MockitoExtension.class)
class AnalyticsServiceTest {

    @Mock
    private AnalyticsRepository repository;

    @InjectMocks
    private AnalyticsService service;

    @Test
    void forwardsTheSameDateRangeToAllRepositoryQueries() {
        LocalDate from = LocalDate.of(2025, 6, 1);
        LocalDate to = LocalDate.of(2026, 5, 31);

        service.getOverview(from, to);
        service.getMonthlyBalance(from, to);
        service.getCategorySummary(from, to, "EXPENSE");
        service.getSubcategorySummary(from, to, 4, "EXPENSE");
        service.getPersonSummary(from, to);
        service.getIncomeSummary(from, to, "subcategory");
        service.getIncomeSummary(from, to, "person");

        verify(repository).getOverview(from, to);
        verify(repository).getMonthlyBalance(from, to);
        verify(repository).getCategorySummary(from, to, "EXPENSE");
        verify(repository).getSubcategorySummary(from, to, 4, "EXPENSE");
        verify(repository).getPersonSummary(from, to);
        verify(repository).getSubcategorySummary(from, to, null, "INCOME");
        verify(repository).getIncomePersonSummary(from, to);
    }

    @ParameterizedTest
    @MethodSource("averageRanges")
    void calculatesCategoryAverageFromEveryTouchedCalendarMonth(
            LocalDate from, LocalDate to, long expectedMonths, double expectedAverage) {
        when(repository.getCategorySummary(from, to, "EXPENSE"))
                .thenReturn(List.of(new CategorySummaryResponse(1, "Wohnen", "EXPENSE", 1200)));

        CategorySummaryResponse result = service.getCategorySummary(from, to, "EXPENSE").get(0);

        assertThat(result.getMonthCount()).isEqualTo(expectedMonths);
        assertThat(result.getAveragePerMonth()).isEqualTo(expectedAverage);
    }

    @Test
    void returnsNoCategoryAveragesForAnEmptyPeriodWithoutDividingByZero() {
        LocalDate from = LocalDate.of(2026, 1, 1);
        LocalDate to = LocalDate.of(2026, 12, 31);

        assertThat(service.getCategorySummary(from, to, "EXPENSE")).isEmpty();
        assertThat(service.getTouchedMonthCount(from, to)).isEqualTo(12);
    }

    @Test
    void addsTheSameTouchedMonthAverageToSubcategoriesAndPersons() {
        LocalDate from = LocalDate.of(2025, 12, 15);
        LocalDate to = LocalDate.of(2026, 2, 2);
        when(repository.getSubcategorySummary(from, to, null, "EXPENSE"))
                .thenReturn(List.of(new SubcategorySummaryResponse(
                        1, "Strom", 2, "Wohnen", "EXPENSE", 600)));
        when(repository.getPersonSummary(from, to))
                .thenReturn(List.of(new PersonSummaryResponse(1, "Jonas", 450)));

        SubcategorySummaryResponse subcategory = service
                .getSubcategorySummary(from, to, null, "EXPENSE").get(0);
        PersonSummaryResponse person = service.getPersonSummary(from, to).get(0);

        assertThat(subcategory.getMonthCount()).isEqualTo(3);
        assertThat(subcategory.getAveragePerMonth()).isEqualTo(200);
        assertThat(person.getMonthCount()).isEqualTo(3);
        assertThat(person.getAveragePerMonth()).isEqualTo(150);
    }

    @Test
    void addsPositiveFreeBalanceAsFreeSurplusToBookedSavings() {
        LocalDate from = LocalDate.of(2026, 1, 1);
        LocalDate to = LocalDate.of(2026, 12, 31);
        when(repository.getSubcategorySummary(from, to, null, "SAVING"))
                .thenReturn(bookedSavings());
        when(repository.getOverview(from, to))
                .thenReturn(new AnalyticsOverviewResponse(10000, 5725.18, 3067.11, 4274.82, 1207.71));

        SavingsSummaryResponse result = service.getSavingsSummary(from, to);

        assertThat(result.getItems()).extracting(item -> item.getName())
                .containsExactly("ETF-Sparen", "Einzelaktien-Sparen", "Freier Überschuss");
        assertThat(result.getBookedSavings()).isEqualTo(3067.11);
        assertThat(result.getFreeSurplus()).isEqualTo(1207.71);
        assertThat(result.getTotalAmount()).isEqualTo(4274.82);
        assertThat(result.getItems()).extracting(item -> item.getAveragePerMonth())
                .containsExactly(200.0, 55.59, 100.64);
        assertThat(result.getItems()).extracting(item -> item.getMonthCount())
                .containsOnly(12L);
    }

    @ParameterizedTest
    @MethodSource("nonPositiveBalances")
    void doesNotAddOrSubtractANonPositiveFreeBalance(double freeBalance) {
        LocalDate from = LocalDate.of(2026, 1, 1);
        LocalDate to = LocalDate.of(2026, 12, 31);
        when(repository.getSubcategorySummary(from, to, null, "SAVING"))
                .thenReturn(bookedSavings());
        when(repository.getOverview(from, to))
                .thenReturn(new AnalyticsOverviewResponse(10000, 6932.89, 3067.11, 3067.11, freeBalance));

        SavingsSummaryResponse result = service.getSavingsSummary(from, to);

        assertThat(result.getItems()).extracting(item -> item.getName())
                .containsExactly("ETF-Sparen", "Einzelaktien-Sparen");
        assertThat(result.getFreeSurplus()).isZero();
        assertThat(result.getTotalAmount()).isEqualTo(3067.11);
    }

    @Test
    void rejectsAnInvertedDateRange() {
        assertThatThrownBy(() -> service.getPersonSummary(
                LocalDate.of(2026, 2, 1), LocalDate.of(2026, 1, 31)))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(error -> assertThat(((ResponseStatusException) error).getStatusCode())
                        .isEqualTo(HttpStatus.BAD_REQUEST));
    }

    @Test
    void groupsIncomeBySubcategoryAndCalculatesAverages() {
        LocalDate from = LocalDate.of(2026, 1, 15);
        LocalDate to = LocalDate.of(2026, 3, 20);
        when(repository.getSubcategorySummary(from, to, null, "INCOME"))
                .thenReturn(List.of(
                        new SubcategorySummaryResponse(1, "Gehalt", 1, "Einnahmen", "INCOME", 6000),
                        new SubcategorySummaryResponse(2, "Geldgeschenke", 1, "Einnahmen", "INCOME", 300)));

        IncomeSummaryResponse result = service.getIncomeSummary(from, to, "subcategory");

        assertThat(result.getGroupBy()).isEqualTo("subcategory");
        assertThat(result.getMonthCount()).isEqualTo(3);
        assertThat(result.getTotalAmount()).isEqualTo(6300);
        assertThat(result.getItems()).extracting(item -> item.getName())
                .containsExactly("Gehalt", "Geldgeschenke");
        assertThat(result.getItems()).extracting(item -> item.getAveragePerMonth())
                .containsExactly(2000.0, 100.0);
    }

    @Test
    void groupsIncomeByPersonAndKeepsTheUnassignedSegment() {
        LocalDate from = LocalDate.of(2026, 1, 1);
        LocalDate to = LocalDate.of(2026, 2, 28);
        when(repository.getIncomePersonSummary(from, to))
                .thenReturn(List.of(
                        new PersonSummaryResponse(1, "Jonas", 3000),
                        new PersonSummaryResponse(0, "Ohne Person", 400)));

        IncomeSummaryResponse result = service.getIncomeSummary(from, to, "PERSON");

        assertThat(result.getGroupBy()).isEqualTo("person");
        assertThat(result.getTotalAmount()).isEqualTo(3400);
        assertThat(result.getItems()).extracting(item -> item.getName())
                .containsExactly("Jonas", "Ohne Person");
        assertThat(result.getItems()).extracting(item -> item.getAveragePerMonth())
                .containsExactly(1500.0, 200.0);
    }

    @Test
    void rejectsAnUnsupportedIncomeGrouping() {
        assertThatThrownBy(() -> service.getIncomeSummary(
                LocalDate.of(2026, 1, 1), LocalDate.of(2026, 1, 31), "category"))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(error -> assertThat(((ResponseStatusException) error).getStatusCode())
                        .isEqualTo(HttpStatus.BAD_REQUEST));
    }

    private static Stream<Arguments> averageRanges() {
        return Stream.of(
                Arguments.of(LocalDate.of(2026, 1, 1), LocalDate.of(2026, 12, 31), 12, 100.0),
                Arguments.of(LocalDate.of(2026, 1, 1), LocalDate.of(2026, 8, 31), 8, 150.0),
                Arguments.of(LocalDate.of(2025, 12, 1), LocalDate.of(2026, 2, 28), 3, 400.0),
                Arguments.of(LocalDate.of(2026, 1, 15), LocalDate.of(2026, 3, 20), 3, 400.0));
    }

    private static Stream<Double> nonPositiveBalances() {
        return Stream.of(0.0, -500.0);
    }

    private List<SubcategorySummaryResponse> bookedSavings() {
        return List.of(
                new SubcategorySummaryResponse(10, "ETF-Sparen", 3, "Investieren", "SAVING", 2400),
                new SubcategorySummaryResponse(11, "Einzelaktien-Sparen", 3, "Investieren", "SAVING", 667.11));
    }
}
