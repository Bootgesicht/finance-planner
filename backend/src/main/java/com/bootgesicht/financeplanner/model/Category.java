package com.bootgesicht.financeplanner.model;

public class Category {
    private int id;
    private String name;
    private CategoryKind kind;

    public Category(int id, String name, CategoryKind kind) {
        this.id = id;
        this.name = name;
        this.kind = kind;
    }

    public int getCategoryId() {
        return id;
    }

    public String getCategoryName() {
        return name;
    }

    public CategoryKind getCategoryKind() {
        return kind;
    }

    public void setCategoryId(int id) {
        this.id = id;
    }

    public void setCategoryName(String name) {
        this.name = name;
    }

    public void setCategoryKind(CategoryKind kind) {
        this.kind = kind;
    }

}
