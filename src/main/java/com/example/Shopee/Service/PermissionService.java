package com.example.Shopee.Service;


import com.example.Shopee.DTO.RequestDTO.PermissionRequest;
import com.example.Shopee.DTO.ResponseDTO.PermissionResponse;
import com.example.Shopee.Entity.Permission;
import com.example.Shopee.Mapper.PermissionMapper;
import com.example.Shopee.Repository.PermissionRepository;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional
public class PermissionService {

    PermissionRepository permissionRepository;
    PermissionMapper permissionMapper;

    public PermissionResponse create(PermissionRequest request)
    {
        Permission permission = permissionMapper.toPermission(request);
        permission = permissionRepository.save(permission);
        return permissionMapper.toPermissionResponse(permission);
    }

    public List<PermissionResponse> getAll()
    {
        var permissions = permissionRepository.findAll();
        return permissions.stream().map(permissionMapper::toPermissionResponse).toList();
    }

    public void delete (String name)
    {
        permissionRepository.deleteById(name);
    }
}
