package com.example.Shopee.Controller;

import com.example.Shopee.DTO.ApiResponse;
import com.example.Shopee.DTO.RequestDTO.*;
import com.example.Shopee.DTO.ResponseDTO.AddressResponse;
import com.example.Shopee.DTO.ResponseDTO.AuthenticationResponse;
import com.example.Shopee.DTO.ResponseDTO.OrderResponse;
import com.example.Shopee.DTO.ResponseDTO.UserResponse;
import com.example.Shopee.Exception.AppException;
import com.example.Shopee.Exception.ErrorCode;
import com.example.Shopee.Repository.UserRepository;
import com.example.Shopee.Service.AddressService;
import com.example.Shopee.Service.CartService;
import com.example.Shopee.Service.OrderService;
import com.example.Shopee.Service.UserService;
import com.nimbusds.jose.JOSEException;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import lombok.extern.slf4j.XSlf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.text.ParseException;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserController {

    UserService userService;
    UserRepository userRepository;
    AddressService addressService;
    CartService cartService;
    OrderService orderService;

    @GetMapping()
    ApiResponse<List<UserResponse>> getUsers()
    {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        log.info("Username: {}", authentication.getName());
        authentication.getAuthorities().forEach(grantedAuthority -> log.info(grantedAuthority.getAuthority()));
        return ApiResponse.
                <List<UserResponse>>builder()
                .result(userService.findAllUsers())
                .build();
    }

    @PostMapping("/register")
    ApiResponse<UserResponse> register(@Valid @RequestBody UserRegistration request)
    {
        return ApiResponse.<UserResponse>builder()
                .result(userService.userRegistration(request))
                .build();
    }

    @PostMapping("/verify")
    ApiResponse<UserResponse> verify(@RequestBody VerificationRequest request)
    {
        UserResponse result = userService.verify(request);
        cartService.createCart(result.getUserID());
        return ApiResponse.<UserResponse>builder()
                .result(result)
                .build();
    }

    @GetMapping("/myInfo")
    ApiResponse<UserResponse> getMyInfo()
    {
        return ApiResponse.<UserResponse>builder()
                .result(userService.getMyInfo()).build();
    }

    @PostMapping("/update")
    ApiResponse<UserResponse> updateUser(@RequestBody UserUpdateRequest request)
    {
        return ApiResponse.<UserResponse>builder()
                .result(userService.updateUser(request)).build();
    }

    @DeleteMapping("/{userID}")
    ApiResponse<String> deleteUser(@PathVariable("userID") String userID)
    {
        userRepository.delete(userRepository.findById(userID)
                .orElseThrow(()-> new AppException(ErrorCode.USER_NOT_EXISTED)));
        return ApiResponse.<String>builder()
                .result("Deleted successfully")
                .build();
    }

    @DeleteMapping("/ban/{userID}")
    ApiResponse<String> banUser(@PathVariable("userID") String userID)
    {
        userService.banUser(userID);
        return ApiResponse.<String>builder()
                .result("Banned successfully")
                .build();
    }

    @PostMapping("/addresses")
    ApiResponse<AddressResponse> addAddress(@Valid @RequestBody AddressRequest request)
    {
        return ApiResponse.<AddressResponse>builder()
                .result(addressService.createAddress(request))
                .build();
    }

    @DeleteMapping("/delete/address/{id}")
    ApiResponse<String> deleteAddress(@PathVariable("id") Integer id)
    {
        addressService.deleteAddress(id);
        return ApiResponse.<String>builder()
                .result("Delete Address Successfully")
                .build();
    }

    @GetMapping("/order")
    ApiResponse<Set<OrderResponse>> getUserOrder()
    {
        return ApiResponse.<Set<OrderResponse>>builder()
                .result(orderService.getUserOrders())
                .build();
    }

    @PutMapping("/reset-password")
    void reset(@RequestBody ResetPasswordRequest request)
    {
        userService.reset(request);
    }


    @PostMapping("/reset-verify")
    ApiResponse<AuthenticationResponse> verifyPasswordResetCode(@RequestBody VerificationRequest request) {
        return ApiResponse.<AuthenticationResponse>builder()
                .result(userService.resetPasswordAuthentication(request))
                .build();
    }

    @PostMapping("/reset-password")
    ApiResponse<String> resetPassword(@RequestBody ResetPasswordRequest request)
    {
        return ApiResponse.<String>builder()
                .result(userService.resetPassword(request))
                .build();
    }
}
