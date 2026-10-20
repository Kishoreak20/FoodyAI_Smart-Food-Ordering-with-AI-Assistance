package com.foody.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.foody.backend.entity.FoodItem;
import com.foody.backend.repository.FoodItemRepository;

@Service
public class FoodService {

    private final FoodItemRepository repository;

    public FoodService(FoodItemRepository repository) {
        this.repository = repository;
    }

    public List<FoodItem> getFoods(String search) {
        if (search == null || search.isBlank()) {
            return repository.findByAvailableTrue();
        }

        return repository
                .findByAvailableTrueAndNameContainingIgnoreCase(
                        search.trim());
    }
}