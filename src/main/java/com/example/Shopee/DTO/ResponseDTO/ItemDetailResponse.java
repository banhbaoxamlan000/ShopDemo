package com.example.Shopee.DTO.ResponseDTO;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ItemDetailResponse {
    ItemResponse item;
    Set<VariantAttributeResponse> variantResponses;
    ShopResponse shop;
    Set<ReviewResponse> reviewResponseSet;
}
