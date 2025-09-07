package com.example.Shopee.DTO.ResponseDTO;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class SearchResponse {
    List<ShopResponse> shopResponses;
    List<SearchItemResponse> itemResponse;
}
