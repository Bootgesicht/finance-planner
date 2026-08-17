package com.bootgesicht.financeplanner.dto;

public class IncomeSegmentResponse {

    private String id;
    private String name;
    private double totalAmount;
    private double averagePerMonth;

    public IncomeSegmentResponse(String id, String name, double totalAmount, double averagePerMonth) {
        this.id = id;
        this.name = name;
        this.totalAmount = totalAmount;
        this.averagePerMonth = averagePerMonth;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public double getTotalAmount() {
        return totalAmount;
    }

    public double getAveragePerMonth() {
        return averagePerMonth;
    }
}
