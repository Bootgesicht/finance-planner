package com.bootgesicht.financeplanner.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bootgesicht.financeplanner.model.Subcategory;
import com.bootgesicht.financeplanner.service.SubcategoryService;

@RestController
@RequestMapping("/subcategories")
public class SubcategoryController {
    private SubcategoryService subcategoryService = new SubcategoryService();

    @GetMapping
    public List<Subcategory> getAllSubcategories() {
        return subcategoryService.getAllSubcategories();
    }

    @GetMapping("/{id}")
    public Subcategory getSubcategoryById(@PathVariable int id) {
        return subcategoryService.getSubcategoryById(id);
    }

    @GetMapping("/category/{categoryId}")
    public List<Subcategory> getSubcategoriesByCategoryId(@PathVariable int categoryId) {
        return subcategoryService.getSubcategoriesByCategoryId(categoryId);
    }
}
