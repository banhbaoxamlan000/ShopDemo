package com.example.Shopee.Mapper;

import com.example.Shopee.DTO.RequestDTO.AddressRequest;
import com.example.Shopee.DTO.ResponseDTO.AddressResponse;
import com.example.Shopee.Entity.Address;
import org.mapstruct.Mapper;

@Mapper(componentModel = "Spring")
public interface AddressMapper {
    Address toAddress(AddressRequest request);

    AddressResponse toAddressResponse(Address address);
}
