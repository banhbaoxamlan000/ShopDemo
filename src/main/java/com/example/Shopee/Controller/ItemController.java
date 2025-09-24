package com.example.Shopee.Controller;

import com.example.Shopee.DTO.ApiResponse;
import com.example.Shopee.DTO.RequestDTO.CategoryRequest;
import com.example.Shopee.DTO.RequestDTO.ItemRequest;
import com.example.Shopee.DTO.RequestDTO.SearchRequest;
import com.example.Shopee.DTO.ResponseDTO.*;
import com.example.Shopee.Entity.Item;
import com.example.Shopee.Repository.ShopRepository;
import com.example.Shopee.Service.ItemService;
import com.example.Shopee.Service.ShopService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/shopee")
public class ItemController {

    ItemService itemService;
    ShopService shopService;

    @GetMapping("/item/{id}")
    ApiResponse<ItemDetailResponse> itemInfo(@PathVariable Integer id)
    {
        return ApiResponse.<ItemDetailResponse>builder()
                .result(itemService.getItemDetail(id))
                .build();
    }


    @PostMapping("/create")
    ApiResponse<ItemResponse> createItem(@RequestBody ItemRequest request)
    {
        return ApiResponse.<ItemResponse>builder()
                .result(itemService.addItem(request))
                .build();
    }


    @GetMapping("/shop/{id}")
    ApiResponse<ShopDetailResponse> shopInfo(@PathVariable String id)
    {
        return ApiResponse.<ShopDetailResponse>builder()
                .result(shopService.getShopInfo(id))
                .build();
    }

    @GetMapping("/main")
    ApiResponse<Set<SearchItemResponse>> getItemSuggestion()
    {
        return ApiResponse.<Set<SearchItemResponse>>builder()
                .result(itemService.getItemSuggestion())
                .build();
    }

    @PostMapping("/search")
    ApiResponse<SearchResponse> searchItem(@RequestBody SearchRequest search)
    {
        return ApiResponse.<SearchResponse>builder()
                .result(itemService.search(search.getSearch()))
                .build();
    }

    @PostMapping("/category")
    ApiResponse<List<SearchItemResponse>> searchByCate(@RequestBody CategoryRequest request)
    {
        return ApiResponse.<List<SearchItemResponse>>builder()
                .result(itemService.searchByCate(request))
                .build();
    }

    @DeleteMapping("/delete/{id}")
    ApiResponse<String> deleteUser(@PathVariable("id") Integer itemID)
    {
        String item = itemService.getItem(itemID);
        itemService.deleteItem(itemID);
        return ApiResponse.<String>builder()
                .result("Deleted " + item)
                .build();
    }

    @GetMapping("/search")
    ApiResponse<List<SearchItemResponse>> searchItemByCriteria(@RequestParam(name = "minPrice", required = false) Double minPrice,
                                                               @RequestParam(name = "maxPrice", required = false) Double maxPrice,
                                                               @RequestParam(name = "rate", required = false) Double rate,
                                                               @RequestParam (name = "name", required = false) String name,
                                                               @RequestParam(name = "detail", required = false) String detail,
                                                               @RequestParam(name = "city", required = false) String city)
    {
        return ApiResponse.<List<SearchItemResponse>>builder()
                .result(itemService.searchByCriteria(minPrice, maxPrice, rate, name, detail, city))
                .build();
    }

}
