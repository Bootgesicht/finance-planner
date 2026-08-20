package com.bootgesicht.financeplanner.dto;

public class LongTermAnalyticsResponse {

    private LongTermTrendResponse income;
    private LongTermTrendResponse expenses;

    public LongTermAnalyticsResponse(LongTermTrendResponse income, LongTermTrendResponse expenses) {
        this.income = income;
        this.expenses = expenses;
    }

    public LongTermTrendResponse getIncome() {
        return income;
    }

    public LongTermTrendResponse getExpenses() {
        return expenses;
    }
}
