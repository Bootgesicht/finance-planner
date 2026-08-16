package com.bootgesicht.financeplanner.dto;

public class SavingsSegmentResponse {

    private String id;
    private String name;
    private double totalAmount;
    private String source;

    public SavingsSegmentResponse(String id, String name, double totalAmount, String source) {
        this.id = id;
        this.name = name;
        this.totalAmount = totalAmount;
        this.source = source;
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
}
