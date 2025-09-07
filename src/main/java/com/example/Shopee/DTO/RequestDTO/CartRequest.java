package com.example.Shopee.DTO.RequestDTO;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CartRequest {
    Integer variantID;
    Integer quantity;
}
