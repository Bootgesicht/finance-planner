package com.bootgesicht.financeplanner.dto;

public class SavingsSegmentResponse {

    private String id;
    private String name;
    private double totalAmount;
    private String source;
    private double averagePerMonth;
    private long monthCount;

    public SavingsSegmentResponse(String id, String name, double totalAmount, String source) {
        this(id, name, totalAmount, source, 0, 0);
    }

    public SavingsSegmentResponse(String id, String name, double totalAmount, String source,
            double averagePerMonth, long monthCount) {
        this.id = id;
        this.name = name;
        this.totalAmount = totalAmount;
        this.source = source;
        this.averagePerMonth = averagePerMonth;
        this.monthCount = monthCount;
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

    public String getSource() {
        return source;
    }

    public double getAveragePerMonth() {
        return averagePerMonth;
    }

    public long getMonthCount() {
        return monthCount;
    }
}
