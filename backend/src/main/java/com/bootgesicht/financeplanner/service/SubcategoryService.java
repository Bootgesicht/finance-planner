package com.bootgesicht.financeplanner.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.bootgesicht.financeplanner.dto.DeletionImpactResponse;
import com.bootgesicht.financeplanner.dto.NameUpdateRequest;
import com.bootgesicht.financeplanner.dto.SubcategoryRequest;
import com.bootgesicht.financeplanner.model.Category;
import com.bootgesicht.financeplanner.model.Subcategory;
import com.bootgesicht.financeplanner.repository.CategoryRepository;
import com.bootgesicht.financeplanner.repository.SubcategoryRepository;

@Service
public class SubcategoryService {

    private final SubcategoryRepository subcategoryRepository;
    private final CategoryRepository categoryRepository;

    public SubcategoryService(
            SubcategoryRepository subcategoryRepository,
            CategoryRepository categoryRepository) {
        this.subcategoryRepository = subcategoryRepository;
        this.categoryRepository = categoryRepository;
    }

    public List<Subcategory> getAllSubcategories() {
        return getAllSubcategories(false);
    }

    public List<Subcategory> getAllSubcategories(boolean includeArchived) {
        return subcategoryRepository.findAll(includeArchived);
    }

    public Subcategory getSubcategoryById(int id) {
        return requireSubcategory(id);
    }

    public Subcategory getSubcategoryByName(String name) {
        return subcategoryRepository.findByName(name);
    }

    public List<Subcategory> getSubcategoriesByCategoryId(int categoryId) {
        return getSubcategoriesByCategoryId(categoryId, false);
    }

    public List<Subcategory> getSubcategoriesByCategoryId(int categoryId, boolean includeArchived) {
        return subcategoryRepository.getSubcategoriesByCategoryId(categoryId, includeArchived);
    }

    public void createSubcategory(Subcategory subcategory) {
        ensureActiveCategory(subcategory.getCategoryId());
        ensureUniqueName(subcategory.getName(), subcategory.getCategoryId(), null);
        subcategoryRepository.save(subcategory);
    }

    public void createSubcategory(SubcategoryRequest request) {
        String name = normalizeName(request.getName());
        ensureActiveCategory(request.getCategoryId());
        ensureUniqueName(name, request.getCategoryId(), null);
        subcategoryRepository.save(new Subcategory(0, request.getCategoryId(), name));
    }

    public void renameSubcategory(int id, NameUpdateRequest request) {
        Subcategory subcategory = requireSubcategory(id);
        String name = normalizeName(request.getName());
        ensureUniqueName(name, subcategory.getCategoryId(), id);
        subcategoryRepository.updateName(id, name);
    }

    public void archiveSubcategory(int id) {
        requireSubcategory(id);
        subcategoryRepository.setArchived(id, true);
    }

    public void reactivateSubcategory(int id) {
        requireSubcategory(id);
        subcategoryRepository.setArchived(id, false);
    }

    public DeletionImpactResponse getDeletionImpact(int id) {
        requireSubcategory(id);
        int entryCount = subcategoryRepository.countEntries(id);
        String reason = entryCount == 0
                ? null
                : "Diese Subkategorie wird noch von " + entryCount
                        + " Eintrag/Einträgen verwendet und kann deshalb nicht gelöscht werden.";
        return new DeletionImpactResponse(entryCount == 0, 0, entryCount, reason);
    }

    public void deleteSubcategoryById(int id) {
        DeletionImpactResponse impact = getDeletionImpact(id);
        if (!impact.deletable()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, impact.reason());
        }
        subcategoryRepository.deleteById(id);
    }

    private Subcategory requireSubcategory(int id) {
        Subcategory subcategory = subcategoryRepository.findById(id);
        if (subcategory == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Subkategorie wurde nicht gefunden.");
        }
        return subcategory;
    }

    private void ensureActiveCategory(int categoryId) {
        Category category = categoryRepository.findById(categoryId);
        if (category == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Die gewählte Kategorie existiert nicht.");
        }
        if (category.isArchived()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Unter einer archivierten Kategorie kann keine neue Subkategorie erstellt werden.");
        }
    }

    private String normalizeName(String name) {
        if (name == null || name.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bitte einen Subkategorienamen angeben.");
        }
        return name.trim();
    }

    private void ensureUniqueName(String name, int categoryId, Integer excludedId) {
        if (subcategoryRepository.findByNameAndCategoryExcludingId(name, categoryId, excludedId) != null) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Eine Subkategorie mit diesem Namen existiert in der Kategorie bereits.");
        }
    }
}
