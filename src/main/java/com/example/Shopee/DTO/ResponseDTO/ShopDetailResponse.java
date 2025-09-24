package com.example.Shopee.DTO.ResponseDTO;


import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Set;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class ShopDetailResponse {
    ShopResponse shopResponse;
    Set<SearchItemResponse> items;

}
