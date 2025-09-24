package com.example.Shopee.DTO.ResponseDTO;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Set;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VariantResponse {
    Integer cartItemID;
    Integer itemID;
    Integer variantID;
    String shopID;
    String shopName;
    String itemName;
    Set<AttributeResponse> attributes;
    String SKU;
    int quantity;
    Double price;
}
