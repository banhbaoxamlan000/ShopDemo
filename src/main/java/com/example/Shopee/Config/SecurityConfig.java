package com.example.Shopee.Config;

import com.example.Shopee.Enums.PredefinedRole;
import lombok.experimental.NonFinal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;

import javax.crypto.spec.SecretKeySpec;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@EnableAsync
public class SecurityConfig {

    private final String[] PUBLIC_ENDPOINTS = {"/users/register",
            "/auth/token", "/auth/introspect", "/auth/login", "/auth/logout", "/auth/refresh", "/shop/create", "/users/verify",
            "/users/reset-password", "/users/reset-verify"};

    @Autowired
    private CustomJwtDecoder customJwtDecoder;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception
    {
        httpSecurity.authorizeHttpRequests(request ->
                request.requestMatchers(PUBLIC_ENDPOINTS).permitAll()
                        .requestMatchers(HttpMethod.GET, "/users").hasRole(PredefinedRole.ADMIN_ROLE.getRole())
                        .requestMatchers("/users/**").hasRole(PredefinedRole.USER_ROLE.getRole())
                        .requestMatchers("/shopee/create").hasRole(PredefinedRole.SHOP_ROLE.getRole())
                        .requestMatchers("/shopee/delete").hasRole(PredefinedRole.SHOP_ROLE.getRole())
                        .requestMatchers("/shopee/**").hasRole(PredefinedRole.USER_ROLE.getRole())
                        .requestMatchers( HttpMethod.POST,"/shop/**").hasRole(PredefinedRole.SHOP_ROLE.getRole())
                        .requestMatchers("/cart/**").hasRole(PredefinedRole.USER_ROLE.getRole())
                        .requestMatchers("/review/**").hasRole(PredefinedRole.USER_ROLE.getRole())
                        .anyRequest().authenticated());

        httpSecurity.oauth2ResourceServer(oauth2 ->
                oauth2.jwt(jwtConfigurer -> jwtConfigurer.decoder(customJwtDecoder)
                        .jwtAuthenticationConverter(jwtAuthenticationConverter()))
                        .authenticationEntryPoint(new JwtAuthenticationEntryPoint()));

        httpSecurity.csrf(AbstractHttpConfigurer::disable);

        return httpSecurity.build();
    }


    @Bean
    JwtAuthenticationConverter jwtAuthenticationConverter()
    {
        JwtGrantedAuthoritiesConverter jwtGrantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
        jwtGrantedAuthoritiesConverter.setAuthorityPrefix("ROLE_");

        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(jwtGrantedAuthoritiesConverter);
        return jwtAuthenticationConverter;
    }

    @Bean
    PasswordEncoder passwordEncoder()
    {
        return new BCryptPasswordEncoder(10);
    }

}
