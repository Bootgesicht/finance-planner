package com.bootgesicht.financeplanner.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.bootgesicht.financeplanner.dto.CategoryRequest;
import com.bootgesicht.financeplanner.model.Category;
import com.bootgesicht.financeplanner.repository.CategoryRepository;

@Service
public class CategoryService {

    private CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<Category> getAllCategories() {
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

    public void createCategory(CategoryRequest request) {
        Category category = new Category(
                0,
                request.getName(),
                request.getKind());

        categoryRepository.save(category);
    }

    public void deleteCategoryById(int id) {
        categoryRepository.deleteById(id);
    }
}