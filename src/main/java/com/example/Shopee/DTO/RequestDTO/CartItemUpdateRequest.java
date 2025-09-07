package com.example.Shopee.DTO.RequestDTO;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class CartItemUpdateRequest {
    Integer cartItemID;
    Integer quantity;
}
