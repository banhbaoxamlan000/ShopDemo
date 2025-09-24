package com.example.Shopee.Service;

import com.example.Shopee.DTO.RequestDTO.CartItemUpdateRequest;
import com.example.Shopee.DTO.RequestDTO.CartRequest;
import com.example.Shopee.DTO.ResponseDTO.*;
import com.example.Shopee.Entity.*;
import com.example.Shopee.Exception.AppException;
import com.example.Shopee.Exception.ErrorCode;
import com.example.Shopee.Mapper.AttributeMapper;
import com.example.Shopee.Mapper.ImageMapper;
import com.example.Shopee.Repository.*;
import com.example.Shopee.Utils.ImageUtils;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional
public class CartService {

    CartRepository cartRepository;
    UserRepository userRepository;
    ItemRepository itemRepository;
    VariantRepository variantRepository;
    CartItemRepository cartItemRepository;
    ImageMapper imageMapper;
    AttributeMapper attributeMapper;
    ImageRepository imageRepository;

    String getUserID(String login)
    {
        if(userRepository.existsByUsername(login)) {
            User result = userRepository.findByUsername(login).orElseThrow(
                    () -> new AppException(ErrorCode.USER_NOT_EXISTED));
            return result.getUserID();
        }
        if(userRepository.existsByPhone(login)) {
            User result = userRepository.findByPhone(login).orElseThrow(
                    () -> new AppException(ErrorCode.USER_NOT_EXISTED));
            return result.getUserID();
        }
        if(userRepository.existsByEmail(login)) {
            User result = userRepository.findByEmail(login).orElseThrow(
                    () -> new AppException(ErrorCode.USER_NOT_EXISTED));
            return result.getUserID();
        }
        throw new AppException(ErrorCode.USER_NOT_EXISTED);
    }

    public void createCart(String userID)
    {
        User user = userRepository.findById(userID).orElseThrow(()-> new AppException(ErrorCode.USER_NOT_EXISTED));
        Cart cart = new Cart(userID, 0.0);
        user.setCart(cart);
        userRepository.save(user);
    }

    boolean existedItem(Set<CartItem> cartItemSet, Item item)
    {
        List<Item> items = cartItemSet.stream().map(CartItem :: getItem).toList();
        boolean result =items.contains(item);
        return items.contains(item);
    }

    public CartItemResponse addItem(Integer itemID, CartRequest request)
    {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String login = authentication.getName();

        Item item = itemRepository.findById(itemID).orElseThrow(() -> new AppException(ErrorCode.ITEM_NOT_EXISTED));
        CartItem cartItem = new CartItem();
        cartItem.setItem(item);
        cartItem.setPrice(item.getPrice());
        StringBuilder sku = new StringBuilder();
        if(request.getVariantID() != null)
        {
            Variant v = variantRepository.findById(request.getVariantID()).orElseThrow(() -> new AppException(ErrorCode.ITEM_NOT_EXISTED));
            cartItem.setVariant(v);
            cartItem.setPrice(v.getPrice());
            if(!item.getVariants().contains(v))
            {
                throw new AppException(ErrorCode.INVALID_VARIANT);
            }
            sku.append(v.getSKU());
        }
        cartItem.setQuantity(request.getQuantity());

        Cart cart = cartRepository.findById(getUserID(login)).orElseThrow(()-> new AppException(ErrorCode.CART_NOT_EXISTED));
        Set<CartItem> cartItemSet = cartItemRepository.findByCart(cart);
        cartItem.setCart(cart);
        CartItem existedItem = cartItemSet.stream()
                .filter(cartItem1 -> cartItem1.getItem().equals(item))
                .findAny()
                .orElse(null);
        if(existedItem!= null && existedItem.getVariant().equals(cartItem.getVariant()))
        {
            cartItem.setQuantity(existedItem.getQuantity() + request.getQuantity());
            existedItem.setQuantity(cartItem.getQuantity());
            cartItemRepository.save(existedItem);

        }else {
            cartItemRepository.save(cartItem);
        }
        Double price = cartItemSet.stream().mapToDouble(cartItem1 -> cartItem1.getPrice()*cartItem1.getQuantity()).sum();
        cart.setPrice(price);
        cartRepository.save(cart);


        Set<VariantResponse> variantResponses = new HashSet<>();


        VariantResponse v = VariantResponse.builder()
                    .shopName(item.getShop().getShopName())
                    .itemName(cartItem.getItem().getName())
                    .quantity(cartItem.getQuantity())
                    .price(cartItem.getPrice())
                    .itemID(cartItem.getItem().getItemID())
                    .SKU(sku.toString())
                    .build();
        if(cartItem.getVariant() != null)
        {
            Set<AttributeResponse> attributeResponses = new HashSet<>();
            for (Attribute a : cartItem.getVariant().getAttribute())
            {
                attributeResponses.add(attributeMapper.toAttributeResponse(a));
            }
            v.setAttributes(attributeResponses);
            v.setVariantID(cartItem.getVariant().getVariantID());
        }

        variantResponses.add(v);

        return CartItemResponse.builder()
                .shopName(item.getShop().getShopName())
                .items(variantResponses)
                .build();
    }


