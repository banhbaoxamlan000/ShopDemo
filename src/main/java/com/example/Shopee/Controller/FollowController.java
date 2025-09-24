package com.example.Shopee.Controller;

import com.example.Shopee.DTO.ApiResponse;
import com.example.Shopee.DTO.RequestDTO.FollowRequest;
import com.example.Shopee.DTO.ResponseDTO.FollowResponse;
import com.example.Shopee.Service.FollowService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@RestController
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class FollowController {

    FollowService followService;

    @PutMapping("/user/follow")
    ApiResponse<Boolean> isFollow(@RequestBody FollowRequest request)
    {
        return ApiResponse.<Boolean>builder()
                .result(followService.isFollow(request))
                .build();
    }

    @PostMapping("/user/follow")
    ApiResponse<String> followShop(@RequestBody FollowRequest request)
    {
        return ApiResponse.<String>builder()
                .result(followService.followShop(request))
                .build();
    }

    @DeleteMapping("/user/follow")
    ApiResponse<String> unfollow(@RequestBody FollowRequest request)
    {
        followService.unfollowShop(request);
        return ApiResponse.<String>builder()
                .result("Unfollowed")
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
