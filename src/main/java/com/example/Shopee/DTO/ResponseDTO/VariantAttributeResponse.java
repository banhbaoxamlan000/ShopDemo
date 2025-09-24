package com.example.Shopee.DTO.ResponseDTO;


import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VariantAttributeResponse {
    Integer variantID;
    Set<String> attributeValue;
    Double price;
    Integer quantity;
}
