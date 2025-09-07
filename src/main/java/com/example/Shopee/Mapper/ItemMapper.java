package com.example.Shopee.Mapper;


import com.example.Shopee.DTO.RequestDTO.ItemRequest;
import com.example.Shopee.DTO.RequestDTO.ItemUpdateRequest;
import com.example.Shopee.DTO.ResponseDTO.ItemResponse;
import com.example.Shopee.DTO.ResponseDTO.SearchItemResponse;
import com.example.Shopee.Entity.Item;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.springframework.stereotype.Component;

@Mapper(componentModel = "Spring")
public interface ItemMapper {
    Item toItem(ItemRequest request);

    @Mapping(target = "variants", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "name", source = "name")
    @Mapping(target = "price", source = "price")
    @Mapping(target = "quantity", source = "quantity")
    @Mapping(target = "rate", source = "rate")
    @Mapping(target = "liked", source = "liked")
    @Mapping(target = "pictures", ignore = true)
    ItemResponse toItemResponse(Item item);

    @Mapping(target = "pictures", ignore = true)
    SearchItemResponse toSearchItemResponse(Item item);

    @Mapping(target = "itemID", ignore = true)
    @Mapping(target = "quantity", source = "quantity")
    @Mapping(target = "category", ignore = true)
    Item updateItem(ItemUpdateRequest request,@MappingTarget Item item);

}
