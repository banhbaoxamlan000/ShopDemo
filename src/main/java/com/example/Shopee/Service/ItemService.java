package com.example.Shopee.Service;

import com.example.Shopee.DTO.RequestDTO.*;
import com.example.Shopee.DTO.ResponseDTO.*;
import com.example.Shopee.Entity.*;
import com.example.Shopee.Exception.AppException;
import com.example.Shopee.Exception.ErrorCode;
import com.example.Shopee.Mapper.*;
import com.example.Shopee.Repository.*;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

// THÊM XOÁ SỬA TÌM SẢN PHẨM

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional
public class ItemService {

    ItemRepository itemRepository;
    ShopRepository shopRepository;
    UserRepository userRepository;
    ItemMapper itemMapper;
    UserService userService;
    ShopService shopService;
    VariantRepository variantRepository;
    VariantMapper variantMapper;
    CategoryRepository categoryRepository;
    ShopMapper shopMapper;
    CartItemRepository cartItemRepository;
    ImageMapper imageMapper;
    ImageRepository imageRepository;
    CategoryMapper categoryMapper;
    AttributeMapper attributeMapper;

    public String getItem(Integer itemID)
    {
        Item item = itemRepository.findById(itemID).orElseThrow(()-> new AppException(ErrorCode.ITEM_NOT_EXISTED));
        return item.getName();
    }

    public Set<Variant> saveVariant(Set<VariantRequest> variants)
    {
        if (!variants.isEmpty())
        {
            Set<Variant> result = new HashSet<>();
            for(VariantRequest v : variants)
            {
                Variant variant = variantMapper.toVariant(v);
                variant.setAttribute(v.getAttribute());

                Image image = imageMapper.toImage(v.getPictures());
                imageRepository.save(image);
                variant.setPictures(image);
                result.add(variantRepository.save(variant));
            }
            return result;
        }
        return null;
    }

    public ItemResponse addItem(ItemRequest request)
    {
        var context = SecurityContextHolder.getContext();
        String login =context.getAuthentication().getName();
        String userID = userService.getUserID(login);
        User user = userRepository.findById(userID)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        Shop shop = shopRepository.findByUsername(user.getUsername())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        if(itemRepository.existsByNameAndShop_ShopID(request.getName(), shop.getShopID()))
            throw new AppException(ErrorCode.ITEM_EXISTED);
        Category category = categoryRepository.findByNameAndDetail(request.getCategory().getName(), request.getCategory().getDetail());
        Item item = itemMapper.toItem(request);
        item.setShop(shop);
        Set<Variant> results = saveVariant(request.getVariants());
        item.setVariants(results);
        if(!request.getVariants().isEmpty())
        {
            int quantity = 0;
            for(Variant v : results)
            {
                quantity += v.getQuantity();
            }
            item.setQuantity(quantity);
        }
        List<Image> images = new ArrayList<>();
        List<ImageResponse> imageResponses = new ArrayList<>();
        for(ImageRequest ir : request.getPictures())
        {
            Image img = imageMapper.toImage(ir);
            images.add(img);
            imageResponses.add(imageMapper.toImageResponse(img));
            img.setItem(item);
            imageRepository.save(img);
        }

        item.setCategory(category);
        item.setPictures(images);
        ItemResponse response = itemMapper.toItemResponse(itemRepository.save(item));
        response.setPictures(imageResponses);
        return response;
    }

    public ItemResponse updateItem(ItemUpdateRequest request)
    {
        Item item = itemRepository.findById(request.getItemID()).orElseThrow(() -> new AppException(ErrorCode.ITEM_NOT_EXISTED));
        if(!userService.ownerShip(item))
        {
            throw new AppException(ErrorCode.NON_OWNERSHIP);
        }
        itemMapper.updateItem(request, item);
        Category category = categoryRepository.findByNameAndDetail(request.getCategory().getName(), request.getCategory().getDetail());
        item.setCategory(category);
        variantRepository.deleteAll(item.getVariants());
        item.setVariants(saveVariant(request.getVariants()));
        if(!request.getVariants().isEmpty())
        {
            int quantity = 0;
            for (VariantRequest v : request.getVariants())
            {
                quantity += v.getQuantity();
            }
            item.setQuantity(quantity);
        }
        itemRepository.save(item);
        return itemMapper.toItemResponse(item);
    }

    public List<SearchItemResponse> searchItem(String request)
    {
        List<SearchItemResponse> responses = new ArrayList<>();

        List<Item> results = itemRepository.findByNameContainingIgnoreCaseOrderByRateAsc(request);

        for (Item i : results)
        {
            responses.add(itemMapper.toSearchItemResponse(i));
        }

        return responses;
    }

    public SearchResponse search(String search)
    {
        List<SearchItemResponse> itemResponses = searchItem(search);
        List<ShopResponse> shopResponses = shopService.searchShop(search);
        return SearchResponse.builder()
                .itemResponse(itemResponses)
                .shopResponses(shopResponses)
                .build();
    }

    public void deleteItem(Integer itemID)
    {
        Item item = itemRepository.findById(itemID).orElseThrow(() -> new AppException(ErrorCode.ITEM_NOT_EXISTED));
        if(!userService.ownerShip(item))
        {
            throw new AppException(ErrorCode.NON_OWNERSHIP);
        }
        item.setCategory(null);
        itemRepository.save(item);
        cartItemRepository.deleteByItem(item);
        itemRepository.deleteById(itemID);
    }

