package com.example.Shopee.DTO.RequestDTO;

import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FeedbackRequest {
    Integer itemID;
    String feedback;
    List<ImageRequest> imageRequests;
    @Size(min = 1, max = 5)
    Integer rate;
}
