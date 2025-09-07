package com.example.Shopee.Service;

import com.example.Shopee.DTO.RequestDTO.ImageRequest;
import com.example.Shopee.DTO.ResponseDTO.ImageResponse;
import com.example.Shopee.DTO.ResponseDTO.ItemResponse;
import com.example.Shopee.Entity.Image;
import com.example.Shopee.Mapper.ImageMapper;
import com.example.Shopee.Repository.ImageRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ImageService {
    ImageMapper imageMapper;
    ImageRepository imageRepository;

    public ImageResponse saveImage(ImageRequest request)
    {
        Image image = imageMapper.toImage(request);
        return imageMapper.toImageResponse(imageRepository.save(image));
    }
}
