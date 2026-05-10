package com.bootgesicht.financeplanner.dto;

public class LatestEntryResponse {

    private int id;
    private String date;
    private double amount;
    private String description;
    private String personName;
    private String categoryName;
    private String subcategoryName;
    private String categoryKind;

    public LatestEntryResponse(int id, String date, double amount, String description,
            String personName, String categoryName, String subcategoryName, String categoryKind) {
        this.id = id;
        this.date = date;
        this.amount = amount;
        this.description = description;
        this.personName = personName;
        this.categoryName = categoryName;
        this.subcategoryName = subcategoryName;
        this.categoryKind = categoryKind;
    }

    public int getId() {
        return id;
    }

    public String getDate() {
        return date;
    }

    public double getAmount() {
        return amount;
    }

    public String getDescription() {
        return description;
    }

    public String getPersonName() {
        return personName;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public String getSubcategoryName() {
        return subcategoryName;
    }

    public String getCategoryKind() {
        return categoryKind;
    }
}