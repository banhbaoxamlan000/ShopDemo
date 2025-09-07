package com.example.Shopee.Service;

import com.example.Shopee.DTO.RequestDTO.AddressRequest;
import com.example.Shopee.DTO.ResponseDTO.AddressResponse;
import com.example.Shopee.Entity.Address;
import com.example.Shopee.Entity.User;
import com.example.Shopee.Exception.AppException;
import com.example.Shopee.Exception.ErrorCode;
import com.example.Shopee.Mapper.AddressMapper;
import com.example.Shopee.Repository.AddressRepository;
import com.example.Shopee.Repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional
public class AddressService {
    UserRepository userRepository;
    AddressMapper addressMapper;
    UserService userService;
    AddressRepository addressRepository;

    boolean compareAddress(Address address, AddressRequest request)
    {
        return address.getPhone().equals(request.getPhone())&&
                address.getWard().equals(request.getWard()) &&
                address.getDetail().equals(request.getDetail())&&
                address.getDistrict().equals(request.getDistrict())&&
                address.getCity().equals(request.getCity());
    }

    public AddressResponse createAddress(AddressRequest request)
    {
        var context = SecurityContextHolder.getContext();
        String login =context.getAuthentication().getName();
        Address address = addressMapper.toAddress(request);
        User user = userRepository.findById(userService.getUserID(login))
                .orElseThrow(()-> new AppException(ErrorCode.USER_NOT_EXISTED));

        if(addressRepository.existsByUserAndPhoneAndCityAndDistrictAndWardAndDetail
                (user,request.getPhone(), request.getCity(), request.getDistrict(), request.getWard(), request.getDetail()))
        {
            Set<Address> addresses = addressRepository.findByUser(user);
            AddressResponse addressResponse = new AddressResponse();
            for (Address add : addresses)
            {
                add.setDefaultAddress(false);
                if(compareAddress(add, request))
                {
                    add.setDefaultAddress(true);
                    addressResponse = addressMapper.toAddressResponse(add);
                }
            }

            addressRepository.saveAll(addresses);
            return addressResponse;
        }
        address.setUser(user);
        address.setDefaultAddress(true);
        return addressMapper.toAddressResponse(addressRepository.save(address));
    }

    public void deleteAddress(Integer id)
    {
        addressRepository.deleteById(id);
    }
}
