package com.example.Shopee.DTO.ResponseDTO;

import com.example.Shopee.Entity.Cart;
import com.example.Shopee.Entity.Role;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class UserResponse {
    String userID;
    String username;
    String firstName;
    String lastName;
    LocalDate dob;
    Set<Role> roles;
    String email;
    String phone;
    ImageResponse pictures;
    Cart cart;
    Set<AddressResponse> addressResponses;
}
