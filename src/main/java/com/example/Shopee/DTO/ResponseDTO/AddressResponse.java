package com.example.Shopee.DTO.ResponseDTO;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AddressResponse {
    String phone;
    String city;
    String district;
    String ward;
    String detail;
}
