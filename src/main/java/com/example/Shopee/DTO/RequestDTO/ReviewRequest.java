package com.example.Shopee.DTO.RequestDTO;

import com.example.Shopee.Entity.Image;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ReviewRequest {
    Integer orderID;
    List<FeedbackRequest> feedbacks;
}
