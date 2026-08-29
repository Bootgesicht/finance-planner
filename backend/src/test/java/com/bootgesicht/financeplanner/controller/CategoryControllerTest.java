package com.bootgesicht.financeplanner.controller;

import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.server.ResponseStatusException;

import com.bootgesicht.financeplanner.model.Category;
import com.bootgesicht.financeplanner.model.CategoryKind;
import com.bootgesicht.financeplanner.service.CategoryService;

@ExtendWith(MockitoExtension.class)
class CategoryControllerTest {

    @Mock
    private CategoryService service;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(new CategoryController(service))
                .setControllerAdvice(new ApiExceptionHandler())
                .build();
    }

    @Test
    void archivedCategoriesAreReturnedOnlyWhenExplicitlyRequested() throws Exception {
        when(service.getAllCategories(true)).thenReturn(List.of(
                new Category(1, "Alt", CategoryKind.EXPENSE, true)));

        mockMvc.perform(get("/categories").param("includeArchived", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].archived").value(true));

        verify(service).getAllCategories(true);
    }

    @Test
    void guardedDeleteReturnsConflictWithAnUnderstandableMessage() throws Exception {
        doThrow(new ResponseStatusException(HttpStatus.CONFLICT, "Kategorie enthält noch Subkategorien."))
                .when(service).deleteCategoryById(1);

        mockMvc.perform(delete("/categories/1"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.message").value("Kategorie enthält noch Subkategorien."));
    }
}
