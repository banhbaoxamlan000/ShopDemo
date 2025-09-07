package com.example.Shopee.Service;

import com.example.Shopee.DTO.RequestDTO.RoleRequest;
import com.example.Shopee.DTO.ResponseDTO.RoleResponse;
import com.example.Shopee.Entity.Role;
import com.example.Shopee.Mapper.RoleMapper;
import com.example.Shopee.Repository.PermissionRepository;
import com.example.Shopee.Repository.RoleRepository;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional
public class RoleService {
    RoleRepository roleRepository;
    RoleMapper roleMapper;
    PermissionRepository permissionRepository;

    public RoleResponse create(RoleRequest request)
    {
        Role role = roleMapper.toRole(request);

        var permissions = permissionRepository.findAllById(request.getPermission());
        role.setPermissions(new HashSet<>(permissions));

        role = roleRepository.save(role);

        return roleMapper.toRoleResponse(role);
    }

    public List<RoleResponse> getAll()
    {
        return roleRepository.findAll().stream()
                .map(roleMapper :: toRoleResponse)
                .toList();
    }

    public void delete(String name)
    {
        roleRepository.deleteById(name);
    }
}
