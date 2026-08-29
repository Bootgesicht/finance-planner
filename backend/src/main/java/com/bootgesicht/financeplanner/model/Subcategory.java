package com.bootgesicht.financeplanner.model;

public class Subcategory {
    private int id;
    private int categoryId;
    private String name;
    private boolean archived;

    public Subcategory(int id, int categoryId, String name) {
        this(id, categoryId, name, false);
    }

    public Subcategory(int id, int categoryId, String name, boolean archived) {
        this.id = id;
        this.categoryId = categoryId;
        this.name = name;
        this.archived = archived;
    }

    public int getId() {
        return id;
    }

    public int getCategoryId() {
        return categoryId;
    }

    public String getName() {
        return name;
    }

    public boolean isArchived() {
        return archived;
    }

    public void setId(int id) {
        this.id = id;
    }

    public void setCategoryId(int categoryId) {
        this.categoryId = categoryId;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setArchived(boolean archived) {
        this.archived = archived;
    }
}
