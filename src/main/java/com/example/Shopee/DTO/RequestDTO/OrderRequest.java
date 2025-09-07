package com.example.Shopee.DTO.RequestDTO;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderRequest {
    Integer itemID;
    Integer variantID;
    Integer quantity;
    String delivery;
    Integer addressID;
}
