package com.example.Shopee.Repository;

import com.example.Shopee.Entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Integer> {
    Category findByNameAndDetail(String name, String detail);
    Set<Category> findByName(String name);

}
