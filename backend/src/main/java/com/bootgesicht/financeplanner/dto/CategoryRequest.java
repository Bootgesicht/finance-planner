package com.bootgesicht.financeplanner.dto;

import com.bootgesicht.financeplanner.model.CategoryKind;

public class CategoryRequest {
    private String name;
    private CategoryKind kind;

    public CategoryRequest() {
    }

    public String getName() {
        return name;
    }

    public CategoryKind getKind() {
        return kind;
    }
}
