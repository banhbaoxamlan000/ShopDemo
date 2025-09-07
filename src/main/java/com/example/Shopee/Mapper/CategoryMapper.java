package com.example.Shopee.Mapper;


import com.example.Shopee.DTO.ResponseDTO.CategoryResponse;
import com.example.Shopee.Entity.Category;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.awt.*;

@Mapper(componentModel = "Spring")
public interface CategoryMapper {

    @Mapping(target = "name", source = "name")
    @Mapping(target = "detail", source = "detail")
    CategoryResponse toCategoryResponse(Category category);
}
