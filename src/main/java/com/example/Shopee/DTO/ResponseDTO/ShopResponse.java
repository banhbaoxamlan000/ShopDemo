package com.example.Shopee.DTO.ResponseDTO;


import com.example.Shopee.Entity.ShopAddress;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class ShopResponse {
    String shopID;
    String shopName;
    double rate;
    int ratings ;
    int followers ;
    int totalProduct;
    LocalDate createAt;
}
