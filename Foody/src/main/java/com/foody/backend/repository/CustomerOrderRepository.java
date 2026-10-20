package com.foody.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.foody.backend.entity.CustomerOrder;

public interface CustomerOrderRepository
extends JpaRepository<CustomerOrder, Long> {
}