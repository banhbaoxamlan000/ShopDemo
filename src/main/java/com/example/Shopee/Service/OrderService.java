package com.example.Shopee.Service;

import com.example.Shopee.DTO.RequestDTO.OrderFromCartRequest;
import com.example.Shopee.DTO.RequestDTO.OrderRequest;
import com.example.Shopee.DTO.RequestDTO.OrderUpdateStatusRequest;
import com.example.Shopee.DTO.ResponseDTO.AttributeResponse;
import com.example.Shopee.DTO.ResponseDTO.ItemOrderedResponse;
import com.example.Shopee.DTO.ResponseDTO.OrderResponse;
import com.example.Shopee.Entity.*;
import com.example.Shopee.Enums.Status;
import com.example.Shopee.Exception.AppException;
import com.example.Shopee.Exception.ErrorCode;
import com.example.Shopee.Mapper.AddressMapper;
import com.example.Shopee.Mapper.AttributeMapper;
import com.example.Shopee.Repository.*;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional
public class OrderService {
    OrderRepository orderRepository;
    ItemRepository itemRepository;
    VariantRepository variantRepository;
    AddressRepository addressRepository;
    UserService userService;
    UserRepository userRepository;
    OrderStatusRepository orderStatusRepository;
    CartItemRepository cartItemRepository;
    OrderItemRepository orderItemRepository;
    AddressMapper addressMapper;
    ShopRepository shopRepository;
    AttributeMapper attributeMapper;

    OrderResponse createItemOrder(OrderRequest request)
    {
        Item item = itemRepository.findById(request.getItemID()).orElseThrow(() -> new AppException(ErrorCode.ITEM_NOT_EXISTED));

        if(item.getQuantity() < request.getQuantity())
        {
            throw new AppException(ErrorCode.LACK_OF_QUANTITY);
        }

        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String login = authentication.getName();
        User user = userRepository.findById(userService.getUserID(login)).orElseThrow(()-> new AppException(ErrorCode.USER_NOT_EXISTED));

        Address address = addressRepository.findByUser(user).stream().filter(Address :: isDefaultAddress).findFirst().orElseThrow(null);
        if(request.getAddressID()!= null)
        {
            address = addressRepository.findById(request.getAddressID()).orElseThrow(() -> new AppException(ErrorCode.ADDRESS_NOT_EXISTED));
        }
        item.setQuantity(item.getQuantity()-request.getQuantity());
        itemRepository.save(item);


        OrderItem orderItem = OrderItem.builder()
                .items(item)
                .variants(null)
                .price(item.getPrice())
                .quantity(request.getQuantity())
                .build();
        orderItemRepository.save(orderItem);


        Set<OrderItem> orderItemSet = new HashSet<>();
        orderItemSet.add(orderItem);
        Orders orders = Orders.builder()
                .orderItems(orderItemSet)
                .total(orderItemSet.stream().mapToDouble(orderItem1 -> orderItem1.getQuantity() * orderItem1.getPrice()).sum())
                .delivery(request.getDelivery())
                .address(address)
                .user(user)
                .shop(item.getShop())
                .date(LocalDateTime.now())
                .build();
        orderRepository.save(orders);

        orderItem.setOrder(orders);
        orderItemRepository.save(orderItem);


        OrderStatus orderStatus = OrderStatus.builder()
                .status(Status.TO_SHIP.getStatus())
                .orders(orders)
                .date(orders.getDate())
                .build();

        Set<OrderStatus> orderStatuses = new HashSet<>();
        orderStatuses.add(orderStatus);
        orders.setOrderStatus(orderStatuses);
        orders.setCurrentStatus(orderStatus.getStatus());

        orderStatusRepository.save(orderStatus);

        orderRepository.save(orders);
        Set<ItemOrderedResponse> itemOrderedResponses = new HashSet<>();
        ItemOrderedResponse itemOrderedResponse = ItemOrderedResponse.builder()
                .quantity(request.getQuantity())
                .price(item.getPrice())
                .isReview(orderItem.isReview())
                .itemName(item.getName())
                .attributes(null)
                .itemID(item.getItemID())
                .build();
        itemOrderedResponses.add(itemOrderedResponse);
        return OrderResponse.builder()
                .orderID(orders.getOrderID())
                .items(itemOrderedResponses)
                .shopName(item.getShop().getShopName())
                .total(orders.getTotal())
                .date(orders.getDate())
                .orderStatus(orderStatus.getStatus())
                .delivery(request.getDelivery())
                .addressResponse(addressMapper.toAddressResponse(address))
                .build();
    }

