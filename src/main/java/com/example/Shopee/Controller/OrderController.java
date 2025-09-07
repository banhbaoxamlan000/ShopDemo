package com.example.Shopee.Controller;

import com.example.Shopee.DTO.ApiResponse;
import com.example.Shopee.DTO.RequestDTO.OrderFromCartRequest;
import com.example.Shopee.DTO.RequestDTO.OrderRequest;
import com.example.Shopee.DTO.RequestDTO.OrderUpdateStatusRequest;
import com.example.Shopee.DTO.ResponseDTO.OrderResponse;
import com.example.Shopee.Service.OrderService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RestController
public class OrderController {

    OrderService orderService;

    @PostMapping("/users/order")
    ApiResponse<OrderResponse> createOrder(@RequestBody OrderRequest request)
    {
        return ApiResponse.<OrderResponse>builder()
                .result(orderService.orderFromItem(request))
                .build();
    }

    @PutMapping("/users/order")
    ApiResponse<OrderResponse> updateOrderStatus(@RequestBody OrderUpdateStatusRequest request)
    {
        return ApiResponse.<OrderResponse>builder()
                .result(orderService.updateOrderStatus(request))
                .build();
    }

    @PostMapping("/cart/order")
    ApiResponse<Set<OrderResponse>> createOrders(@RequestBody OrderFromCartRequest request)
    {
        return ApiResponse.<Set<OrderResponse>>builder()
                .result(orderService.orderFromCart(request))
                .build();
    }
}
