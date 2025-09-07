package com.example.Shopee.Mapper;

import com.example.Shopee.DTO.ResponseDTO.ReviewResponse;
import com.example.Shopee.Entity.Review;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "Spring")
public interface ReviewMapper {

    @Mapping(target = "feedback", source = "feedback")
    @Mapping(target = "rate", source = "rate")
    @Mapping(target = "date", source = "date")
    ReviewResponse toReviewResponse(Review review);
}
