package com.example.Shopee.Entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
@Embeddable
public class ShopAddress {

    String city;
    String district;
    String ward;
    String detail;

}
