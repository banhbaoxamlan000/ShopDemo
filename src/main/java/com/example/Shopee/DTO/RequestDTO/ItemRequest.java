package com.example.Shopee.DTO.RequestDTO;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class ItemRequest {
    String name;
    Double price;
    Integer quantity = 0;
    Double rate = 0.0;
    Integer liked = 0;
    Set<VariantRequest> variants;
    CategoryRequest category;
    String description;
    List<ImageRequest> pictures;
}
