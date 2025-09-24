package com.example.Shopee.DTO.ResponseDTO;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class SearchItemResponse {
    String itemID;
    String name;
    Double price;
    Integer quantity ;
    Double rate  ;
    Integer liked ;
    String imageID;
}
