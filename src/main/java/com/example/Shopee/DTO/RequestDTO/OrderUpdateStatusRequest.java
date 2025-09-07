package com.example.Shopee.DTO.RequestDTO;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderUpdateStatusRequest {
    Integer orderID;
    Integer statusCode;
}
