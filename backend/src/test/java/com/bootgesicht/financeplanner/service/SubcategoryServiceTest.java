package com.bootgesicht.financeplanner.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.bootgesicht.financeplanner.dto.NameUpdateRequest;
import com.bootgesicht.financeplanner.dto.SubcategoryRequest;
import com.bootgesicht.financeplanner.model.Category;
import com.bootgesicht.financeplanner.model.CategoryKind;
import com.bootgesicht.financeplanner.model.Subcategory;
import com.bootgesicht.financeplanner.repository.CategoryRepository;
import com.bootgesicht.financeplanner.repository.SubcategoryRepository;

@ExtendWith(MockitoExtension.class)
class SubcategoryServiceTest {

    @Mock
    private SubcategoryRepository repository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private NameUpdateRequest renameRequest;

    @Mock
    private SubcategoryRequest createRequest;

    private SubcategoryService service;

    @BeforeEach
    void setUp() {
        service = new SubcategoryService(repository, categoryRepository);
    }

    @Test
    void renameRejectsDuplicatesOnlyInsideTheSameCategory() {
        when(repository.findById(1)).thenReturn(new Subcategory(1, 10, "Strom"));
        when(renameRequest.getName()).thenReturn(" Energie ");

        service.renameSubcategory(1, renameRequest);
        verify(repository).updateName(1, "Energie");

        when(repository.findByNameAndCategoryExcludingId("Energie", 10, 1))
                .thenReturn(new Subcategory(2, 10, "ENERGIE"));
        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.renameSubcategory(1, renameRequest));
        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
    }

    @Test
    void subcategoriesCannotBeCreatedBelowArchivedCategories() {
        when(createRequest.getName()).thenReturn("Neu");
        when(createRequest.getCategoryId()).thenReturn(10);
        when(categoryRepository.findById(10))
                .thenReturn(new Category(10, "Alt", CategoryKind.EXPENSE, true));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.createSubcategory(createRequest));

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        verify(repository, never()).save(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void usedSubcategoryCannotBeDeletedButCanBeArchived() {
        Subcategory subcategory = new Subcategory(1, 10, "Strom");
        when(repository.findById(1)).thenReturn(subcategory);
        when(repository.countEntries(1)).thenReturn(184);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.deleteSubcategoryById(1));
        service.archiveSubcategory(1);

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        verify(repository, never()).deleteById(1);
        verify(repository).setArchived(1, true);
    }

    @Test
    void unusedSubcategoryCanBeDeleted() {
        when(repository.findById(1)).thenReturn(new Subcategory(1, 10, "Test", true));

        service.deleteSubcategoryById(1);

        verify(repository).deleteById(1);
    }
}
