package com.bootgesicht.financeplanner.dto;

import java.util.List;

public class SavingsSummaryResponse {

    private List<SavingsSegmentResponse> items;
    private double bookedSavings;
    private double freeSurplus;
    private double totalAmount;

    public SavingsSummaryResponse(List<SavingsSegmentResponse> items, double bookedSavings,
            double freeSurplus, double totalAmount) {
        this.items = items;
        this.bookedSavings = bookedSavings;
        this.freeSurplus = freeSurplus;
        this.totalAmount = totalAmount;
    }

    public List<SavingsSegmentResponse> getItems() {
        return items;
    }

    public double getBookedSavings() {
        return bookedSavings;
    }

    public double getFreeSurplus() {
        return freeSurplus;
    }

    public double getTotalAmount() {
        return totalAmount;
    }
}
