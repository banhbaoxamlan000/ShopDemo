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
public class ItemUpdateRequest {
    Integer itemID;
    String name;
    Double price;
    Integer quantity ;
    Set<VariantRequest> variants;
    CategoryRequest category;
    String description;

    List<ImageRequest> pictures;
}
