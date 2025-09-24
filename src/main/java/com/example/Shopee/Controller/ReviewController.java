package com.example.Shopee.Controller;

import com.example.Shopee.DTO.ApiResponse;
import com.example.Shopee.DTO.RequestDTO.ReviewRequest;
import com.example.Shopee.DTO.ResponseDTO.ReviewResponse;
import com.example.Shopee.Service.ReviewService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@RestController
@RequestMapping("/review")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ReviewController {
    ReviewService reviewService;

    @PostMapping("/write")
    ApiResponse<Set<ReviewResponse>> writeReview(@RequestBody ReviewRequest request)
    {
        return ApiResponse.<Set<ReviewResponse>>builder()
                .result(reviewService.writeFeedback(request))
                .build();
    }

    @GetMapping("/{itemID}")
    ApiResponse<Set<ReviewResponse>> getReview(@PathVariable("itemID") Integer itemID)
    {
        return ApiResponse.<Set<ReviewResponse>>builder()
                .result(reviewService.getFeedback(itemID))
                .build();
    }
}
