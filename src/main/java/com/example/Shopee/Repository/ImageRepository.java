package com.example.Shopee.Repository;

import com.example.Shopee.DTO.RequestDTO.ImageRequest;
import com.example.Shopee.Entity.Image;
import com.example.Shopee.Entity.Item;
import com.example.Shopee.Entity.Review;
import com.example.Shopee.Entity.Variant;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImageRepository extends JpaRepository<Image, String> {
    List<Image> findByItem(Item item);

    void deleteByItem(Item item);

    List<Image> findByReview(Review review);
}
