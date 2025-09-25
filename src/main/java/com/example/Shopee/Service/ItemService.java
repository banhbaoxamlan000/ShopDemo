package com.example.Shopee.Service;

import com.example.Shopee.DTO.RequestDTO.*;
import com.example.Shopee.DTO.ResponseDTO.*;
import com.example.Shopee.Entity.*;
import com.example.Shopee.Exception.AppException;
import com.example.Shopee.Exception.ErrorCode;
import com.example.Shopee.Mapper.*;
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
            List<Variant> result = new ArrayList<>();
            for(VariantRequest v : variants)
            {
                Variant variant = variantMapper.toVariant(v);
                variant.setAttribute(v.getAttribute());
                Image image = Image.builder()
                        .id(v.getImage().getPictureID())
                        .variant(variant)
                        .build();
                variant.setPictures(image);
                result.add(variantRepository.save(variant));
            }
            return new HashSet<>(result);
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
        item.setCategory(category);
        Set<Variant> result = new HashSet<>();
        if (!request.getVariants().isEmpty()) {
            for (VariantRequest v : request.getVariants()) {
                Variant variant = variantMapper.toVariant(v);
                variant.setAttribute(v.getAttribute());
                Variant variant1 = variantRepository.save(variant);
                Image image = Image.builder()
                        .id(v.getImage().getPictureID())
                        .variant(variant1)
                        .build();
                imageRepository.save(image);
                Image image1 = imageRepository.findById(v.getImage().getPictureID()).orElseThrow(()-> new AppException(ErrorCode.IMAGE_NOT_EXIST));
                variant.setPictures(image1);
                result.add(variantRepository.save(variant));
            }
        }
        item.setVariants(result);
        itemRepository.save(item);
        if(!request.getVariants().isEmpty())
        {
            int quantity = 0;
            for(Variant v : result)
            {
                quantity += v.getQuantity();
            }
            item.setQuantity(quantity);
        }
        List<Image> images = new ArrayList<>();

        for(ImageRequest imr : request.getPictures())
        {
            Image image = Image.builder()
                    .id(imr.getPictureID())
                    .item(item)
                    .build();
            imageRepository.save(image);
        }


        item.setPictures(images);
        ItemResponse itemResponse = itemMapper.toItemResponse(itemRepository.save(item));
        CategoryResponse categoryResponse = CategoryResponse.builder()
                .name(category.getName())
                .detail(category.getDetail())
                .build();

        itemResponse.setCategory(categoryResponse);
        return itemResponse;
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

    // chỉ lấy ra cover image của item
    public List<SearchItemResponse> searchItem(String request)
    {
        List<SearchItemResponse> responses = new ArrayList<>();

        List<Item> results = itemRepository.findByNameContainingIgnoreCaseOrderByRateAsc(request);

        for (Item i : results)
        {
            SearchItemResponse searchItemResponse = itemMapper.toSearchItemResponse(i);
//            ImageResponse imageResponse = ImageResponse.builder()
//                    .url(ImageUtils.decompressImage(i.getPictures().getFirst().getUrl()))
//                    .build();
//            searchItemResponse.setImage(imageResponse);
            searchItemResponse.setImageID(i.getPictures().getFirst().getId());
            responses.add(searchItemResponse);
        }

        return responses;
    }

    public Set<SearchItemResponse> getItemSuggestion()
    {
        return new HashSet<>(searchItem(""));
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
        item.setShop(null);
        itemRepository.save(item);
        Set<Variant> variants = item.getVariants();
        variantRepository.deleteAll(variants);
        List<Image> images = item.getPictures();
        imageRepository.deleteAll(images);
        cartItemRepository.deleteByItem(item);
        itemRepository.deleteById(itemID);
    }

    // chỉ lấy ra cover image của item
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
                s.setImageID(i.getPictures().getFirst().getId());
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
            s.setImageID(i.getPictures().getFirst().getId());
            responseList.add(s);
        }
        return responseList;
    }

    // thông tin chi tiết của item
    public ItemDetailResponse getItemDetail(Integer id)
    {
        Item item = itemRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.ITEM_NOT_EXISTED));
        Shop shop = item.getShop();



        ItemDetailResponse itemDetailResponse = new ItemDetailResponse();
        ItemResponse itemResponse = itemMapper.toItemResponse(item);
        List<String> imageResponses = new ArrayList<>();
        for (Image i : item.getPictures())
        {
            imageResponses.add(i.getId());
        }
        itemResponse.setImageID(imageResponses);

        Set<Variant> variants = item.getVariants();
        Set<AttributeResponse> attributeResponses = new HashSet<>();
        Set<VariantAttributeResponse> variantResponses = new HashSet<>();
        for(Variant v : variants)
        {
            Set<String> attributeValue = new HashSet<>();
            for(Attribute a : v.getAttribute())
            {
                attributeResponses.add(attributeMapper.toAttributeResponse(a));
                attributeValue.add(a.getValue());
            }
            VariantAttributeResponse variantResponse = new VariantAttributeResponse(v.getVariantID(), attributeValue, v.getPrice(), v.getQuantity());
            variantResponses.add(variantResponse);
        }

        CategoryResponse categories = categoryMapper.toCategoryResponse(item.getCategory());
        itemResponse.setCategory(categories);
        itemResponse.setAttributeResponses(attributeResponses);

        itemDetailResponse.setVariantResponses(variantResponses);

        itemDetailResponse.setItem(itemResponse);

        ShopResponse shopResponse = shopMapper.toShopResponse(shop);

        itemDetailResponse.setShop(shopResponse);
        Set<Item> items = itemRepository.findByShop(shop);
        shopResponse.setTotalProduct(items.size());
        List<ReviewResponse> responses = new ArrayList<>();
        for(Review r : item.getReviews())
        {
            List<String> pictures = imageRepository.findByReview(r).stream().map(Image::getId).toList();
            ReviewResponse rev = ReviewResponse.builder()
                    .rate(r.getRate())
                    .pictureID(pictures)
                    .date(r.getDate())
                    .username(r.getUser().getUsername())
                    .feedback(r.getFeedback())
                    .build();
            responses.add(rev);
        }
        itemDetailResponse.setReviewResponseSet(new HashSet<>(responses));
        return itemDetailResponse;
    }

    Set<Item> filterCategory(Set<Item> items, String name, String detail)
    {
        if(detail.isEmpty()) {
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

    public List<SearchItemResponse> searchByCriteria(String search, Double minPrice, Double maxPrice, Double rate, String name, String detail, String city)
    {
        Set<Item> items = new HashSet<>();
        if(name == null)
        {
            items = itemRepository.findByCriteria(minPrice, maxPrice, rate, search);
        }else {
            items = filterCategory(itemRepository.findByCriteria(minPrice, maxPrice, rate, search), name, detail);
        }

        if(city != null)
        {
            items = filterCity(items, city);
        }

        List<SearchItemResponse> responses = new ArrayList<>();
        for(Item i : items)
        {
            SearchItemResponse s = itemMapper.toSearchItemResponse(i);
            responses.add(s);
        }
        return responses;
    }

}
