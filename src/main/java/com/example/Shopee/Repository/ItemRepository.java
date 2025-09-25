package com.example.Shopee.Repository;


import com.example.Shopee.Entity.Category;
import com.example.Shopee.Entity.Item;
import com.example.Shopee.Entity.Shop;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import javax.swing.text.html.Option;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface ItemRepository extends JpaRepository<Item, Integer> {
    boolean existsByNameAndShop_ShopID(String name, String shopID);

    Optional<Item> findByName(String name);

    List<Item> findByNameContainingIgnoreCaseOrderByRateAsc(String search);

    Set<Item> findByCategory(Category category);

    Set<Item> findByShop(Shop shop);

    @Query(value = "SELECT * FROM item i " +
            "WHERE (:minPrice IS NULL OR i.price >= :minPrice) " +
            "AND (:maxPrice IS NULL OR i.price <= :maxPrice) " +
            "AND (:rate IS NULL OR i.rate >= :rate) " +
            "AND (:search IS NULL OR LOWER(i.name) LIKE LOWER(CONCAT('%', :search, '%'))) ",
            nativeQuery = true)
    Set<Item> findByCriteria(@Param("minPrice") Double minPrice,
                             @Param("maxPrice") Double maxPrice,
                             @Param("rate") Double rate,
                             @Param("search") String search);
}
