package com.example.Shopee.Mapper;


import com.example.Shopee.DTO.RequestDTO.RoleRequest;
import com.example.Shopee.DTO.ResponseDTO.RoleResponse;
import com.example.Shopee.Entity.Role;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "Spring")
public interface RoleMapper {
    @Mapping(target = "permissions", ignore = true)
    Role toRole(RoleRequest request);

    RoleResponse toRoleResponse(Role role);
}
