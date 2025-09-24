package com.example.Shopee.Mapper;

import com.example.Shopee.DTO.RequestDTO.UserRegistration;
import com.example.Shopee.DTO.RequestDTO.UserUpdateRequest;
import com.example.Shopee.DTO.ResponseDTO.UserResponse;
import com.example.Shopee.Entity.PendingUser;
import com.example.Shopee.Entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "Spring")
public interface UserMapper {

    @Mapping(target = "userID", ignore = true)
    @Mapping(target = "roles", ignore = true)
    User toUser(PendingUser pendingUser);


    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "addressResponses", ignore = true)
    UserResponse toUserResponse(User user);

    @Mapping(target = "roles", ignore = true)
    void updateUser(@MappingTarget User user, UserUpdateRequest request);


    PendingUser toPendingUser(UserRegistration request);

    @Mapping(target = "roles", ignore = true)
    UserResponse pendingUserToUserResponse(PendingUser pendingUser);

}
