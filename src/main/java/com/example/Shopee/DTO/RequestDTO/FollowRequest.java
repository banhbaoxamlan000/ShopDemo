package com.example.Shopee.DTO.RequestDTO;


import lombok.*;
import lombok.experimental.FieldDefaults;

@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Data
@Builder
public class FollowRequest {
    String followingId;
}
