package com.bootgesicht.financeplanner.dto;

public class MonthlyTrendPointResponse {

    private String month;
    private double amount;

    public MonthlyTrendPointResponse(String month, double amount) {
        this.month = month;
        this.amount = amount;
    }

    public String getMonth() {
        return month;
    }

    public double getAmount() {
        return amount;
    }
}
