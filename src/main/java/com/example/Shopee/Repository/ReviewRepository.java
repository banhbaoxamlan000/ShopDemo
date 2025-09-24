package com.example.Shopee.Repository;

import com.example.Shopee.Entity.Item;
import com.example.Shopee.Entity.Review;
import com.example.Shopee.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Set;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Integer> {
    boolean existsByUserAndItem(User user, Item item);

    Set<Review> findByItem(Item item);
}
