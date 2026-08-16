package com.bootgesicht.financeplanner.dto;

public class CategorySummaryResponse {

    private int categoryId;
    private String categoryName;
    private String categoryKind;
    private double totalAmount;
    private double averagePerMonth;
    private long monthCount;

    public CategorySummaryResponse(int categoryId, String categoryName, String categoryKind, double totalAmount) {
        this(categoryId, categoryName, categoryKind, totalAmount, 0, 0);
    }

    public CategorySummaryResponse(int categoryId, String categoryName, String categoryKind, double totalAmount,
            double averagePerMonth, long monthCount) {
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.categoryKind = categoryKind;
        this.totalAmount = totalAmount;
        this.averagePerMonth = averagePerMonth;
        this.monthCount = monthCount;
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
