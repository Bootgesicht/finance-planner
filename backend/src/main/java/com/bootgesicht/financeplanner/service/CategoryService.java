package com.bootgesicht.financeplanner.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.bootgesicht.financeplanner.dto.CategoryRequest;
import com.bootgesicht.financeplanner.dto.DeletionImpactResponse;
import com.bootgesicht.financeplanner.dto.NameUpdateRequest;
import com.bootgesicht.financeplanner.model.Category;
import com.bootgesicht.financeplanner.repository.CategoryRepository;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<Category> getAllCategories() {
        return getAllCategories(false);
    }

    public List<Category> getAllCategories(boolean includeArchived) {
        return categoryRepository.findAll(includeArchived);
    }

    public Category getCategoryById(int id) {
        return requireCategory(id);
    }

    public Category getCategoryByName(String name) {
        return categoryRepository.findByName(name);
    }

    public void createCategory(Category category) {
        ensureUniqueName(category.getCategoryName(), null);
        categoryRepository.save(category);
    }

    public void createCategory(CategoryRequest request) {
        String name = normalizeName(request.getName());
        if (request.getKind() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bitte eine Kategorieart angeben.");
        }

        ensureUniqueName(name, null);
        categoryRepository.save(new Category(0, name, request.getKind()));
    }

    public void renameCategory(int id, NameUpdateRequest request) {
        requireCategory(id);
        String name = normalizeName(request.getName());
        ensureUniqueName(name, id);
        categoryRepository.updateName(id, name);
    }

    public void archiveCategory(int id) {
        requireCategory(id);
        categoryRepository.setArchived(id, true);
    }

    public void reactivateCategory(int id) {
        requireCategory(id);
        categoryRepository.setArchived(id, false);
    }

    public DeletionImpactResponse getDeletionImpact(int id) {
        requireCategory(id);
        int subcategoryCount = categoryRepository.countSubcategories(id);
        int entryCount = categoryRepository.countEntries(id);
        boolean deletable = subcategoryCount == 0 && entryCount == 0;

        String reason = null;
        if (!deletable) {
            reason = buildDeletionReason(subcategoryCount, entryCount);
        }

        return new DeletionImpactResponse(deletable, subcategoryCount, entryCount, reason);
    }

    public void deleteCategoryById(int id) {
        DeletionImpactResponse impact = getDeletionImpact(id);
        if (!impact.deletable()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, impact.reason());
        }
        categoryRepository.deleteById(id);
    }

    private Category requireCategory(int id) {
        Category category = categoryRepository.findById(id);
        if (category == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Kategorie wurde nicht gefunden.");
        }
        return category;
    }

    private String normalizeName(String name) {
        if (name == null || name.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bitte einen Kategorienamen angeben.");
        }
        return name.trim();
    }

    private void ensureUniqueName(String name, Integer excludedId) {
        if (categoryRepository.findByNameExcludingId(name, excludedId) != null) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Eine Kategorie mit diesem Namen existiert bereits.");
        }
    }

    private String buildDeletionReason(int subcategoryCount, int entryCount) {
        if (subcategoryCount > 0 && entryCount > 0) {
            return "Diese Kategorie enthält noch " + subcategoryCount + " Subkategorie(n) und wird von "
                    + entryCount + " Eintrag/Einträgen verwendet. Ordne die Einträge um und lösche anschließend "
                    + "die Subkategorien.";
        }
        if (subcategoryCount > 0) {
            return "Diese Kategorie enthält noch " + subcategoryCount
                    + " Subkategorie(n). Lösche zuerst die nicht mehr benötigten Subkategorien.";
        }
        return "Diese Kategorie wird noch von " + entryCount
                + " Eintrag/Einträgen verwendet und kann deshalb nicht gelöscht werden.";
    }
}
