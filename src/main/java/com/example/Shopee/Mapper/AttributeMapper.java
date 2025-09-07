package com.example.Shopee.Mapper;

import com.example.Shopee.DTO.ResponseDTO.AttributeResponse;
import com.example.Shopee.Entity.Attribute;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "Spring")
public interface AttributeMapper {

    @Mapping(target = "name", source = "name")
    @Mapping(target = "value", source = "value")
    AttributeResponse toAttributeResponse(Attribute attribute);
}
