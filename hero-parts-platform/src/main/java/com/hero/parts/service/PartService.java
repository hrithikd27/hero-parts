package com.hero.parts.service;

import com.hero.parts.dto.AliasCreateRequest;
import com.hero.parts.dto.PartCreateRequest;
import com.hero.parts.dto.PartDTO;
import com.hero.parts.exception.DuplicateResourceException;
import com.hero.parts.exception.ResourceNotFoundException;
import com.hero.parts.model.Category;
import com.hero.parts.model.Part;
import com.hero.parts.model.SearchAlias;
import com.hero.parts.repository.CategoryRepository;
import com.hero.parts.repository.PartRepository;
import com.hero.parts.repository.SearchAliasRepository;
import com.hero.parts.util.PartMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PartService {

    private final PartRepository partRepository;
    private final CategoryRepository categoryRepository;
    private final SearchAliasRepository aliasRepository;
    private final PartMapper partMapper;

    public List<PartDTO> getAll() {
        return partRepository.findAll().stream()
                .map(partMapper::toDTO)
                .collect(Collectors.toList());
    }

    public Page<PartDTO> getAllPaged(Pageable pageable) {
        return partRepository.findAll(pageable).map(partMapper::toDTO);
    }

    public Page<PartDTO> getAllPaged(Pageable pageable, Long categoryId, String model) {
        String modelFilter = (model != null && !model.isBlank() && !"All Models".equalsIgnoreCase(model.trim()))
                ? model.trim() : null;
        if (categoryId == null && modelFilter == null) {
            return partRepository.findAll(pageable).map(partMapper::toDTO);
        }
        return partRepository.findAllFiltered(categoryId, modelFilter, pageable).map(partMapper::toDTO);
    }

    public PartDTO getById(Long id) {
        return partMapper.toDTO(findOrThrow(id));
    }

    public PartDTO getBySku(String sku) {
        return partMapper.toDTO(
                partRepository.findBySkuIgnoreCase(sku)
                        .orElseThrow(() -> new ResourceNotFoundException("Part", "SKU", sku))
        );
    }

    public List<PartDTO> getByCategory(Long categoryId) {
        categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", categoryId));
        return partRepository.findByCategoryId(categoryId).stream()
                .map(partMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<PartDTO> getInStock() {
        return partRepository.findByInStockTrue().stream()
                .map(partMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<PartDTO> getByCompatibleModel(String model) {
        return partRepository.findByCompatibleModel(model.trim()).stream()
                .map(partMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public PartDTO create(PartCreateRequest req) {
        if (partRepository.existsBySkuIgnoreCase(req.getSku())) {
            throw new DuplicateResourceException("Part", "SKU", req.getSku());
        }
        Category category = req.getCategoryId() != null
                ? categoryRepository.findById(req.getCategoryId())
                        .orElseThrow(() -> new ResourceNotFoundException("Category", "id", req.getCategoryId()))
                : null;

        Part part = Part.builder()
                .sku(req.getSku().toUpperCase())
                .name(req.getName())
                .hindiName(req.getHindiName())
                .description(req.getDescription())
                .category(category)
                .price(req.getPrice())
                .mrp(req.getMrp())
                .unit(req.getUnit() != null ? req.getUnit() : "PCS")
                .compatibleModels(req.getCompatibleModels())
                .eshopUrl(req.getEshopUrl())
                .imageUrl(req.getImageUrl())
                .inStock(req.getInStock() != null ? req.getInStock() : true)
                .stockQty(req.getStockQty() != null ? req.getStockQty() : 0)
                .build();
        return partMapper.toDTO(partRepository.save(part));
    }

    @Transactional
    public PartDTO update(Long id, PartCreateRequest req) {
        Part part = findOrThrow(id);

        if (!part.getSku().equalsIgnoreCase(req.getSku()) &&
                partRepository.existsBySkuIgnoreCase(req.getSku())) {
            throw new DuplicateResourceException("Part", "SKU", req.getSku());
        }

        Category category = req.getCategoryId() != null
                ? categoryRepository.findById(req.getCategoryId())
                        .orElseThrow(() -> new ResourceNotFoundException("Category", "id", req.getCategoryId()))
                : null;

        part.setSku(req.getSku().toUpperCase());
        part.setName(req.getName());
        part.setHindiName(req.getHindiName());
        part.setDescription(req.getDescription());
        part.setCategory(category);
        part.setPrice(req.getPrice());
        part.setMrp(req.getMrp());
        if (req.getUnit() != null) part.setUnit(req.getUnit());
        part.setCompatibleModels(req.getCompatibleModels());
        part.setEshopUrl(req.getEshopUrl());
        part.setImageUrl(req.getImageUrl());
        if (req.getInStock() != null) part.setInStock(req.getInStock());
        if (req.getStockQty() != null) part.setStockQty(req.getStockQty());

        return partMapper.toDTO(partRepository.save(part));
    }

    @Transactional
    public PartDTO updateStock(Long id, int qty, boolean inStock) {
        Part part = findOrThrow(id);
        part.setStockQty(qty);
        part.setInStock(inStock);
        return partMapper.toDTO(partRepository.save(part));
    }

    @Transactional
    public void delete(Long id) {
        Part part = findOrThrow(id);
        partRepository.delete(part);
    }

    // Alias management
    @Transactional
    public PartDTO addAlias(AliasCreateRequest req) {
        Part part = findOrThrow(req.getPartId());

        if (aliasRepository.existsByPartIdAndAliasIgnoreCase(req.getPartId(), req.getAlias())) {
            throw new DuplicateResourceException("Alias", "alias", req.getAlias());
        }

        SearchAlias alias = SearchAlias.builder()
                .part(part)
                .alias(req.getAlias().toLowerCase())
                .aliasType(req.getAliasType())
                .language(req.getLanguage() != null ? req.getLanguage() : "hi")
                .build();
        aliasRepository.save(alias);
        return partMapper.toDTO(findOrThrow(req.getPartId()));
    }

    @Transactional
    public void deleteAlias(Long aliasId) {
        if (!aliasRepository.existsById(aliasId)) {
            throw new ResourceNotFoundException("Alias", "id", aliasId);
        }
        aliasRepository.deleteById(aliasId);
    }

    private Part findOrThrow(Long id) {
        return partRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Part", "id", id));
    }
}