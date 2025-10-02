package com.example.Shopee.DTO.ResponseDTO;

import com.example.Shopee.Entity.Cart;
import com.example.Shopee.Entity.Role;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.web.multipart.MultipartFile;

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
    String gender;
    String phone;
    CartResponse cart;
    Set<AddressResponse> addressResponses;
    LocalDate createAt;
}
