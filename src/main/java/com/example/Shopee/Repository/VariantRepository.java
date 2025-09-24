package com.example.Shopee.Repository;

import com.example.Shopee.Entity.Item;
import com.example.Shopee.Entity.Variant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VariantRepository extends JpaRepository<Variant, Integer> {
}
