package com.example.Shopee.DTO.ResponseDTO;

import com.example.Shopee.Entity.Attribute;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class ItemOrderedResponse {
    Integer itemID;
    String itemName;
    Set<AttributeResponse> attributes;
    Double price;
    Integer quantity;
    boolean isReview;
}