    public CartResponse updateCart(CartItemUpdateRequest cartItemID)
    {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String login = authentication.getName();
        Cart cart = cartRepository.findById(getUserID(login))
                .orElseThrow(()-> new AppException(ErrorCode.CART_NOT_EXISTED));
        Set<CartItem> cartItemSet = cartItemRepository.findByCart(cart);
        CartItem cartItem = cartItemRepository.findById(cartItemID.getCartItemID())
                .orElseThrow(()-> new AppException(ErrorCode.ITEM_NOT_EXISTED));
        if(cartItemSet.contains(cartItem))
        {
            cartItem.setQuantity(cartItemID.getQuantity());
            cartItemRepository.save(cartItem);
            return getCart();
        }
        throw new AppException(ErrorCode.ITEM_NOT_IN_CART);
    };


    public CartResponse getCart()
    {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String login = authentication.getName();
        Cart cart = cartRepository.findById(getUserID(login)).orElseThrow(()-> new AppException(ErrorCode.CART_NOT_EXISTED));
        Set<CartItem> cartItemSet = cartItemRepository.findByCart(cart);
        Set<VariantResponse> variantResponses = new HashSet<>();
        for(CartItem ct : cartItemSet)
        {
            VariantResponse v = VariantResponse.builder()
                    .cartItemID(ct.getCartItemID())
                    .itemName(ct.getItem().getName())
                    .shopName(ct.getItem().getShop().getShopName())
                    .quantity(ct.getQuantity())
                    .price(ct.getPrice())
                    .shopID(ct.getItem().getShop().getShopID())
                    .itemID(ct.getItem().getItemID())
                    .build();
            if(ct.getVariant() != null)
            {
                Set<AttributeResponse> attributeResponses = new HashSet<>();
                for (Attribute a : ct.getVariant().getAttribute())
                {
                    attributeResponses.add(attributeMapper.toAttributeResponse(a));
                }
                v.setSKU(ct.getVariant().getSKU());
                v.setAttributes(attributeResponses);
                v.setVariantID(ct.getVariant().getVariantID());
            }
            variantResponses.add(v);
        }
        Double price = cartItemSet.stream().mapToDouble(cartItem1 -> cartItem1.getPrice()*cartItem1.getQuantity()).sum();
        cart.setPrice(price);
        cartRepository.save(cart);
        Map<String, Set<VariantResponse>> grouped = variantResponses.stream()
                .collect(Collectors.groupingBy(VariantResponse::getShopName,Collectors.toSet()));
        Set<CartItemResponse> response = grouped.entrySet().stream()
                .map(cartItem1 -> new CartItemResponse(cartItem1.getKey(), cartItem1.getValue())).collect(Collectors.toSet());
        return CartResponse.builder()
                .itemCart(response)
                .build();
    }

    public String delete(Integer cartItemID)
    {
        CartItem c = cartItemRepository.findById(cartItemID).orElseThrow(() -> new AppException(ErrorCode.ITEM_NOT_IN_CART));
        Cart cart = c.getCart();
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String userID = getUserID(authentication.getName());
        if(!c.getCart().getCartID().equals(userID))
        {
            throw new AppException(ErrorCode.NON_OWNERSHIP);
        }
        c.setCart(null);
        Set<CartItem> ct = cartItemRepository.findByCart(cart);
        Double price = ct.stream().mapToDouble(cartItem1 -> cartItem1.getPrice()*cartItem1.getQuantity()).sum();
        cart.setPrice(price);
        cartRepository.save(cart);
        cartItemRepository.save(c);
        cartItemRepository.deleteById(cartItemID);

        return c.getItem().getName();
    }

}
