package com.example.Shopee.DTO.RequestDTO;

import com.example.Shopee.Entity.ShopAddress;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class ShopUpdateRequest {
    @Size(min = 4, max = 30)
    String shopName;
    ShopAddress address;
    String email;
    String phone;
    String taxNumber;
    String business;
}
