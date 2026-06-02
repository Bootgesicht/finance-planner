package com.bootgesicht.financeplanner.dto;

public class CategorySummaryResponse {

    private int categoryId;
    private String categoryName;
    private String categoryKind;
    private double totalAmount;

    public CategorySummaryResponse(int categoryId, String categoryName, String categoryKind, double totalAmount) {
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.categoryKind = categoryKind;
        this.totalAmount = totalAmount;
    }

    public int getCategoryId() {
        return categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public String getCategoryKind() {
        return categoryKind;
    }

    public double getTotalAmount() {
        return totalAmount;
    }
}