    OrderResponse createVariantOrder(OrderRequest request)
    {
        Variant variant = variantRepository.findById(request.getVariantID()).orElseThrow(()-> new AppException(ErrorCode.ITEM_NOT_EXISTED));
        Item item = itemRepository.findById(request.getItemID()).orElseThrow(() -> new AppException(ErrorCode.ITEM_NOT_EXISTED));
        if(variant.getQuantity() < request.getQuantity())
        {
            throw new AppException(ErrorCode.LACK_OF_QUANTITY);
        }
        variant.setQuantity(variant.getQuantity()-request.getQuantity());
        variantRepository.save(variant);
        if(!item.getVariants().contains(variant))
        {
            throw new AppException(ErrorCode.ITEM_NOT_EXISTED);
        }
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String login = authentication.getName();
        User user = userRepository.findById(userService.getUserID(login)).orElseThrow(()-> new AppException(ErrorCode.USER_NOT_EXISTED));

        item.setQuantity(item.getQuantity()- request.getQuantity());
        itemRepository.save(item);

        Address address = addressRepository.findByUser(user).stream().filter(Address :: isDefaultAddress).findFirst().orElseThrow(null);
        if(request.getAddressID()!= null)
        {
            address = addressRepository.findById(request.getAddressID()).orElseThrow(() -> new AppException(ErrorCode.ADDRESS_NOT_EXISTED));
        }
        Set<OrderItem> orderItemSet = new HashSet<>();

        OrderItem orderItem = OrderItem.builder()
                .quantity(request.getQuantity())
                .price(item.getPrice())
                .variants(variant)
                .items(item)
                .build();

        orderItemRepository.save(orderItem);
        orderItemSet.add(orderItem);

        Orders orders = Orders.builder()
                .orderItems(orderItemSet)
                .date(LocalDateTime.now())
                .address(address)
                .user(user)
                .shop(item.getShop())
                .delivery(request.getDelivery())
                .total(variant.getPrice()* request.getQuantity())
                .build();

        orderRepository.save(orders);

        orderItem.setOrder(orders);
        orderItemRepository.save(orderItem);

        OrderStatus orderStatus = OrderStatus.builder()
                .orders(orders)
                .status(Status.TO_SHIP.getStatus())
                .date(orders.getDate())
                .build();

        orderStatusRepository.save(orderStatus);

        Set<OrderStatus> orderStatuses = new HashSet<>();
        orderStatuses.add(orderStatus);
        orders.setOrderStatus(orderStatuses);
        orders.setCurrentStatus(orderStatus.getStatus());

        orderRepository.save(orders);

        Set<AttributeResponse> aR = new HashSet<>();
        for(Attribute a : variant.getAttribute())
            {
                aR.add(attributeMapper.toAttributeResponse(a));
            }


        Set<ItemOrderedResponse> itemOrderedResponses = new HashSet<>();
        ItemOrderedResponse itemOrderedResponse = ItemOrderedResponse.builder()
                .itemName(item.getName())
                .attributes(aR)
                .price(variant.getPrice())
                .quantity(request.getQuantity())
                .isReview(orderItem.isReview())
                .itemID(item.getItemID())
                .build();
        itemOrderedResponses.add(itemOrderedResponse);
        return OrderResponse.builder()
                .orderID(orders.getOrderID())
                .shopName(item.getShop().getShopName())
                .items(itemOrderedResponses)
                .total(orders.getTotal())
                .date(orders.getDate())
                .delivery(request.getDelivery())
                .orderStatus(orderStatus.getStatus())
                .addressResponse(addressMapper.toAddressResponse(address))
                .build();
    }

    public OrderResponse orderFromItem(OrderRequest request)
    {
        if(request.getVariantID() == null)
        {
            return createItemOrder(request);
        }
        return createVariantOrder(request);
    }


    public OrderResponse updateOrderStatus(OrderUpdateStatusRequest request)
    {
        Orders order = orderRepository.findById(request.getOrderID()).orElseThrow(()-> new AppException(ErrorCode.ORDER_NOT_EXISTED));
        if(!userService.shopOwner(order.getShop()))
        {
            throw new AppException(ErrorCode.UPDATE_ORDER_STATUS_FAIL);
        }

        String status = Status.getStatusByCode(request.getStatusCode());


        OrderStatus orderStatus = OrderStatus.builder()
                .orders(order)
                .status(status)
                .date(LocalDateTime.now())
                .build();
        orderStatusRepository.save(orderStatus);
        Set<ItemOrderedResponse> itemOrderedResponses = new HashSet<>();
        order.setCurrentStatus(orderStatus.getStatus());
        orderRepository.save(order);
        for(OrderItem oi : order.getOrderItems())
        {
            Set<AttributeResponse> aR = new HashSet<>();
            if(oi.getVariants() != null && !oi.getVariants().getAttribute().isEmpty())
            {
                for(Attribute a : oi.getVariants().getAttribute())
                {
                    aR.add(attributeMapper.toAttributeResponse(a));
                }
            }
            ItemOrderedResponse itemOrderedResponse = ItemOrderedResponse.builder()
                    .price(oi.getPrice())
                    .quantity(oi.getQuantity())
                    .isReview(oi.isReview())
                    .attributes(aR)
                    .itemName(oi.getItems().getName())
                    .build();
            itemOrderedResponses.add(itemOrderedResponse);
        }
        if(request.getStatusCode()==4)
        {
            Set<OrderItem> items = order.getOrderItems();
            for(OrderItem oi : items)
            {
                Item item = oi.getItems();
                item.setQuantity(item.getQuantity() + oi.getQuantity());
                itemRepository.save(item);
            }
        }
        return OrderResponse.builder()
                .orderID(order.getOrderID())
                .shopName(order.getShop().getShopName())
                .date(orderStatus.getDate())
                .total(order.getTotal())
                .items(itemOrderedResponses)
                .delivery(order.getDelivery())
                .orderStatus(status)
                .build();
    }

