package com.example.Shopee.Controller;

import com.example.Shopee.DTO.ApiResponse;
import com.example.Shopee.DTO.RequestDTO.AuthenticationRequest;
import com.example.Shopee.DTO.RequestDTO.IntrospectRequest;
import com.example.Shopee.DTO.RequestDTO.LogoutRequest;
import com.example.Shopee.DTO.RequestDTO.RefreshRequest;
import com.example.Shopee.DTO.ResponseDTO.AuthenticationResponse;
import com.example.Shopee.DTO.ResponseDTO.IntrospectResponse;
import com.example.Shopee.DTO.ResponseDTO.RefreshResponse;
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
    ApiResponse<Void> logout(@RequestBody LogoutRequest request) throws ParseException, JOSEException {
        authenticationService.logout(request);
        return ApiResponse.<Void>builder().build();
    }

    @PostMapping("/refresh")
    ApiResponse<AuthenticationResponse> refresh(@RequestBody RefreshRequest request) throws ParseException, JOSEException {
        return ApiResponse.<AuthenticationResponse>builder()
                .result(authenticationService.refresh(request))
                .build();
    }
}
