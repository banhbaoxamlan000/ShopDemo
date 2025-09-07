package com.example.Shopee.Mapper;


import com.example.Shopee.DTO.RequestDTO.ShopRequest;
import com.example.Shopee.DTO.ResponseDTO.ShopResponse;
import com.example.Shopee.Entity.Shop;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "Spring")
public interface ShopMapper {
    Shop toShop(ShopRequest request);


    @Mapping(target = "shopName", source = "shopName")
    @Mapping(target = "pictures", ignore = true)
    @Mapping(target = "rate", source = "rate")
    @Mapping(target = "ratings", source = "ratings")
    @Mapping(target = "followers", source = "followers")
    ShopResponse toShopResponse(Shop shop);

}
