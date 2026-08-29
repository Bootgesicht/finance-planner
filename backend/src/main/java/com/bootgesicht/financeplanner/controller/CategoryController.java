package com.bootgesicht.financeplanner.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bootgesicht.financeplanner.dto.CategoryRequest;
import com.bootgesicht.financeplanner.dto.DeletionImpactResponse;
import com.bootgesicht.financeplanner.dto.NameUpdateRequest;
import com.bootgesicht.financeplanner.model.Category;
import com.bootgesicht.financeplanner.service.CategoryService;

@RestController
@RequestMapping("/categories")
public class CategoryController {

    private CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public List<Category> getAllCategories(
            @RequestParam(defaultValue = "false") boolean includeArchived) {
        return categoryService.getAllCategories(includeArchived);
    }

    @GetMapping("/{id}")
    public Category getCategoryById(@PathVariable int id) {
        return categoryService.getCategoryById(id);
    }

    @PostMapping
    public void createCategory(@RequestBody CategoryRequest request) {
        categoryService.createCategory(request);
    }

    @PutMapping("/{id}")
    public void renameCategory(@PathVariable int id, @RequestBody NameUpdateRequest request) {
        categoryService.renameCategory(id, request);
    }

    @PutMapping("/{id}/archive")
    public void archiveCategory(@PathVariable int id) {
        categoryService.archiveCategory(id);
    }

    @PutMapping("/{id}/reactivate")
    public void reactivateCategory(@PathVariable int id) {
        categoryService.reactivateCategory(id);
    }

    @GetMapping("/{id}/deletion-impact")
    public DeletionImpactResponse getDeletionImpact(@PathVariable int id) {
        return categoryService.getDeletionImpact(id);
    }

    @DeleteMapping("/{id}")
    public void deleteCategory(@PathVariable int id) {
        categoryService.deleteCategoryById(id);
    }
}
