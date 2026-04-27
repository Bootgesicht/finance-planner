package com.bootgesicht.financeplanner.service;

import java.util.List;

import com.bootgesicht.financeplanner.model.Category;
import com.bootgesicht.financeplanner.repository.CategoryRepository;

public class CategoryService {

    private CategoryRepository categoryRepository = new CategoryRepository();

    public List<Category> getAllCategorys() {
        return categoryRepository.findAll();
    }

    public Category getCategoryById(int id) {
        return categoryRepository.findById(id);
    }

    public Category getCategoryByName(String name) {
        return categoryRepository.findByName(name);
    }

    public void createCategory(Category category) {
        categoryRepository.save(category);
    }

    public void deleteCategoryById(int id) {
        categoryRepository.deleteById(id);
    }

}
