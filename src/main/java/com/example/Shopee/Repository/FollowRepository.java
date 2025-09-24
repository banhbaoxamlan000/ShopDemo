package com.example.Shopee.Repository;

import com.example.Shopee.Entity.Follow;
import com.example.Shopee.Entity.Shop;
import com.example.Shopee.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.Set;

@Repository
public interface FollowRepository extends JpaRepository<Follow, Integer> {
    boolean existsByUserAndShop(User user, Shop shop);

    Set<Follow> findByUser(User user);
    Set<Follow> findByShop(Shop shop);

    Optional<Follow> findByUserAndShop(User user, Shop shop);

    void deleteByUserAndShop(User user, Shop shop);
}
