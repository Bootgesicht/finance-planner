package com.bootgesicht.financeplanner.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bootgesicht.financeplanner.model.Category;
import com.bootgesicht.financeplanner.service.CategoryService;

@RestController
@RequestMapping("/categories")
public class CategoryController {

    private CategoryService categoryService = new CategoryService();

    @GetMapping
    public List<Category> getAllCategories() {
        return categoryService.getAllCategories();
    }

    @GetMapping("/{id}")
    public Category getCategoryById(@PathVariable int id) {
        return categoryService.getCategoryById(id);
    }
}