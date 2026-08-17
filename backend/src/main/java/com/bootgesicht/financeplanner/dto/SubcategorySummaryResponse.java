package com.bootgesicht.financeplanner.dto;

public class SubcategorySummaryResponse {

    private int subcategoryId;
    private String subcategoryName;
    private int categoryId;
    private String categoryName;
    private String categoryKind;
    private double totalAmount;
    private double averagePerMonth;
    private long monthCount;

    public SubcategorySummaryResponse(
            int subcategoryId,
            String subcategoryName,
            int categoryId,
            String categoryName,
            String categoryKind,
            double totalAmount) {
        this(subcategoryId, subcategoryName, categoryId, categoryName, categoryKind, totalAmount, 0, 0);
    }

    public SubcategorySummaryResponse(
            int subcategoryId,
            String subcategoryName,
            int categoryId,
            String categoryName,
            String categoryKind,
            double totalAmount,
            double averagePerMonth,
            long monthCount) {
        this.subcategoryId = subcategoryId;
        this.subcategoryName = subcategoryName;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.categoryKind = categoryKind;
        this.totalAmount = totalAmount;
        this.averagePerMonth = averagePerMonth;
        this.monthCount = monthCount;
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

    public double getAveragePerMonth() {
        return averagePerMonth;
    }

    public long getMonthCount() {
        return monthCount;
    }
}