    public Set<OrderResponse> orderFromCart(OrderFromCartRequest request)
    {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String userID = userService.getUserID(authentication.getName());
        User user = userRepository.findById(userID).orElseThrow(()-> new AppException(ErrorCode.USER_NOT_EXISTED));
        Cart cart = user.getCart();
        Map<Shop, Set<CartItem>> results = new HashMap<>();
        Set<Shop>  shops= new HashSet<>();
        Set<CartItem> cartItems = new HashSet<>();
        Address address = addressRepository.findByUser(user).stream().filter(Address :: isDefaultAddress)
                .findFirst().orElseThrow(null);

        if(request.getAddressID()!= null)
        {
            address = addressRepository.findById(request.getAddressID())
                    .orElseThrow(() -> new AppException(ErrorCode.ADDRESS_NOT_EXISTED));
        }

        for(Integer id : request.getCartItemID())
        {
            CartItem ct = cartItemRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.ITEM_NOT_EXISTED));
            if(!ct.getCart().equals(cart))
            {
                throw new AppException(ErrorCode.ITEM_NOT_IN_CART);
            }
            shops.add(ct.getItem().getShop());
            cartItems.add(ct);
        }

        for(Shop s : shops)
        {
            Set<CartItem> its = new HashSet<>();
            for(CartItem ct : cartItems)
            {
                if(ct.getItem().getShop().equals(s))
                {
                    its.add(ct);
                }
            }
            results.put(s, its);
        }

        Set<OrderResponse> orderResponses = new HashSet<>();

        for(Map.Entry<Shop, Set<CartItem>> entry : results.entrySet())
        {
            Set<OrderItem> orderItemSet = new HashSet<>();
            double total = 0.0;
            Set<ItemOrderedResponse> itemOrderedResponses = new HashSet<>();
            for (CartItem ct : entry.getValue())
            {
                if(ct.getItem().getQuantity() < ct.getQuantity())
                {
                    throw new AppException(ErrorCode.LACK_OF_QUANTITY);
                }
                OrderItem orderItem = OrderItem.builder()
                        .items(ct.getItem())
                        .variants(ct.getVariant())
                        .quantity(ct.getQuantity())
                        .price(ct.getPrice())
                        .build();
                orderItemRepository.save(orderItem);
                orderItemSet.add(orderItem);
                Item i = ct.getItem();
                i.setQuantity(i.getQuantity()-ct.getQuantity());
                itemRepository.save(i);
                total += orderItem.getPrice()*orderItem.getQuantity();
                Set<AttributeResponse> aR = new HashSet<>();
                if(ct.getVariant()!= null && !ct.getVariant().getAttribute().isEmpty())
                {
                    for(Attribute a : ct.getVariant().getAttribute())
                    {
                        aR.add(attributeMapper.toAttributeResponse(a));
                    }
                }
                ItemOrderedResponse itemOrderedResponse = ItemOrderedResponse.builder()
                        .itemName(ct.getItem().getName())
                        .attributes(aR)
                        .isReview(orderItem.isReview())
                        .quantity(ct.getQuantity())
                        .price(ct.getPrice())
                        .itemID(ct.getItem().getItemID())
                        .build();
                itemOrderedResponses.add(itemOrderedResponse);
            }
            Orders order = Orders.builder()
                    .shop(entry.getKey())
                    .orderItems(orderItemSet)
                    .user(user)
                    .date(LocalDateTime.now())
                    .total(total)
                    .address(address)
                    .delivery(request.getDelivery())
                    .build();
            orderRepository.save(order);

            for (OrderItem o : orderItemSet)
            {
                o.setOrder(order);
                orderItemRepository.save(o);
            }
            OrderStatus orderStatus = OrderStatus.builder()
                    .orders(order)
                    .status(Status.TO_SHIP.getStatus())
                    .date(order.getDate())
                    .build();
            orderStatusRepository.save(orderStatus);
            Set<OrderStatus> statusSet = new HashSet<>();
            statusSet.add(orderStatus);
            order.setOrderStatus(statusSet);
            order.setCurrentStatus(orderStatus.getStatus());
            OrderResponse orderResponse = OrderResponse.builder()
                    .orderID(order.getOrderID())
                    .orderStatus(Status.TO_SHIP.getStatus())
                    .shopName(entry.getKey().getShopName())
                    .items(itemOrderedResponses)
                    .delivery(request.getDelivery())
                    .total(order.getTotal())
                    .date(order.getDate())
                    .addressResponse(addressMapper.toAddressResponse(address))
                    .build();
            orderResponses.add(orderResponse);
        }
        cartItemRepository.deleteAll(cartItems);
        return orderResponses;
    }

    public Set<OrderResponse> getShopOrder()
    {
        var authentication = SecurityContextHolder.getContext().getAuthentication().getName();
        String userID = userService.getUserID(authentication);
        User user = userRepository.findById(userID).orElseThrow(()-> new AppException(ErrorCode.USER_NOT_EXISTED));
        Shop shop = shopRepository.findByUsername(user.getUsername()).orElseThrow(()-> new AppException(ErrorCode.SHOP_NOT_CREATED));

        Set<Orders> ordersSet = orderRepository.findByShopOrderByDateAsc(shop);

        Set<OrderResponse> response = new HashSet<>();

        for (Orders o : ordersSet)
        {
            Set<ItemOrderedResponse> iOR = new HashSet<>();
            for(OrderItem oi : o.getOrderItems())
            {
                Set<AttributeResponse> attributeResponses = new HashSet<>();
                if(oi.getVariants()!= null && !oi.getVariants().getAttribute().isEmpty())
                {
                   for(Attribute a : oi.getVariants().getAttribute())
                   {
                       attributeResponses.add(attributeMapper.toAttributeResponse(a));
                   }
                }

                iOR.add(ItemOrderedResponse.builder()
                                .price(oi.getPrice())
                                .quantity(oi.getQuantity())
                                .itemName(oi.getItems().getName())
                                .itemID(oi.getItems().getItemID())
                                .attributes(attributeResponses)
                        .build());
            }
            OrderResponse orderResponse = OrderResponse.builder()
                    .orderID(o.getOrderID())
                    .shopName(shop.getShopName())
                    .delivery(o.getDelivery())
                    .addressResponse(addressMapper.toAddressResponse(o.getAddress()))
                    .total(o.getTotal())
                    .date(o.getDate())
                    .orderStatus(o.getCurrentStatus())
                    .items(iOR)
                    .build();
            response.add(orderResponse);
        }
        return response;
    }

    public Set<OrderResponse> getUserOrders()
    {
        var authentication = SecurityContextHolder.getContext().getAuthentication().getName();
        String userID = userService.getUserID(authentication);
        User user = userRepository.findById(userID).orElseThrow(()-> new AppException(ErrorCode.USER_NOT_EXISTED));

        Set<Orders> orders = orderRepository.findByUserOrderByDateAsc(user);
        Set<OrderResponse> response = new HashSet<>();
        for (Orders o : orders)
        {
            Set<ItemOrderedResponse> iOR = new HashSet<>();
            for(OrderItem oi : o.getOrderItems())
            {
                ItemOrderedResponse itemOrderedResponse = ItemOrderedResponse.builder()
                        .itemID(oi.getItems().getItemID())
                        .price(oi.getPrice())
                        .quantity(oi.getQuantity())
                        .isReview(oi.isReview())
                        .itemName(oi.getItems().getName())
                        .build();
                Set<AttributeResponse> attributeResponses = new HashSet<>();
                if(oi.getVariants()!= null && !oi.getVariants().getAttribute().isEmpty())
                {
                    for(Attribute a : oi.getVariants().getAttribute())
                    {
                        attributeResponses.add(attributeMapper.toAttributeResponse(a));
                    }
                    itemOrderedResponse.setPrice(oi.getVariants().getPrice());
                }

                itemOrderedResponse.setAttributes(attributeResponses);
                iOR.add(itemOrderedResponse);
            }
            OrderResponse orderResponse = OrderResponse.builder()
                    .shopName(o.getShop().getShopName())
                    .orderID(o.getOrderID())
                    .delivery(o.getDelivery())
                    .addressResponse(addressMapper.toAddressResponse(o.getAddress()))
                    .total(o.getTotal())
                    .date(o.getDate())
                    .orderStatus(o.getCurrentStatus())
                    .items(iOR)
                    .build();
            response.add(orderResponse);
        }
        return response;
    }
}
