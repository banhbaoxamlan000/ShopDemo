package com.example.Shopee.Repository;

import com.example.Shopee.Entity.Orders;
import com.example.Shopee.Entity.Shop;
import com.example.Shopee.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Set;

@Repository
public interface OrderRepository extends JpaRepository<Orders, Integer> {
    Set<Orders> findByUserAndShopOrderByDateAsc(User user, Shop shop);

    Set<Orders> findByShopOrderByDateAsc(Shop shop);

    Set<Orders> findByUserOrderByDateAsc(User user);
}
