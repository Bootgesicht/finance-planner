package com.bootgesicht.financeplanner.controller;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.bootgesicht.financeplanner.dto.PersonSummaryResponse;
import com.bootgesicht.financeplanner.dto.IncomeSegmentResponse;
import com.bootgesicht.financeplanner.dto.IncomeSummaryResponse;
import com.bootgesicht.financeplanner.dto.SavingsSegmentResponse;
import com.bootgesicht.financeplanner.dto.SavingsSummaryResponse;
import com.bootgesicht.financeplanner.service.AnalyticsService;

@ExtendWith(MockitoExtension.class)
class AnalyticsControllerTest {

    @Mock
    private AnalyticsService service;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new AnalyticsController(service)).build();
    }

    @Test
    void personSummaryUsesTheIsoDateRange() throws Exception {
        LocalDate from = LocalDate.of(2025, 1, 15);
        LocalDate to = LocalDate.of(2026, 2, 20);
        when(service.getPersonSummary(from, to))
                .thenReturn(List.of(new PersonSummaryResponse(1, "Jonas", 1250)));

        mockMvc.perform(get("/analytics/person-summary")
                .param("from", "2025-01-15")
                .param("to", "2026-02-20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].personName").value("Jonas"))
                .andExpect(jsonPath("$[0].totalAmount").value(1250));

        verify(service).getPersonSummary(from, to);
    }

    @Test
    void savingsSummaryReturnsBookedSavingsAndFreeSurplus() throws Exception {
        LocalDate from = LocalDate.of(2026, 1, 1);
        LocalDate to = LocalDate.of(2026, 12, 31);
        when(service.getSavingsSummary(from, to)).thenReturn(new SavingsSummaryResponse(
                List.of(
                        new SavingsSegmentResponse("subcategory-1", "ETF-Sparen", 2400, "BOOKED"),
                        new SavingsSegmentResponse("free-surplus", "Freier Überschuss", 1200, "FREE_SURPLUS")),
                2400,
                1200,
                3600));

        mockMvc.perform(get("/analytics/savings-summary")
                .param("from", "2026-01-01")
                .param("to", "2026-12-31"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].name").value("ETF-Sparen"))
                .andExpect(jsonPath("$.items[1].name").value("Freier Überschuss"))
                .andExpect(jsonPath("$.bookedSavings").value(2400))
                .andExpect(jsonPath("$.freeSurplus").value(1200))
                .andExpect(jsonPath("$.totalAmount").value(3600));
    }

    @Test
    void incomeSummaryUsesTheRequestedGroupingAndReturnsAverages() throws Exception {
        LocalDate from = LocalDate.of(2026, 1, 1);
        LocalDate to = LocalDate.of(2026, 2, 28);
        when(service.getIncomeSummary(from, to, "person")).thenReturn(new IncomeSummaryResponse(
                "person",
                List.of(new IncomeSegmentResponse("person-0", "Ohne Person", 400, 200)),
                400,
                2));

        mockMvc.perform(get("/analytics/income-summary")
                .param("from", "2026-01-01")
                .param("to", "2026-02-28")
                .param("groupBy", "person"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.groupBy").value("person"))
                .andExpect(jsonPath("$.items[0].name").value("Ohne Person"))
                .andExpect(jsonPath("$.items[0].averagePerMonth").value(200))
                .andExpect(jsonPath("$.totalAmount").value(400))
                .andExpect(jsonPath("$.monthCount").value(2));

        verify(service).getIncomeSummary(from, to, "person");
    }

    @Test
    void incomeSummaryDefaultsToSubcategoryGrouping() throws Exception {
        LocalDate from = LocalDate.of(2026, 1, 1);
        LocalDate to = LocalDate.of(2026, 1, 31);
        when(service.getIncomeSummary(from, to, "subcategory")).thenReturn(new IncomeSummaryResponse(
                "subcategory",
                List.of(new IncomeSegmentResponse("subcategory-1", "Gehalt", 3000, 3000)),
                3000,
                1));

        mockMvc.perform(get("/analytics/income-summary")
                .param("from", "2026-01-01")
                .param("to", "2026-01-31"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.groupBy").value("subcategory"))
                .andExpect(jsonPath("$.items[0].name").value("Gehalt"));

        verify(service).getIncomeSummary(from, to, "subcategory");
    }

    @Test
    void analyticsEndpointsRequireBothDates() throws Exception {
        mockMvc.perform(get("/analytics/subcategory-summary").param("from", "2026-01-01"))
                .andExpect(status().isBadRequest());
    }
}
