package com.example.Shopee.Controller;

import com.example.Shopee.DTO.ApiResponse;
import com.example.Shopee.DTO.RequestDTO.FollowRequest;
import com.example.Shopee.DTO.ResponseDTO.FollowResponse;
import com.example.Shopee.Service.FollowService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.Set;

@RestController
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class FollowController {

    FollowService followService;

    @PostMapping("/user/follow")
    ApiResponse<String> followShop(@RequestBody FollowRequest request)
    {
        return ApiResponse.<String>builder()
                .result(followService.followShop(request))
                .build();
    }

    @GetMapping("/shop/follower")
    ApiResponse<Set<FollowResponse>> getFollower()
    {
        return ApiResponse.<Set<FollowResponse>>builder()
                .result(followService.getFollower())
                .build();
    }

    @GetMapping("/user/following")
    ApiResponse<Set<FollowResponse>> getFollowing()
    {
        return ApiResponse.<Set<FollowResponse>>builder()
                .result(followService.getFollowing())
                .build();
    }
}
