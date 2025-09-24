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
import java.util.stream.Collectors;

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
    private final ImageRepository imageRepository;


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

        Set<Item> items = new HashSet<>();
        for(FeedbackRequest feedbackRequest : request.getFeedbacks())
        {
            items.add(itemRepository.findById(feedbackRequest.getItemID()).orElseThrow(()-> new AppException(ErrorCode.ITEM_NOT_EXISTED)));
        }

        Set<ReviewResponse> response = new HashSet<>();

        for(Item item : items)
        {
            FeedbackRequest feedbackRequest = request.getFeedbacks().stream()
                    .filter(FeedbackRequest -> FeedbackRequest.getItemID().equals(item.getItemID()))
                    .findFirst().orElseThrow(()-> new AppException(ErrorCode.NO_RIGHT_REVIEW));

            Review review = Review.builder()
                    .feedback(feedbackRequest.getFeedback())
                    .rate(feedbackRequest.getRate())
                    .date(LocalDate.now())
                    .user(user)
                    .item(item)
                    .build();
            reviewRepository.save(review);
            for (ImageRequest imageRequest : feedbackRequest.getImageRequests())
            {
                Image image = Image.builder()
                        .id(imageRequest.getPictureID())
                        .review(review)
                        .build();
                imageRepository.save(image);
            }

            List<Review> reviews = item.getReviews();
            reviews.add(review);
            item.setReviews(reviews);

            int total = item.getReviews().stream().mapToInt(Review::getRate).sum();
            int quantity = item.getReviews().size();
            item.setRate((double)total / quantity);

            itemRepository.save(item);


            Set<OrderItem> orderItems = orders.getOrderItems().stream().filter(orderItem -> orderItem.getItems().equals(item)).collect(Collectors.toSet());
            for(OrderItem oi : orderItems)
            {
                oi.setReview(true);
                orderItemRepository.save(oi);
            }

            ReviewResponse reviewResponse = reviewMapper.toReviewResponse(review);
            reviewResponse.setUsername(user.getUsername());
            response.add(reviewResponse);
        }


        Shop shop = orders.getShop();
        Set<Item> itemSet = itemRepository.findByShop(shop);
        int ratings = 0;
        double total = 0.0;
        for(Item i : itemSet)
        {
            ratings += i.getReviews().size();
            total += i.getReviews().stream().mapToDouble(Review :: getRate).sum();
        }
        shop.setRatings(ratings);
        shop.setRate(total / ratings);
        return response;
    }

    public Set<ReviewResponse> getFeedback(Integer itemID)
    {
        Item item = itemRepository.findById(itemID).orElseThrow(()-> new AppException(ErrorCode.ITEM_NOT_EXISTED));
        Set<Review> reviews = reviewRepository.findByItem(item);
        Set<ReviewResponse> responses = new HashSet<>();
        for(Review review : reviews)
        {
            ReviewResponse reviewResponse = reviewMapper.toReviewResponse(review);
            reviewResponse.setUsername(review.getUser().getUsername());
            responses.add(reviewResponse);
        }
        return responses;
    }
}
