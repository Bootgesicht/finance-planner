package com.bootgesicht.financeplanner.dto;

public class MonthlyBalanceResponse {

    private String month;
    private double income;
    private double expenses;
    private double savings;
    private double balanceBeforeSavings;
    private double freeBalanceAfterSavings;

    public MonthlyBalanceResponse(String month, double income, double expenses, double savings,
            double balanceBeforeSavings, double freeBalanceAfterSavings) {
        this.month = month;
        this.income = income;
        this.expenses = expenses;
        this.savings = savings;
        this.balanceBeforeSavings = balanceBeforeSavings;
        this.freeBalanceAfterSavings = freeBalanceAfterSavings;
    }

    public String getMonth() {
        return month;
    }

    public double getIncome() {
        return income;
    }

    public double getExpenses() {
        return expenses;
    }

    public double getSavings() {
        return savings;
    }

    public double getBalanceBeforeSavings() {
        return balanceBeforeSavings;
    }

    public double getFreeBalanceAfterSavings() {
        return freeBalanceAfterSavings;
    }
}