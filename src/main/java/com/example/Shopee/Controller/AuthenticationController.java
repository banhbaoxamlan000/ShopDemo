package com.example.Shopee.Controller;

import com.example.Shopee.DTO.ApiResponse;
import com.example.Shopee.DTO.RequestDTO.*;
import com.example.Shopee.DTO.ResponseDTO.AuthenticationResponse;
import com.example.Shopee.DTO.ResponseDTO.IntrospectResponse;
import com.example.Shopee.Repository.ShopRepository;
import com.example.Shopee.Repository.UserRepository;
import com.example.Shopee.Service.AuthenticationService;
import com.example.Shopee.Service.UserService;
import com.nimbusds.jose.JOSEException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.text.ParseException;

@RestController
@RequestMapping("/auth")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Slf4j
public class AuthenticationController {

    @Autowired
    AuthenticationService authenticationService;
    UserService userService;
    UserRepository userRepository;
    ShopRepository shopRepository;

    @PostMapping("/login")
    ApiResponse<AuthenticationResponse> logIn(@RequestBody AuthenticationRequest request)
    {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        log.info("Username: {}", authentication.getName());
        authentication.getAuthorities().forEach(grantedAuthority -> log.info(grantedAuthority.getAuthority()));
        var result = userService.logIn(request);
        return ApiResponse.<AuthenticationResponse>builder()
                .result(result)
                .build();
    }

    @PostMapping("/introspect")
    ApiResponse<IntrospectResponse> introspect(@RequestBody IntrospectRequest request)
            throws ParseException, JOSEException {
        var result = authenticationService.introspect(request);
        return ApiResponse.<IntrospectResponse>builder()
                .result(result)
                .build();
    }

    @PostMapping("/logout")
    ApiResponse<Void> logout(@RequestHeader(value = "Authorization", required = true) String authorizationHeader) throws ParseException, JOSEException {
        String token = authorizationHeader.substring(7);
        authenticationService.logout(token);
        return ApiResponse.<Void>builder().build();
    }

    @PostMapping("/refresh")
    ApiResponse<AuthenticationResponse> refresh(@RequestBody RefreshRequest request) throws ParseException, JOSEException {
        return ApiResponse.<AuthenticationResponse>builder()
                .result(authenticationService.refresh(request))
                .build();
    }

    @PostMapping("/check-username")
    ApiResponse<Boolean> checkUsername(@RequestBody SearchRequest username)
    {
        return ApiResponse.<Boolean>builder()
                .result(userRepository.existsByUsername(username.getSearch()))
                .build();
    }

    @PostMapping("/check-email")
    ApiResponse<Boolean> checkEmail(@RequestBody SearchRequest email)
    {
        return ApiResponse.<Boolean>builder()
                .result(userRepository.existsByEmail(email.getSearch()))
                .build();
    }

    @PostMapping("/check-phone")
    ApiResponse<Boolean> checkPhone(@RequestBody SearchRequest phone)
    {
        return ApiResponse.<Boolean>builder()
                .result(userRepository.existsByPhone(phone.getSearch()))
                .build();
    }

    @PostMapping("/check-shop-email")
    ApiResponse<Boolean> checkShopEmail(@RequestBody SearchRequest email)
    {
        return ApiResponse.<Boolean>builder()
                .result(shopRepository.existsByEmail(email.getSearch()))
                .build();
    }

    @PostMapping("/check-shop-phone")
    ApiResponse<Boolean> checkShopPhone(@RequestBody SearchRequest phone)
    {
        return ApiResponse.<Boolean>builder()
                .result(shopRepository.existsByPhone(phone.getSearch()))
                .build();
    }

    @PostMapping("/check-business-number")
    ApiResponse<Boolean> checkBusinessNumber(@RequestBody SearchRequest businessNumber)
    {
        return ApiResponse.<Boolean>builder()
                .result(shopRepository.existsByPhone(businessNumber.getSearch()))
                .build();
    }
}
