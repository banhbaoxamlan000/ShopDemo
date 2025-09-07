package com.example.Shopee.DTO.RequestDTO;

import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

@FieldDefaults(level = AccessLevel.PRIVATE)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthenticationRequest {
    @Size(min = 8)
    String username;
    @Size(min = 8)
    String password;
}
