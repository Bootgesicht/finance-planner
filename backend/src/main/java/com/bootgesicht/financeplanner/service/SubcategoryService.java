package com.bootgesicht.financeplanner.service;

import java.util.List;

import com.bootgesicht.financeplanner.model.Subcategory;
import com.bootgesicht.financeplanner.repository.SubcategoryRepository;

public class SubcategoryService {
    private SubcategoryRepository subcategoryRepository = new SubcategoryRepository();

    public List<Subcategory> getAllSubcategories() {
        return subcategoryRepository.findAll();
    }

    public Subcategory getSubcategoryById(int id) {
        return subcategoryRepository.findById(id);
    }

    public Subcategory getSubcategoryByName(String name) {
        return subcategoryRepository.findByName(name);
    }

    public void createSubcategory(Subcategory subCategory) {
        subcategoryRepository.save(subCategory);
    }

    public void deleteSubcategoryById(int id) {
        subcategoryRepository.deleteById(id);
    }

}
