package com.hero.parts.service;

import com.hero.parts.dto.DealerDTO;
import com.hero.parts.exception.DuplicateResourceException;
import com.hero.parts.exception.ResourceNotFoundException;
import com.hero.parts.model.Dealer;
import com.hero.parts.repository.DealerRepository;
import com.hero.parts.util.PartMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DealerService {

    private final DealerRepository dealerRepository;
    private final PartMapper partMapper;

    public List<DealerDTO> getAll() {
        return dealerRepository.findAll().stream()
                .map(partMapper::toDealerDTO)
                .collect(Collectors.toList());
    }

    public List<DealerDTO> getActive() {
        return dealerRepository.findByActiveTrue().stream()
                .map(partMapper::toDealerDTO)
                .collect(Collectors.toList());
    }

    public DealerDTO getById(Long id) {
        return partMapper.toDealerDTO(findOrThrow(id));
    }

    public DealerDTO getByCode(String code) {
        return partMapper.toDealerDTO(
                dealerRepository.findByDealerCodeIgnoreCase(code)
                        .orElseThrow(() -> new ResourceNotFoundException("Dealer", "code", code))
        );
    }

    public List<DealerDTO> getByCity(String city) {
        return dealerRepository.findByCityIgnoreCase(city).stream()
                .map(partMapper::toDealerDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public DealerDTO create(DealerDTO req) {
        if (dealerRepository.existsByDealerCodeIgnoreCase(req.getDealerCode())) {
            throw new DuplicateResourceException("Dealer", "dealerCode", req.getDealerCode());
        }
        Dealer dealer = Dealer.builder()
                .dealerCode(req.getDealerCode().toUpperCase())
                .name(req.getName())
                .contactName(req.getContactName())
                .phone(req.getPhone())
                .email(req.getEmail())
                .city(req.getCity())
                .state(req.getState())
                .pincode(req.getPincode())
                .active(req.getActive() != null ? req.getActive() : true)
                .build();
        return partMapper.toDealerDTO(dealerRepository.save(dealer));
    }

    @Transactional
    public DealerDTO update(Long id, DealerDTO req) {
        Dealer dealer = findOrThrow(id);
        if (!dealer.getDealerCode().equalsIgnoreCase(req.getDealerCode()) &&
                dealerRepository.existsByDealerCodeIgnoreCase(req.getDealerCode())) {
            throw new DuplicateResourceException("Dealer", "dealerCode", req.getDealerCode());
        }
        dealer.setDealerCode(req.getDealerCode().toUpperCase());
        dealer.setName(req.getName());
        dealer.setContactName(req.getContactName());
        dealer.setPhone(req.getPhone());
        dealer.setEmail(req.getEmail());
        dealer.setCity(req.getCity());
        dealer.setState(req.getState());
        dealer.setPincode(req.getPincode());
        dealer.setActive(req.getActive());
        return partMapper.toDealerDTO(dealerRepository.save(dealer));
    }

    @Transactional
    public void toggleActive(Long id) {
        Dealer dealer = findOrThrow(id);
        dealer.setActive(!Boolean.TRUE.equals(dealer.getActive()));
        dealerRepository.save(dealer);
    }

    @Transactional
    public void delete(Long id) {
        dealerRepository.delete(findOrThrow(id));
    }

    private Dealer findOrThrow(Long id) {
        return dealerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dealer", "id", id));
    }
}