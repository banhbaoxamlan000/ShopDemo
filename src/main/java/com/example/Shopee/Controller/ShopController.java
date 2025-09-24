package com.example.Shopee.Controller;

import com.example.Shopee.DTO.ApiResponse;
import com.example.Shopee.DTO.RequestDTO.ItemRequest;
import com.example.Shopee.DTO.RequestDTO.ItemUpdateRequest;
import com.example.Shopee.DTO.RequestDTO.ShopRequest;
import com.example.Shopee.DTO.RequestDTO.UserUpdateRequest;
import com.example.Shopee.DTO.ResponseDTO.*;
import com.example.Shopee.Service.ItemService;
import com.example.Shopee.Service.OrderService;
import com.example.Shopee.Service.ShopService;
import com.nimbusds.jose.JOSEException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.text.ParseException;
import java.util.Set;

@RestController
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@RequestMapping("/shop")
@Slf4j
public class ShopController {

    ShopService shopService;
    ItemService itemService;
    OrderService orderService;


    @PostMapping("/create")
    ApiResponse<ShopResponse> toShop(@RequestBody ShopRequest request) throws ParseException, JOSEException, IOException {

        return ApiResponse.<ShopResponse>builder()
                .result(shopService.shopCreate(request))
                .build();
    }

    @GetMapping("/info")
    ApiResponse<ShopDetailResponse> shopInfo()
    {
        return ApiResponse.<ShopDetailResponse>builder()
                .result(shopService.shopInfo())
                .build();
    }



    @GetMapping("/items")
    ApiResponse<Set<SearchItemResponse>> addItem()
    {
        return ApiResponse.<Set<SearchItemResponse>>builder()
                .result(shopService.shopItems())
                .build();
    }



    @PostMapping("/update/item")
    ApiResponse<ItemResponse> updateItem(@RequestBody ItemUpdateRequest request)
    {
        return ApiResponse.<ItemResponse>builder()
                .result(itemService.updateItem(request))
                .build();
    }

    @PostMapping("/update")
    ApiResponse<ShopResponse> updateShop(@RequestBody ShopRequest request){
        return ApiResponse.<ShopResponse>builder()
                .result(shopService.updateShop(request))
                .build();
    }

    @GetMapping("/order")
    ApiResponse<Set<OrderResponse>> getShopOrder()
    {
        return ApiResponse.<Set<OrderResponse>>builder()
                .result(orderService.getShopOrder())
                .build();
    }
}
