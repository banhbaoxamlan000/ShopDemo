package com.example.Shopee.DTO.ResponseDTO;

import com.example.Shopee.Entity.Category;
import com.example.Shopee.Entity.Variant;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class SearchItemResponse {
    String itemID;
    String name;
    Double price;
    Integer quantity = 0;
    Double rate = 0.0;
    Integer liked = 0;
    ImageResponse pictures;
}
