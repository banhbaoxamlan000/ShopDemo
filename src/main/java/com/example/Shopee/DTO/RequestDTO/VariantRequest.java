package com.example.Shopee.DTO.RequestDTO;

import com.example.Shopee.Entity.Attribute;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class VariantRequest {
    Integer quantity;
    Double price;
    @JsonProperty("SKU")
    String SKU;
    Set<Attribute> attribute;
    ImageRequest pictures;
}
