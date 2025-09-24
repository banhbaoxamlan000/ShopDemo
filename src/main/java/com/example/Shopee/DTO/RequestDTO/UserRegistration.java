package com.example.Shopee.DTO.RequestDTO;

import com.example.Shopee.Entity.Image;
import com.example.Shopee.Validator.DobConstraint;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class UserRegistration {
    @Size(min = 8, message = "USERNAME_INVALID")
    String username;
    String firstName;
    String lastName;
    String gender;
    @Size(min = 8, message = "PASSWORD_INVALID")
    String password;
    @DobConstraint(min = 13, message = "INVALID_DOB")
    LocalDate dob;

    @Size(min = 6)
    String email;

    @Size(min = 10, max = 10)
    String phone;

}
