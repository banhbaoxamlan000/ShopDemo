package com.example.Shopee.Controller;


import com.example.Shopee.DTO.ApiResponse;
import com.example.Shopee.DTO.RequestDTO.CategoryRequest;
import com.example.Shopee.DTO.ResponseDTO.CategoryResponse;
import com.example.Shopee.DTO.ResponseDTO.StringResponses;
import com.example.Shopee.Entity.Category;
import com.example.Shopee.Repository.CategoryRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/category")
public class CategoryController {
    CategoryRepository categoryRepository;

    @GetMapping("/name")
    ApiResponse<Set<StringResponses>> getAllCategory()
    {
        Set<Category> categorySet = new HashSet<>(categoryRepository.findAll());
        Set<StringResponses> responses = new HashSet<>();
        for(Category c : categorySet)
        {
            responses.add(StringResponses.builder().result(c.getName()).build());
        }
        return ApiResponse.<Set<StringResponses>>builder()
                .result(responses)
                .build();
    }

    @PostMapping("/detail")
    ApiResponse<Set<StringResponses>> getCategory(@RequestBody CategoryRequest request)
    {
        Set<Category> categories = categoryRepository.findByName(request.getName());
        Set<StringResponses> responses = new HashSet<>();
        for(Category c : categories)
        {
            responses.add(StringResponses.builder()
                    .result(c.getDetail())
                    .build());
        }
        return ApiResponse.<Set<StringResponses>>builder()
                .result(responses)
                .build();
    }
}
