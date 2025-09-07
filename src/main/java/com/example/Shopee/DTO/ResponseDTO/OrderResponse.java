package com.example.Shopee.DTO.ResponseDTO;

import com.example.Shopee.Entity.Attribute;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderResponse {
    String shopName;
    Set<ItemOrderedResponse> items;
    Double total;
    String delivery;
    String orderStatus;
    LocalDateTime date;
    AddressResponse addressResponse;
}
