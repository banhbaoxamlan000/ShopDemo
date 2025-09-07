package com.example.Shopee.Repository;

import com.example.Shopee.DTO.RequestDTO.ImageRequest;
import com.example.Shopee.Entity.Image;
import com.example.Shopee.Entity.Variant;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ImageRepository extends JpaRepository<Image, Integer> {

}
