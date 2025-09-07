package com.example.Shopee.Service;

import com.example.Shopee.DTO.RequestDTO.*;
import com.example.Shopee.DTO.ResponseDTO.ItemResponse;
import com.example.Shopee.DTO.ResponseDTO.SearchItemResponse;
import com.example.Shopee.DTO.ResponseDTO.ShopDetailResponse;
import com.example.Shopee.DTO.ResponseDTO.ShopResponse;
import com.example.Shopee.Entity.*;
import com.example.Shopee.Enums.PredefinedRole;
import com.example.Shopee.Exception.AppException;
import com.example.Shopee.Exception.ErrorCode;
import com.example.Shopee.Mapper.ImageMapper;
import com.example.Shopee.Mapper.ItemMapper;
import com.example.Shopee.Mapper.ShopMapper;
import com.example.Shopee.Repository.*;
import com.nimbusds.jose.JOSEException;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

// TẠO SHOP, SHOW THÔNG TIN SHOP

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional
public class ShopService {

    UserRepository userRepository;
    ShopMapper shopMapper;
    RoleRepository roleRepository;
    ItemMapper itemMapper;
    ShopRepository shopRepository;
    ItemRepository itemRepository;
    UserService userService;
    ImageMapper imageMapper;

    public ShopResponse shopCreate(ShopRequest request) throws ParseException, JOSEException {
        if(shopRepository.existsByTaxNumber(request.getTaxNumber()))
        {
            throw new AppException(ErrorCode.INVALID_TAX_NUMBER);
        }
        if(shopRepository.existsByShopName(request.getShopName()))
        {
            throw new AppException(ErrorCode.SHOP_EXISTED);
        }
        if(shopRepository.existsByEmail(request.getEmail()))
            throw new AppException(ErrorCode.EMAIL_USED);
        if(shopRepository.existsByPhone(request.getPhone()))
            throw new AppException(ErrorCode.PHONE_USED);
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String userID = userService.getUserID(authentication.getName());
        User user = userRepository.findById(userID).orElseThrow(()-> new AppException(ErrorCode.USER_NOT_EXISTED));

        Set<Role> roles = user.getRoles();
        roleRepository.findById(PredefinedRole.SHOP_ROLE.getRole()).ifPresent(roles :: add);
        user.setRoles(roles);
        Image image = imageMapper.toImage(request.getPictures());

        Shop shop = shopMapper.toShop(request);
        shop.setUsername(user.getUsername());
        shop.setShopID(user.getUserID());
        shop.setPictures(image);
        userRepository.save(user);

        ShopResponse response = shopMapper.toShopResponse(shopRepository.save(shop));
        response.setPictures(imageMapper.toImageResponse(image));
        return  response;
    }

    // lấy ra thông tin của shop qua tìm kiếm
    public ShopDetailResponse getShopInfo(String id)
    {
        Shop shop = shopRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.SHOP_NOT_CREATED));
        Set<Item> itemSet = itemRepository.findByShop(shop);
        int ratings = 0;
        double total = 0.0;
        for(Item i : itemSet)
        {
            ratings += i.getReviews().size();
            total += i.getReviews().stream().mapToDouble(Review :: getRate).sum();
        }
        shop.setRatings(ratings);
        shop.setRate(total / ratings);
        ShopDetailResponse response = new ShopDetailResponse();
        response.setShopResponse(shopMapper.toShopResponse(shop));

        Set<Item> items = itemRepository.findByShop(shop);
        Set<SearchItemResponse> s = new HashSet<>();
        for(Item i : items)
        {
            s.add(itemMapper.toSearchItemResponse(i));
        }
        response.setItems(s);
        return response;
    }

    // lấy ra thông tin của shop đăng nhập
    public ShopDetailResponse shopInfo()
    {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String login = userService.getUserID(authentication.getName());

        User user = userRepository.findById(login).orElseThrow(
                ()-> new AppException(ErrorCode.USER_NOT_EXISTED));
        Shop shop = shopRepository.findByUsername(user.getUsername()).orElseThrow(
                () -> new AppException(ErrorCode.SHOP_NOT_CREATED));
        ShopDetailResponse response = new ShopDetailResponse();
        response.setShopResponse(shopMapper.toShopResponse(shop));
        Set<Item> items = itemRepository.findByShop(shop);
        Set<SearchItemResponse> s = new HashSet<>();
        for(Item i : items)
        {
            s.add(itemMapper.toSearchItemResponse(i));
        }
        response.setItems(s);
        return response;
    }

    public List<ShopResponse> searchShop(String name)
    {
        List<ShopResponse> responses = new ArrayList<>();

        List<Shop> results = shopRepository.findByShopNameContainingIgnoreCaseOrderByRate(name);

        for(Shop s : results)
        {
            responses.add(shopMapper.toShopResponse(s));
        }
        return responses;
    }

    public ShopResponse updateShop(ShopRequest request)
    {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String login = userService.getUserID(authentication.getName());
        User user = userRepository.findById(login).orElseThrow(
                ()-> new AppException(ErrorCode.USER_NOT_EXISTED));
        Shop shop = shopRepository.findByUsername(user.getUsername()).orElseThrow(
                ()-> new AppException(ErrorCode.SHOP_NOT_CREATED));
        if(!shop.getShopName().equals(request.getShopName()))
            if(shopRepository.existsByShopName(request.getShopName()))
                throw new AppException(ErrorCode.SHOP_EXISTED);
        shop.setShopName(request.getShopName());

        if(!shop.getEmail().equals(request.getEmail()))
            if(shopRepository.existsByEmail(request.getEmail()))
                throw new AppException(ErrorCode.EMAIL_USED);
        shop.setEmail(request.getEmail());

        if(!shop.getPhone().equals(request.getPhone()))
            if(shopRepository.existsByPhone(request.getPhone()))
                throw new AppException(ErrorCode.PHONE_USED);
        shop.setPhone(request.getPhone());

        if(!shop.getTaxNumber().equals(request.getTaxNumber()))
            if(shopRepository.existsByTaxNumber(request.getTaxNumber()))
                throw new AppException(ErrorCode.INVALID_TAX_NUMBER);
        shop.setTaxNumber(request.getTaxNumber());
        shop.setPictures(imageMapper.toImage(request.getPictures()));
        shopRepository.save(shop);
        Image image = imageMapper.toImage(request.getPictures());
        ShopResponse response = shopMapper.toShopResponse(shopRepository.save(shop));
        response.setPictures(imageMapper.toImageResponse(image));
        return  response;
    }


}
