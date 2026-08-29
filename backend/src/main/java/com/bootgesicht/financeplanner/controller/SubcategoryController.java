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

import com.bootgesicht.financeplanner.dto.DeletionImpactResponse;
import com.bootgesicht.financeplanner.dto.NameUpdateRequest;
import com.bootgesicht.financeplanner.dto.SubcategoryRequest;
import com.bootgesicht.financeplanner.model.Subcategory;
import com.bootgesicht.financeplanner.service.SubcategoryService;

@RestController
@RequestMapping("/subcategories")
public class SubcategoryController {

    private SubcategoryService subcategoryService;

    public SubcategoryController(SubcategoryService subcategoryService) {
        this.subcategoryService = subcategoryService;
    }

    @GetMapping
    public List<Subcategory> getAllSubcategories(
            @RequestParam(defaultValue = "false") boolean includeArchived) {
        return subcategoryService.getAllSubcategories(includeArchived);
    }

    @GetMapping("/{id}")
    public Subcategory getSubcategoryById(@PathVariable int id) {
        return subcategoryService.getSubcategoryById(id);
    }

    @GetMapping("/category/{categoryId}")
    public List<Subcategory> getSubcategoriesByCategoryId(
            @PathVariable int categoryId,
            @RequestParam(defaultValue = "false") boolean includeArchived) {
        return subcategoryService.getSubcategoriesByCategoryId(categoryId, includeArchived);
    }

    @PostMapping
    public void createSubcategory(@RequestBody SubcategoryRequest request) {
        subcategoryService.createSubcategory(request);
    }

    @PutMapping("/{id}")
    public void renameSubcategory(@PathVariable int id, @RequestBody NameUpdateRequest request) {
        subcategoryService.renameSubcategory(id, request);
    }

    @PutMapping("/{id}/archive")
    public void archiveSubcategory(@PathVariable int id) {
        subcategoryService.archiveSubcategory(id);
    }

    @PutMapping("/{id}/reactivate")
    public void reactivateSubcategory(@PathVariable int id) {
        subcategoryService.reactivateSubcategory(id);
    }

    @GetMapping("/{id}/deletion-impact")
    public DeletionImpactResponse getDeletionImpact(@PathVariable int id) {
        return subcategoryService.getDeletionImpact(id);
    }

    @DeleteMapping("/{id}")
    public void deleteSubcategory(@PathVariable int id) {
        subcategoryService.deleteSubcategoryById(id);
    }
}
