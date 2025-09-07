package com.example.Shopee.Controller;

import com.example.Shopee.DTO.ApiResponse;
import com.example.Shopee.DTO.RequestDTO.ItemRequest;
import com.example.Shopee.DTO.RequestDTO.ItemUpdateRequest;
import com.example.Shopee.DTO.RequestDTO.ShopRequest;
import com.example.Shopee.DTO.ResponseDTO.ItemResponse;
import com.example.Shopee.DTO.ResponseDTO.OrderResponse;
import com.example.Shopee.DTO.ResponseDTO.ShopDetailResponse;
import com.example.Shopee.DTO.ResponseDTO.ShopResponse;
import com.example.Shopee.Service.ItemService;
import com.example.Shopee.Service.OrderService;
import com.example.Shopee.Service.ShopService;
import com.nimbusds.jose.JOSEException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

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
    ApiResponse<ShopResponse> toShop(@RequestBody ShopRequest request) throws ParseException, JOSEException {
        log.info("zzzzzzzzzzzzzzzzzzzzzzzz");
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

    @PostMapping("/additem")
    ApiResponse<ItemResponse> addItem(@RequestBody ItemRequest request)
    {
        return ApiResponse.<ItemResponse>builder()
                .result(null)
                .build();
    }
//
//    @PostMapping

    @PostMapping("/update/item")
    ApiResponse<ItemResponse> updateItem(@RequestBody ItemUpdateRequest request)
    {
        return ApiResponse.<ItemResponse>builder()
                .result(itemService.updateItem(request))
                .build();
    }

    @PostMapping("/update")
    ApiResponse<ShopResponse> updateShop(@RequestBody ShopRequest request)
    {
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
