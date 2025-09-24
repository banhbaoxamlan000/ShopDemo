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

import java.util.HashSet;
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

    public Set<AddressResponse> getAddresses()
    {
        var context = SecurityContextHolder.getContext();
        String login =context.getAuthentication().getName();
        User user = userRepository.findById(userService.getUserID(login))
                .orElseThrow(()-> new AppException(ErrorCode.USER_NOT_EXISTED));
        Set<Address> addresses = addressRepository.findByUser(user);
        Set<AddressResponse> addressResponses = new HashSet<>();
        for(Address a: addresses)
        {
            addressResponses.add(addressMapper.toAddressResponse(a));
        }
        return addressResponses;
    }

    public AddressResponse createAddress(AddressRequest request)
    {
        var context = SecurityContextHolder.getContext();
        String login =context.getAuthentication().getName();
        Address address = addressMapper.toAddress(request);
        User user = userRepository.findById(userService.getUserID(login))
                .orElseThrow(()-> new AppException(ErrorCode.USER_NOT_EXISTED));

        Set<Address> addresses = addressRepository.findByUser(user);

        if(addressRepository.existsByUserAndPhoneAndCityAndDistrictAndWardAndDetail
                (user,request.getPhone(), request.getCity(), request.getDistrict(), request.getWard(), request.getDetail()))
        {
            AddressResponse addressResponse = new AddressResponse();
            for (Address add : addresses)
            {
                if(compareAddress(add, request))
                {
                    add.setDefaultAddress(true);
                    add.setActive(true);
                }
            }

            addressRepository.saveAll(addresses);
            return addressResponse;
        }
        for (Address add : addresses) {
            add.setDefaultAddress(false);
        }
        addressRepository.saveAll(addresses);
        address.setUser(user);
        address.setDefaultAddress(true);
        address.setActive(true);
        return addressMapper.toAddressResponse(addressRepository.save(address));
    }

    public void deleteAddress(Integer id)
    {
        Address address = addressRepository.findById(id).orElseThrow(()-> new AppException(ErrorCode.ADDRESS_NOT_EXISTED));
        address.setActive(false);
        addressRepository.save(address);
    }

    public void setDefaultAddress(Integer id)
    {
        var context = SecurityContextHolder.getContext();
        String login =context.getAuthentication().getName();
        User user = userRepository.findById(userService.getUserID(login))
                .orElseThrow(()-> new AppException(ErrorCode.USER_NOT_EXISTED));
        Set<Address> addresses = addressRepository.findByUser(user);
        Address address = addressRepository.findById(id).orElseThrow(()-> new AppException(ErrorCode.ADDRESS_NOT_EXISTED));
        for (Address add : addresses)
        {
            add.setDefaultAddress(false);
            if(add.equals(address))
            {
                add.setDefaultAddress(true);
            }
        }
        addressRepository.saveAll(addresses);
    }
}
