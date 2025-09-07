package com.example.Shopee.Repository;

import com.example.Shopee.Entity.Cart;
import com.example.Shopee.Entity.CartItem;
import com.example.Shopee.Entity.Item;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Set;

public interface CartItemRepository extends JpaRepository<CartItem, Integer> {
    void deleteByItem(Item item);
    Set<CartItem> findByCart(Cart cart);

}
