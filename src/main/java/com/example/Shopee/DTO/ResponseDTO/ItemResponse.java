package com.example.Shopee.DTO.ResponseDTO;


import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class ItemResponse {
    Integer itemID;
    String name;
    Double price;
    Integer quantity = 0;
    Double rate = 0.0;
    Integer liked = 0;
    String description;
    List<String> imageID;
    Set<AttributeResponse> attributeResponses;
    CategoryResponse category;
}
