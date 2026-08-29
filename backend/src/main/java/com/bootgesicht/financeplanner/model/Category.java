package com.bootgesicht.financeplanner.model;

public class Category {
    private int id;
    private String name;
    private CategoryKind kind;
    private boolean archived;

    public Category(int id, String name, CategoryKind kind) {
        this(id, name, kind, false);
    }

    public Category(int id, String name, CategoryKind kind, boolean archived) {
        this.id = id;
        this.name = name;
        this.kind = kind;
        this.archived = archived;
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

    public boolean isArchived() {
        return archived;
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

    public void setArchived(boolean archived) {
        this.archived = archived;
    }

}
