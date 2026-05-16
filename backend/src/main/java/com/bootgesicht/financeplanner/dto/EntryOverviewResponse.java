package com.bootgesicht.financeplanner.dto;

public class EntryOverviewResponse {

    private int id;
    private String date;
    private double amount;
    private String description;
    private String note;

    private int personId;
    private String personName;

    private int categoryId;
    private String categoryName;
    private String categoryKind;

    private int subcategoryId;
    private String subcategoryName;

    public EntryOverviewResponse(int id, String date, double amount, String description, String note,
            int personId, String personName,
            int categoryId, String categoryName, String categoryKind,
            int subcategoryId, String subcategoryName) {
        this.id = id;
        this.date = date;
        this.amount = amount;
        this.description = description;
        this.note = note;
        this.personId = personId;
        this.personName = personName;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.categoryKind = categoryKind;
        this.subcategoryId = subcategoryId;
        this.subcategoryName = subcategoryName;
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

    public String getNote() {
        return note;
    }

    public int getPersonId() {
        return personId;
    }

    public String getPersonName() {
        return personName;
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

    public int getSubcategoryId() {
        return subcategoryId;
    }

    public String getSubcategoryName() {
        return subcategoryName;
    }
}