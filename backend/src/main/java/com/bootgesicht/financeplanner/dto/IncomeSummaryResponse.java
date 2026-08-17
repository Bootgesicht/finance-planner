package com.bootgesicht.financeplanner.dto;

import java.util.List;

public class IncomeSummaryResponse {

    private String groupBy;
    private List<IncomeSegmentResponse> items;
    private double totalAmount;
    private long monthCount;

    public IncomeSummaryResponse(String groupBy, List<IncomeSegmentResponse> items,
            double totalAmount, long monthCount) {
        this.groupBy = groupBy;
        this.items = items;
        this.totalAmount = totalAmount;
        this.monthCount = monthCount;
    }

    public String getGroupBy() {
        return groupBy;
    }

    public List<IncomeSegmentResponse> getItems() {
        return items;
    }

    public double getTotalAmount() {
        return totalAmount;
    }

    public long getMonthCount() {
        return monthCount;
    }
}
