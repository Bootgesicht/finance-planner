package com.bootgesicht.financeplanner.dto;

public class SubcategorySummaryResponse {

    private int subcategoryId;
    private String subcategoryName;
    private int categoryId;
    private String categoryName;
    private String categoryKind;
    private double totalAmount;

    public SubcategorySummaryResponse(
            int subcategoryId,
            String subcategoryName,
            int categoryId,
            String categoryName,
            String categoryKind,
            double totalAmount) {
        this.subcategoryId = subcategoryId;
        this.subcategoryName = subcategoryName;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.categoryKind = categoryKind;
        this.totalAmount = totalAmount;
    }

    public int getSubcategoryId() {
        return subcategoryId;
    }

    public String getSubcategoryName() {
        return subcategoryName;
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