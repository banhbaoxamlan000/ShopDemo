package com.example.Shopee.DTO.ResponseDTO;

import com.example.Shopee.Entity.Attribute;
import com.example.Shopee.Entity.Variant;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Set;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VariantResponse {
    String shopName;
    String itemName;
    Set<AttributeResponse> attributes;
    String SKU;
    int quantity;
    Double price;
    ImageResponse pictures;
}
