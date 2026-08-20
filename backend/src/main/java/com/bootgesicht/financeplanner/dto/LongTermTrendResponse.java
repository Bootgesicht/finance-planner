package com.bootgesicht.financeplanner.dto;

import java.util.List;

public class LongTermTrendResponse {

    private String firstMonth;
    private String lastMonth;
    private List<MonthlyTrendPointResponse> total;
    private List<MonthlyTrendSeriesResponse> persons;

    public LongTermTrendResponse(String firstMonth, String lastMonth,
            List<MonthlyTrendPointResponse> total, List<MonthlyTrendSeriesResponse> persons) {
        this.firstMonth = firstMonth;
        this.lastMonth = lastMonth;
        this.total = total;
        this.persons = persons;
    }

    public String getFirstMonth() {
        return firstMonth;
    }

    public String getLastMonth() {
        return lastMonth;
    }

    public List<MonthlyTrendPointResponse> getTotal() {
        return total;
    }

    public List<MonthlyTrendSeriesResponse> getPersons() {
        return persons;
    }
}
