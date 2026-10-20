package com.foody.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.foody.backend.entity.FoodItem;

public interface FoodItemRepository
extends JpaRepository<FoodItem, Long> {

List<FoodItem> findByAvailableTrue();

List<FoodItem> findByAvailableTrueAndNameContainingIgnoreCase(
    String name);
}