    public List<SearchItemResponse> searchByCate(CategoryRequest request)
    {
        if(!request.getDetail().equals(""))
        {
            List<Item> results = itemRepository.findByCategory(categoryRepository
                    .findByNameAndDetail(request.getName(), request.getDetail()))
                    .stream().toList();
            List<SearchItemResponse> responseList = new ArrayList<>();
            for(Item i : results)
            {
                SearchItemResponse s = itemMapper.toSearchItemResponse(i);
                s.setPictures(imageMapper.toImageResponse(i.getPictures().getFirst()));
                responseList.add(s);
            }
            return responseList;
        }
        Set<Item> results = new HashSet<>();
        Set<Category> categories = categoryRepository.findByName(request.getName());
        for(Category cate : categories)
        {
            categoryRepository.findByName(cate.getName())
                    .forEach(ctgr -> {results.addAll(itemRepository.findByCategory(ctgr));});
        }
        List<Item> responses = results.stream().sorted(Comparator.comparingDouble(Item::getRate)).toList();
        List<SearchItemResponse> responseList = new ArrayList<>();
        for(Item i : responses)
        {
            SearchItemResponse s = itemMapper.toSearchItemResponse(i);
            s.setPictures(imageMapper.toImageResponse(i.getPictures().getFirst()));
            responseList.add(s);
        }
        return responseList;
    }

    public ItemDetailResponse getItemDetail(Integer id)
    {
        Item item = itemRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.ITEM_NOT_EXISTED));
        Shop shop = item.getShop();



        ItemDetailResponse itemDetailResponse = new ItemDetailResponse();
        ItemResponse itemResponse = itemMapper.toItemResponse(item);
        List<ImageResponse> imageResponses = new ArrayList<>();
        for (Image i : item.getPictures())
        {
            imageResponses.add(new ImageResponse(i.getUrl()));
        }
        itemResponse.setPictures(imageResponses);

        Set<Variant> variants = item.getVariants();
        Set<VariantResponse> variantResponses = new HashSet<>();
        for(Variant v : variants)
        {
            VariantResponse vr = variantMapper.toVariantResponse(v);
            vr.setPictures(new ImageResponse(v.getPictures().getUrl()));
            Set<AttributeResponse> attributeResponses = new HashSet<>();
            for(Attribute a : v.getAttribute())
            {
                attributeResponses.add(attributeMapper.toAttributeResponse(a));
            }
            vr.setAttributes(attributeResponses);
            vr.setItemName(item.getName());
            vr.setShopName(shop.getShopName());
            variantResponses.add(vr);
        }

        CategoryResponse categories = categoryMapper.toCategoryResponse(item.getCategory());
        itemResponse.setCategory(categories);
        itemResponse.setVariants(variantResponses);

        itemDetailResponse.setItem(itemResponse);

        ShopResponse shopResponse = shopMapper.toShopResponse(shop);
        shopResponse.setPictures(new ImageResponse(shop.getPictures().getUrl()));

        itemDetailResponse.setShop(shopResponse);
        List<ReviewResponse> responses = new ArrayList<>();
        for(Review r : item.getReviews())
        {
            System.out.println(r.getClass());
            List<ImageResponse> imgResponse = new ArrayList<>();
            for(Image i : r.getReviewImage())
            {
                imgResponse.add(imageMapper.toImageResponse(i));
            }

            ReviewResponse rev = ReviewResponse.builder()
                    .rate(r.getRate())
                    .username(r.getUser().getUsername())
                    .feedback(r.getFeedback())
                    .imageResponses(imgResponse)
                    .build();
            responses.add(rev);
        }
        itemDetailResponse.setReviewResponseSet(new HashSet<>(responses));
        return itemDetailResponse;
    }

    Set<Item> filterCategory(Set<Item> items, String name, String detail)
    {
        if(detail == null)
            {
                return  categoryRepository.findByName(name).stream()
                        .flatMap(category -> items.stream()
                                .filter(item -> item.getCategory().equals(category)))
                        .collect(Collectors.toSet());
            }else{
                Category category = categoryRepository.findByNameAndDetail(name, detail);

                return items.stream().filter(item -> item.getCategory().equals(category)).collect(Collectors.toSet());
        }

    }

    Set<Item> filterCity(Set<Item> items, String city)
    {
        return items.stream().filter(item -> item.getShop().getAddress().getCity().equals(city)).collect(Collectors.toSet());
    }

    public List<SearchItemResponse> searchByCriteria(Double minPrice, Double maxPrice, Double rate, String name, String detail, String city)
    {
        Set<Item> items = new HashSet<>();
        if(name == null)
        {
            items = itemRepository.findByCriteria(minPrice, maxPrice, rate);
        }else {
            items = filterCategory(itemRepository.findByCriteria(minPrice, maxPrice, rate), name, detail);
        }

        if(city != null)
        {
            items = filterCity(items, city);
        }

        List<SearchItemResponse> responses = new ArrayList<>();
        for(Item i : items)
        {
            SearchItemResponse s = itemMapper.toSearchItemResponse(i);
            s.setPictures(imageMapper.toImageResponse(i.getPictures().getFirst()));
            responses.add(s);
        }
        return responses;
    }

}
