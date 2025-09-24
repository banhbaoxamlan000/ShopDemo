package com.example.Shopee.Controller;

import com.example.Shopee.DTO.ApiResponse;
import com.example.Shopee.DTO.RequestDTO.ImageRequest;
import com.example.Shopee.DTO.RequestDTO.ItemSuggestRequest;
import com.example.Shopee.DTO.RequestDTO.SearchRequest;
import com.example.Shopee.DTO.ResponseDTO.ImageResponse;
import com.example.Shopee.Service.ImageService;
import com.example.Shopee.Service.ItemService;
import com.example.Shopee.Service.ShopService;
import com.example.Shopee.Service.UserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ImageController {

    UserService userService;
    ImageService imageService;
    ShopService shopService;

    @PostMapping(value = "/item/saveImages", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<String> saveImages(
            @RequestParam("images") List<MultipartFile> files,
            @RequestParam("codes") List<String> codes
    ) throws IOException {
        return ApiResponse.<String>builder()
                .result(imageService.saveImages(files, codes))
                .build();
    }

    @GetMapping("/item/coverImage/{itemID}")
    ResponseEntity<?> getItemCoverImage(@PathVariable("itemID") Integer itemID)
    {
        return ResponseEntity.status(HttpStatus.OK).contentType(MediaType.valueOf("image/png"))
                .body(imageService.getImageCoverImage(itemID));
    }

    @GetMapping("/variant/{variantID}")
    ResponseEntity<?> getVariantImage(@PathVariable("variantID") Integer variantID)
    {
        return ResponseEntity.status(HttpStatus.OK).contentType(MediaType.valueOf("image/png"))
                .body(imageService.getVariantImage(variantID));
    }

    @PostMapping("/users/update/avatar")
    ApiResponse<String> updateAvatar(@RequestPart(name = "image") MultipartFile file) throws IOException {
        return ApiResponse.<String>builder()
                .result(userService.updateAvatar(file))
                .build();
    }

    @GetMapping("/users/avatar")
    ResponseEntity<?> getUserAvatar()
    {
        return ResponseEntity.status(HttpStatus.OK).contentType(MediaType.valueOf("image/png"))
                .body(imageService.getUSerAvatar());
    }

    @PostMapping("/shop/update/avatar")
    ApiResponse<String> updateShopAvatar(@RequestPart(name = "image") MultipartFile file) throws IOException {
        return ApiResponse.<String>builder()
                .result(shopService.updateShopAvatar(file))
                .build();
    }

    @GetMapping("/shop/avatar")
    ResponseEntity<?> getShopAvatar()
    {
        return ResponseEntity.status(HttpStatus.OK).contentType(MediaType.valueOf("image/png"))
                .body(imageService.getShopAvatar());
    }

    @PostMapping("/shop/avatar")
    ResponseEntity<?> getShopAvatar1(@RequestBody ImageRequest imageRequest)
    {
        return ResponseEntity.status(HttpStatus.OK).contentType(MediaType.valueOf("image/png"))
                .body(imageService.getShopAvatar1(imageRequest));
    }

    @GetMapping("/item/image/{imageID}")
    ResponseEntity<?> getItemImage(@PathVariable("imageID") String imageID)
    {
        return ResponseEntity.status(HttpStatus.OK).contentType(MediaType.valueOf("image/png"))
                .body(imageService.getImage(imageID));
    }
}
