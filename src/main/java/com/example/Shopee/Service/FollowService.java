package com.example.Shopee.Service;

import com.example.Shopee.DTO.RequestDTO.FollowRequest;
import com.example.Shopee.DTO.ResponseDTO.FollowResponse;
import com.example.Shopee.Entity.Follow;
import com.example.Shopee.Entity.Shop;
import com.example.Shopee.Entity.User;
import com.example.Shopee.Exception.AppException;
import com.example.Shopee.Exception.ErrorCode;
import com.example.Shopee.Repository.FollowRepository;
import com.example.Shopee.Repository.ShopRepository;
import com.example.Shopee.Repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional
public class FollowService {

    FollowRepository followRepository;
    ShopRepository shopRepository;
    UserService userService;
    UserRepository userRepository;

    public String followShop(FollowRequest request)
    {
        Shop shop = shopRepository.findById(request.getFollowingId())
                .orElseThrow(()-> new AppException((ErrorCode.SHOP_NOT_CREATED)));

        var authentication = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findById(userService.getUserID(authentication))
                .orElseThrow(()-> new AppException(ErrorCode.USER_NOT_EXISTED));

        if(followRepository.existsByUserAndShop(user, shop))
        {
            throw new AppException(ErrorCode.ALREADY_FOLLOW);
        }
        Follow follow = Follow.builder()
                        .user(user)
                        .shop(shop)
                        .build();

        followRepository.save(follow);
        int followers =  shop.getFollowers() + 1;
        shop.setFollowers(followers);
        shopRepository.save(shop);
        return "Followed " + shop.getShopName();
    }

    public Set<FollowResponse> getFollowing()
    {
        var authentication = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findById(userService.getUserID(authentication))
                .orElseThrow(()-> new AppException(ErrorCode.USER_NOT_EXISTED));

        Set<Follow> follows = followRepository.findByUser(user);
        Set<FollowResponse> response = new HashSet<>();

        for (Follow f: follows)
        {
            FollowResponse followResponse = FollowResponse.builder()
                    .name(f.getShop().getShopName())
                    .build();
            response.add(followResponse);
        }
        return response;
    }

    public Set<FollowResponse> getFollower()
    {
        var authentication = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findById(userService.getUserID(authentication))
                .orElseThrow(()-> new AppException(ErrorCode.USER_NOT_EXISTED));
        Shop shop = shopRepository.findByUsername(user.getUsername())
                .orElseThrow(()-> new AppException((ErrorCode.SHOP_NOT_CREATED)));

        Set<Follow> follows = followRepository.findByShop(shop);
        Set<FollowResponse> response = new HashSet<>();

        for (Follow f: follows)
        {
            FollowResponse followResponse = FollowResponse.builder()
                    .name(f.getUser().getUsername())
                    .build();
            response.add(followResponse);
        }
        return response;
    }

}
