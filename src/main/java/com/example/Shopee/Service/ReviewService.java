package com.example.Shopee.Service;

import com.example.Shopee.DTO.RequestDTO.FeedbackRequest;
import com.example.Shopee.DTO.RequestDTO.ImageRequest;
import com.example.Shopee.DTO.RequestDTO.ReviewRequest;
import com.example.Shopee.DTO.ResponseDTO.ImageResponse;
import com.example.Shopee.DTO.ResponseDTO.ReviewResponse;
import com.example.Shopee.Entity.*;
import com.example.Shopee.Enums.Status;
import com.example.Shopee.Exception.AppException;
import com.example.Shopee.Exception.ErrorCode;
import com.example.Shopee.Mapper.ImageMapper;
import com.example.Shopee.Mapper.ReviewMapper;
import com.example.Shopee.Repository.*;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ReviewService {
    ReviewRepository reviewRepository;
    UserService userService;
    UserRepository userRepository;
    ItemRepository itemRepository;
    OrderRepository orderRepository;
    OrderItemRepository orderItemRepository;
    ImageMapper imageMapper;
    ReviewMapper reviewMapper;
    private final ShopRepository shopRepository;


    @Transactional
    public Set<ReviewResponse> writeFeedback(ReviewRequest request)
    {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String userID = userService.getUserID(authentication.getName());
        User user = userRepository.findById(userID).orElseThrow(()-> new AppException(ErrorCode.USER_NOT_EXISTED));
        Orders orders = orderRepository.findById(request.getOrderID()).orElseThrow(()-> new AppException(ErrorCode.ORDER_NOT_EXISTED));


        if(!orders.getDate().plusDays(30).isAfter(LocalDateTime.now()))
        {
            throw new AppException(ErrorCode.OVERTIME_REVIEW);
        }

        Set<OrderItem> orderItems = new HashSet<>();
        for (FeedbackRequest fR : request.getFeedbacks())
        {
            orderItems.add(orderItemRepository.findById(fR.getOrderItemID())
                    .orElseThrow(()-> new AppException(ErrorCode.NO_RIGHT_REVIEW)));
        }

        Set<ReviewResponse> response = new HashSet<>();
        for(OrderItem oi : orderItems)
        {
            if(oi.isReview())
            {
                throw new AppException(ErrorCode.ALREADY_REVIEW);
            }

            if(!orders.getOrderItems().contains(oi))
            {
                throw new AppException(ErrorCode.NO_RIGHT_REVIEW);
            }
            Item item = oi.getItems();

            FeedbackRequest feedbackRequest = request.getFeedbacks().stream()
                    .filter(FeedbackRequest -> FeedbackRequest.getOrderItemID().equals(oi.getOrderItemID()))
                    .findFirst().orElseThrow(()-> new AppException(ErrorCode.NO_RIGHT_REVIEW));
            List<Image> reviewImage = new ArrayList<>();
            for (ImageRequest imageRequest : feedbackRequest.getImageRequests())
            {
                reviewImage.add(imageMapper.toImage(imageRequest));
            }
            Review review = Review.builder()
                    .feedback(feedbackRequest.getFeedback())
                    .rate(feedbackRequest.getRate())
                    .date(LocalDate.now())
                    .user(user)
                    .item(item)
                    .reviewImage(reviewImage)
                    .build();
            reviewRepository.save(review);
            List<Review> reviews = item.getReviews();
            reviews.add(review);
            item.setReviews(reviews);

            int total = item.getReviews().stream().mapToInt(Review::getRate).sum();
            int quantity = item.getReviews().size();
            item.setRate((double)total / quantity);

            itemRepository.save(item);
            List<ImageResponse> imageResponses = new ArrayList<>();
            for(Image i : reviewImage)
            {
                imageResponses.add(imageMapper.toImageResponse(i));
            }

            oi.setReview(true);
            orderItemRepository.save(oi);

            ReviewResponse reviewResponse = reviewMapper.toReviewResponse(review);
            reviewResponse.setUsername(user.getUsername());
            reviewResponse.setImageResponses(imageResponses);
            response.add(reviewResponse);
        }


        Shop shop = orders.getShop();
        Set<Item> items = itemRepository.findByShop(shop);
        int ratings = 0;
        double total = 0.0;
        for(Item i : items)
        {
            ratings += i.getReviews().size();
            total += i.getReviews().stream().mapToDouble(Review :: getRate).sum();
        }
        shop.setRatings(ratings);
        shop.setRate(total / ratings);
        return response;
    }
}
