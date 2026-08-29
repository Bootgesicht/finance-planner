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

import com.bootgesicht.financeplanner.dto.DeletionImpactResponse;
import com.bootgesicht.financeplanner.dto.NameUpdateRequest;
import com.bootgesicht.financeplanner.model.Category;
import com.bootgesicht.financeplanner.model.CategoryKind;
import com.bootgesicht.financeplanner.repository.CategoryRepository;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock
    private CategoryRepository repository;

    @Mock
    private NameUpdateRequest renameRequest;

    private CategoryService service;

    @BeforeEach
    void setUp() {
        service = new CategoryService(repository);
    }

    @Test
    void renameKeepsTheExistingIdAndRejectsCaseInsensitiveDuplicates() {
        Category category = new Category(1, "Wohnen", CategoryKind.EXPENSE);
        when(repository.findById(1)).thenReturn(category);
        when(renameRequest.getName()).thenReturn(" Mobilität ");

        service.renameCategory(1, renameRequest);

        verify(repository).updateName(1, "Mobilität");

        when(repository.findByNameExcludingId("Mobilität", 1))
                .thenReturn(new Category(2, "MOBILITÄT", CategoryKind.EXPENSE));
        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.renameCategory(1, renameRequest));

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
    }

    @Test
    void archiveAndReactivateOnlyChangeTheStatus() {
        Category category = new Category(1, "Wohnen", CategoryKind.EXPENSE);
        when(repository.findById(1)).thenReturn(category);

        service.archiveCategory(1);
        service.reactivateCategory(1);

        verify(repository).setArchived(1, true);
        verify(repository).setArchived(1, false);
    }

    @Test
    void deleteIsBlockedForSubcategoriesOrIndirectEntries() {
        when(repository.findById(1)).thenReturn(new Category(1, "Wohnen", CategoryKind.EXPENSE));
        when(repository.countSubcategories(1)).thenReturn(2);
        when(repository.countEntries(1)).thenReturn(5);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.deleteCategoryById(1));

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        verify(repository, never()).deleteById(1);
    }

    @Test
    void structurallyFreeCategoryCanBeDeleted() {
        when(repository.findById(1)).thenReturn(new Category(1, "Test", CategoryKind.EXPENSE));

        DeletionImpactResponse impact = service.getDeletionImpact(1);
        service.deleteCategoryById(1);

        assertEquals(true, impact.deletable());
        verify(repository).deleteById(1);
    }
}
