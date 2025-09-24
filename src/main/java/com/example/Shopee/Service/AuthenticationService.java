package com.example.Shopee.Service;


import com.example.Shopee.DTO.RequestDTO.*;
import com.example.Shopee.DTO.ResponseDTO.AuthenticationResponse;
import com.example.Shopee.DTO.ResponseDTO.IntrospectResponse;
import com.example.Shopee.Entity.*;
import com.example.Shopee.Enums.PredefinedRole;
import com.example.Shopee.Exception.AppException;
import com.example.Shopee.Exception.ErrorCode;
import com.example.Shopee.Repository.InvalidatedTokenRepository;
import com.example.Shopee.Repository.ShopRepository;
import com.example.Shopee.Repository.UserRepository;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.data.redis.RedisProperties;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

// TẠO TOKEN, XÁC THỰC TOKEN, ĐĂNG XUẤT

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional
public class AuthenticationService {

    UserRepository userRepository;
    ShopRepository shopRepository;
    InvalidatedTokenRepository invalidatedTokenRepository;
    @NonFinal
    @Value("${jwt.signerKey}")
    protected String SIGNER_KEY;

    @NonFinal
    @Value("${jwt.valid-duration}")
    protected Long VALID_DURATION;

    @NonFinal
    @Value(("${jwt.refreshable-duration}"))
    protected Long REFRESHABLE_DURATION;

    String buildScope(User user)
    {
        StringJoiner stringJoiner = new StringJoiner(" ");
        if(!CollectionUtils.isEmpty(user.getRoles()))
        {
            for(Role role : user.getRoles())
            {
                stringJoiner.add(role.getName());
            }
        }
        return stringJoiner.toString();
    }

    String getShopID(User user)
    {
        if(shopRepository.existsByUsername(user.getUsername()))
        {
            Shop shop = shopRepository.findByUsername(user.getUsername()).orElseThrow(() -> new AppException(ErrorCode.SHOP_NOT_CREATED));
            return shop.getShopID();
        }
        return "";
    }

    public String generateToken(User user)
    {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);
        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(user.getUsername())
                .issuer("linhdeptrai")
                .issueTime(new Date())
                .expirationTime(new Date(
                        Instant.now().plus(VALID_DURATION, ChronoUnit.MINUTES).toEpochMilli()
                ))
                .jwtID(UUID.randomUUID().toString())
                .claim("scope", buildScope(user))
                .build();

        Payload payload = new Payload(jwtClaimsSet.toJSONObject());


        JWSObject jwsObject = new JWSObject(header, payload);

        try {
            jwsObject.sign(new MACSigner(SIGNER_KEY.getBytes()));
            return jwsObject.serialize();
        } catch (JOSEException e) {
            throw new AppException(ErrorCode.GENERATE_TOKEN_ERROR);
        }
    }

    public String generateResetPasswordToken(String email)
    {
        JWSHeader head = new JWSHeader(JWSAlgorithm.HS512);
        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .issueTime(new Date())
                .expirationTime(new Date(Instant.now().plus(10, ChronoUnit.MINUTES).toEpochMilli()))
                .jwtID(UUID.randomUUID().toString())
                .subject(email)
                .build();

        Payload payload = new Payload(jwtClaimsSet.toJSONObject());

        JWSObject jwsObject = new JWSObject(head, payload);
        try {
            jwsObject.sign(new MACSigner(SIGNER_KEY.getBytes()));
            return jwsObject.serialize();
        } catch (JOSEException e) {
            throw new AppException(ErrorCode.GENERATE_TOKEN_ERROR);
        }
    }


    public SignedJWT verifyToken(String token, boolean isRefresh) throws ParseException, JOSEException {

        JWSVerifier verifier = new MACVerifier(SIGNER_KEY.getBytes());

        SignedJWT signedJWT = SignedJWT.parse(token);


        Date expiryTime = (isRefresh)
                ? new Date(signedJWT.getJWTClaimsSet().getIssueTime()
                    .toInstant().plus(REFRESHABLE_DURATION, ChronoUnit.HOURS).toEpochMilli())
                :signedJWT.getJWTClaimsSet().getExpirationTime();

        var verified = signedJWT.verify(verifier);



        if(!verified && expiryTime.after(new Date()))
            throw new AppException(ErrorCode.UNAUTHENTICATED);

        if(invalidatedTokenRepository.existsById(signedJWT.getJWTClaimsSet().getJWTID()))
            throw new AppException(ErrorCode.UNAUTHENTICATED);

        return signedJWT;
    }

    public IntrospectResponse introspect(IntrospectRequest request)
            throws JOSEException, ParseException {

        boolean isValid = true;

        try {
            verifyToken(request.getToken(), false);
        }catch (AppException e)
        {
            isValid = false;
        }
        return IntrospectResponse.builder()
                .valid(isValid)
                .build();
    }

    public void logout(String request) throws ParseException, JOSEException {
        try{
            var signedToken = verifyToken(request, true);
            String jId = signedToken.getJWTClaimsSet().getJWTID();
            Date expiryTime = signedToken.getJWTClaimsSet().getExpirationTime();
            InvalidatedToken invalidatedToken = InvalidatedToken.builder()
                    .id(jId)
                    .expiryTime(expiryTime)
                    .build();

            invalidatedTokenRepository.save(invalidatedToken);
        }catch (AppException e)
        {
            log.info("Token already expired");
        }
    }

    public AuthenticationResponse refresh(RefreshRequest request) throws ParseException, JOSEException {
        var signedJWT = verifyToken(request.getToken(), true);
        String id = signedJWT.getJWTClaimsSet().getJWTID();
        Date expiry = signedJWT.getJWTClaimsSet().getExpirationTime();

        InvalidatedToken invalidatedToken = InvalidatedToken.builder()
                .id(id)
                .expiryTime(expiry)
                .build();

        invalidatedTokenRepository.save(invalidatedToken);
        var username = signedJWT.getJWTClaimsSet().getSubject();

        var user = userRepository.findByUsername(username).orElseThrow(
                () -> new AppException(ErrorCode.UNAUTHENTICATED)
        );

        var token = generateToken(user);

        return AuthenticationResponse
                .builder().token(token)
                .build();
    }

}
