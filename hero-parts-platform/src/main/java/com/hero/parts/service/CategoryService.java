package com.hero.parts.service;

import com.hero.parts.dto.CategoryDTO;
import com.hero.parts.exception.DuplicateResourceException;
import com.hero.parts.exception.ResourceNotFoundException;
import com.hero.parts.model.Category;
import com.hero.parts.repository.CategoryRepository;
import com.hero.parts.repository.PartRepository;
import com.hero.parts.util.PartMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final PartRepository partRepository;
    private final PartMapper partMapper;

    public List<CategoryDTO> getAll() {
        return categoryRepository.findAll().stream()
                .map(c -> partMapper.toCategoryDTO(c, partRepository.countByCategoryId(c.getId())))
                .collect(Collectors.toList());
    }

    public List<CategoryDTO> getTopLevel() {
        return categoryRepository.findAllTopLevelWithChildren().stream()
                .map(c -> partMapper.toCategoryDTO(c, partRepository.countByCategoryId(c.getId())))
                .collect(Collectors.toList());
    }

    public CategoryDTO getById(Long id) {
        Category category = findOrThrow(id);
        return partMapper.toCategoryDTO(category, partRepository.countByCategoryId(id));
    }

    @Transactional
    public CategoryDTO create(String name, String description, Long parentId) {
        if (categoryRepository.existsByNameIgnoreCase(name)) {
            throw new DuplicateResourceException("Category", "name", name);
        }
        Category parent = parentId != null ? findOrThrow(parentId) : null;
        Category category = Category.builder()
                .name(name)
                .description(description)
                .parent(parent)
                .build();
        return partMapper.toCategoryDTO(categoryRepository.save(category), 0);
    }

    @Transactional
    public CategoryDTO update(Long id, String name, String description, Long parentId) {
        Category category = findOrThrow(id);
        if (!category.getName().equalsIgnoreCase(name) &&
                categoryRepository.existsByNameIgnoreCase(name)) {
            throw new DuplicateResourceException("Category", "name", name);
        }
        Category parent = parentId != null ? findOrThrow(parentId) : null;
        category.setName(name);
        category.setDescription(description);
        category.setParent(parent);
        return partMapper.toCategoryDTO(categoryRepository.save(category),
                partRepository.countByCategoryId(id));
    }

    @Transactional
    public void delete(Long id) {
        Category category = findOrThrow(id);
        long partCount = partRepository.countByCategoryId(id);
        if (partCount > 0) {
            throw new IllegalArgumentException(
                    "Cannot delete category with " + partCount + " associated parts");
        }
        categoryRepository.delete(category);
    }

    private Category findOrThrow(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
    }
}