package com.example.Shopee.Repository;

import com.example.Shopee.Entity.Attribute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AttributeRepository extends JpaRepository<Attribute, Integer> {
    boolean existsByNameAndValue(String name, String value);
}
