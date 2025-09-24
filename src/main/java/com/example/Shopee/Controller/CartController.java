package com.example.Shopee.Controller;


import com.example.Shopee.DTO.ApiResponse;
import com.example.Shopee.DTO.RequestDTO.CartItemUpdateRequest;
import com.example.Shopee.DTO.RequestDTO.CartRequest;
import com.example.Shopee.DTO.ResponseDTO.CartResponse;
import com.example.Shopee.DTO.ResponseDTO.CartItemResponse;
import com.example.Shopee.Entity.CartItem;
import com.example.Shopee.Repository.CartItemRepository;
import com.example.Shopee.Repository.CartRepository;
import com.example.Shopee.Service.CartService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/cart")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Slf4j
public class CartController {

    CartService cartService;

    @GetMapping()
    ApiResponse<CartResponse> getCart()
    {
        return ApiResponse.<CartResponse>builder()
                .result(cartService.getCart())
                .build();
    }

    @PostMapping("/{itemID}")
    ApiResponse<CartItemResponse> addToCart(@PathVariable("itemID") Integer itemID,
                                            @RequestBody CartRequest request)
    {
        return ApiResponse.<CartItemResponse>builder()
                .result(cartService.addItem(itemID, request))
                .build();
    }

    @PostMapping("/update")
    ApiResponse<CartResponse> updateCartItem(@RequestBody CartItemUpdateRequest cartItemID)
    {
        return ApiResponse.<CartResponse>builder()
                .result(cartService.updateCart(cartItemID))
                .build();
    }

    @DeleteMapping("/{cartItemID}")
    ApiResponse<String> deleteCartItem(@PathVariable("cartItemID") Integer cartItemID)
    {
        return ApiResponse.<String>builder()
                .result("Deleted " + cartService.delete(cartItemID) + " from cart")
                .build();
    }


}
