package com.example.Shopee.Service;

import com.example.Shopee.DTO.RequestDTO.ImageRequest;
import com.example.Shopee.DTO.RequestDTO.ItemSuggestRequest;
import com.example.Shopee.DTO.RequestDTO.SearchRequest;
import com.example.Shopee.DTO.ResponseDTO.ImageResponse;
import com.example.Shopee.DTO.ResponseDTO.ItemResponse;
import com.example.Shopee.Entity.*;
import com.example.Shopee.Exception.AppException;
import com.example.Shopee.Exception.ErrorCode;
import com.example.Shopee.Mapper.ImageMapper;
import com.example.Shopee.Repository.*;
import com.example.Shopee.Utils.ImageUtils;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional
public class ImageService {
    ImageMapper imageMapper;
    ImageRepository imageRepository;
    UserService userService;
    UserRepository userRepository;
    ShopRepository shopRepository;
    private final ItemRepository itemRepository;
    private final VariantRepository variantRepository;

    public ImageResponse saveImage(MultipartFile file) throws IOException {
        Image image = Image.builder()
                .url(ImageUtils.compressImage(file.getBytes()))
                .build();

        return ImageResponse.builder()
                .url(ImageUtils.decompressImage(image.getUrl()))
                .build();
    }

    public String saveImages(List<MultipartFile> files, List<String> codes) throws IOException {
        if(files.size() != codes.size())
        {
            throw new AppException(ErrorCode.INVALID_NUMBER_IMAGES);
        }
        for(int i = 0; i< files.size(); i++)
        {
            Image image = imageRepository.findById(codes.get(i)).orElseThrow(()-> new AppException(ErrorCode.IMAGE_NOT_EXIST));
            image.setUrl(ImageUtils.compressImage(files.get(i).getBytes()));
            imageRepository.save(image);
        }
        return "Images saved successfully";
    }

    public byte[] getUSerAvatar()
    {
        var context = SecurityContextHolder.getContext();
        String login =context.getAuthentication().getName();
        String userID = userService.getUserID(login);

        User user = userRepository.findById(userID).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        return ImageUtils.decompressImage(user.getPictures());
    }

    public byte[] getShopAvatar()
    {
        var context = SecurityContextHolder.getContext();
        String login =context.getAuthentication().getName();
        String userID = userService.getUserID(login);

        User user = userRepository.findById(userID).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Shop shop = shopRepository.findByUsername(user.getUsername()).orElseThrow(()-> new AppException(ErrorCode.SHOP_NOT_CREATED));
        return ImageUtils.decompressImage(shop.getPictures());
    }

    public byte[] getShopAvatar1(ImageRequest request)
    {
        Shop shop = shopRepository.findById(request.getPictureID()).orElseThrow(()-> new AppException(ErrorCode.SHOP_NOT_CREATED));
        return ImageUtils.decompressImage(shop.getPictures());
    }

    public byte[] getImageCoverImage(Integer itemID)
    {
        Item item = itemRepository.findById(itemID).orElseThrow(()-> new AppException(ErrorCode.ITEM_NOT_EXISTED));
        return ImageUtils.decompressImage(imageRepository.findByItem(item).getFirst().getUrl());
    }

    public byte[] getImage(String imageID)
    {
        Image image = imageRepository.findById(imageID).orElseThrow(()-> new AppException(ErrorCode.ITEM_NOT_EXISTED));
        return ImageUtils.decompressImage(image.getUrl());
    }

    public byte[] getVariantImage(Integer variantID)
    {
        Variant variant = variantRepository.findById(variantID).orElseThrow(()-> new AppException(ErrorCode.INVALID_VARIANT));
        return ImageUtils.decompressImage(variant.getPictures().getUrl());
    }

}
