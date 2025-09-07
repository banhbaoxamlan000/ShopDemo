package com.example.Shopee.Repository;

import com.example.Shopee.Entity.OrderItem;
import com.example.Shopee.Entity.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Set;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Integer> {
    Set<OrderItem> findByItems(Item item);
}
