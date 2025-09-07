package com.example.Shopee.Repository;

import com.example.Shopee.Entity.Shop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ShopRepository extends JpaRepository<Shop, String> {
    Optional<Shop> findByShopNameIgnoreCase(String name);

    Optional<Shop> findByUsername(String username);

    List<Shop> findByShopNameContainingIgnoreCaseOrderByRate(String name);

    boolean existsByTaxNumber(String tax);
    boolean existsByShopName(String shopName);
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
    boolean existsByUsername(String userName);

}
