package com.foody.backend.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.foody.backend.dto.OrderRequest;
import com.foody.backend.entity.CustomerOrder;
import com.foody.backend.service.OrderService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<?> placeOrder(
            @Valid @RequestBody OrderRequest request) {

        CustomerOrder order = orderService.placeOrder(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(
                Map.of(
                        "message", "Order placed successfully",
                        "orderId", order.getId(),
                        "total", order.getTotalAmount(),
                        "status", order.getStatus()
                )
        );
    }
}
