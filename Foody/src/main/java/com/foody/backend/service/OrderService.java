package com.foody.backend.service;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.foody.backend.dto.OrderLineRequest;
import com.foody.backend.dto.OrderRequest;
import com.foody.backend.entity.CustomerOrder;
import com.foody.backend.entity.FoodItem;
import com.foody.backend.entity.OrderItem;
import com.foody.backend.repository.CustomerOrderRepository;
import com.foody.backend.repository.FoodItemRepository;

import jakarta.transaction.Transactional;

@Service
public class OrderService {

    private final FoodItemRepository foodRepository;
    private final CustomerOrderRepository orderRepository;

    public OrderService(
            FoodItemRepository foodRepository,
            CustomerOrderRepository orderRepository) {
        this.foodRepository = foodRepository;
        this.orderRepository = orderRepository;
    }

    @Transactional
    public CustomerOrder placeOrder(OrderRequest request) {
        CustomerOrder order = new CustomerOrder();
        order.setCustomerName(request.customerName().trim());

        BigDecimal total = BigDecimal.ZERO;
        Set<Long> seenFoodIds = new HashSet<>();

        for (OrderLineRequest line : request.items()) {
            if (!seenFoodIds.add(line.foodId())) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Send each food item only once; combine quantities.");
            }

            if (line.quantity() > 50) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Maximum quantity per item is 50.");
            }

            FoodItem food = foodRepository
                    .findById(line.foodId())
                    .filter(FoodItem::isAvailable)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "Food item unavailable: " + line.foodId()));

            BigDecimal lineTotal = food.getPrice()
                    .multiply(BigDecimal.valueOf(line.quantity()));

            total = total.add(lineTotal);

            OrderItem item = new OrderItem();
            item.setFoodItem(food);
            item.setQuantity(line.quantity());
            item.setUnitPrice(food.getPrice());

            order.addItem(item);
        }

        order.setTotalAmount(total);

        return orderRepository.save(order);
    }
}