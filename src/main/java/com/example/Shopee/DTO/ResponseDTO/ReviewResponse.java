package com.example.Shopee.DTO.ResponseDTO;

import com.example.Shopee.DTO.RequestDTO.ImageRequest;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class ReviewResponse {
    List<String> pictureID;
    String username;
    String feedback;
    LocalDate date;
    @Size(min = 1, max = 5)
    Integer rate;
}
