package com.bootgesicht.financeplanner.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.bootgesicht.financeplanner.dto.SubcategoryRequest;
import com.bootgesicht.financeplanner.model.Subcategory;
import com.bootgesicht.financeplanner.repository.SubcategoryRepository;

@Service
public class SubcategoryService {

    private final SubcategoryRepository subcategoryRepository;

    public SubcategoryService(SubcategoryRepository subcategoryRepository) {
        this.subcategoryRepository = subcategoryRepository;
    }

    public List<Subcategory> getAllSubcategories() {
        return subcategoryRepository.findAll();
    }

    public Subcategory getSubcategoryById(int id) {
        return subcategoryRepository.findById(id);
    }

    public Subcategory getSubcategoryByName(String name) {
        return subcategoryRepository.findByName(name);
    }

    public List<Subcategory> getSubcategoriesByCategoryId(int categoryId) {
        return subcategoryRepository.getSubcategoriesByCategoryId(categoryId);
    }

    public void createSubcategory(Subcategory subCategory) {
        subcategoryRepository.save(subCategory);
    }

    public void createSubcategory(SubcategoryRequest request) {
        Subcategory subcategory = new Subcategory(
                0,
                request.getCategoryId(),
                request.getName());

        subcategoryRepository.save(subcategory);
    }

    public void deleteSubcategoryById(int id) {
        subcategoryRepository.deleteById(id);
    }
}