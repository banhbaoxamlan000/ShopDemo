package com.example.Shopee.Mapper;

import com.example.Shopee.DTO.RequestDTO.VariantRequest;
import com.example.Shopee.DTO.ResponseDTO.VariantResponse;
import com.example.Shopee.Entity.Variant;
import org.mapstruct.Mapper;
import org.springframework.stereotype.Component;

@Mapper(componentModel ="Spring")
public interface VariantMapper {
    Variant toVariant(VariantRequest variant);

    VariantResponse toVariantResponse(Variant variant);
}
