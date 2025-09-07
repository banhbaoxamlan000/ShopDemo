package com.example.Shopee.DTO.RequestDTO;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AddressRequest {
    @Size(min = 10, max = 10, message = "PHONE_INVALID")
    String phone;
    @NotBlank(message = "BLANK_CITY")
    String city;
    @NotBlank(message = "BLANK_DISTRICT")
    String district;
    @NotBlank(message = "BLANK_WARD")
    String ward;
    String detail;
}
