package com.example.Shopee.Mapper;


import com.example.Shopee.DTO.RequestDTO.PermissionRequest;
import com.example.Shopee.DTO.ResponseDTO.PermissionResponse;
import com.example.Shopee.Entity.Permission;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PermissionMapper {
    Permission toPermission (PermissionRequest request);
    PermissionResponse toPermissionResponse(Permission permission);
}
