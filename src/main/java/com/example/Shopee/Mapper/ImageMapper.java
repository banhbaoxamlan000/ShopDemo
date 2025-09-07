package com.example.Shopee.Mapper;

import com.example.Shopee.DTO.RequestDTO.ImageRequest;
import com.example.Shopee.DTO.ResponseDTO.ImageResponse;
import com.example.Shopee.Entity.Image;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "Spring")
public interface ImageMapper {
    @Mapping(target = "url", source = "url")
    Image toImage(ImageRequest request);

    ImageResponse toImageResponse(Image image);
}
