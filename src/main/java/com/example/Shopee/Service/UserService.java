package com.example.Shopee.Service;

import com.example.Shopee.DTO.RequestDTO.*;
import com.example.Shopee.DTO.ResponseDTO.*;
import com.example.Shopee.Entity.*;
import com.example.Shopee.Entity.PendingUser;
import com.example.Shopee.Enums.PredefinedRole;
import com.example.Shopee.Exception.AppException;
import com.example.Shopee.Exception.ErrorCode;
import com.example.Shopee.Mapper.AddressMapper;
import com.example.Shopee.Mapper.ImageMapper;
import com.example.Shopee.Mapper.UserMapper;
import com.example.Shopee.Repository.*;
import com.example.Shopee.Utils.ImageUtils;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jwt.SignedJWT;
import jakarta.transaction.Transactional;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.text.ParseException;
import java.time.LocalDate;
import java.util.*;
import java.util.function.Predicate;

// ĐĂNG KÝ, ĐĂNG NHẬP, LẤY THÔNG TIN, CẬP NHẬT THÔNG TIN VÀ CẤM NGƯỜI DÙNG

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional
public class UserService {
    UserRepository userRepository;
    UserMapper userMapper;
    PasswordEncoder passwordEncoder;
    RoleRepository roleRepository;
    AuthenticationService authenticationService;
    private final ShopRepository shopRepository;
    ImageMapper imageMapper;
    MailService mailService;
    PendingUserRepository pendingUserRepository;
    AddressRepository addressRepository;
    AddressMapper addressMapper;
    CartService cartService;

    public String getUserID(String login)
    {
        if(userRepository.existsByUsername(login)) {
            User result = userRepository.findByUsername(login).orElseThrow(
                    () -> new AppException(ErrorCode.USER_NOT_EXISTED));
            return result.getUserID();
        }
        if(userRepository.existsByPhone(login)) {
            User result = userRepository.findByPhone(login).orElseThrow(
                    () -> new AppException(ErrorCode.USER_NOT_EXISTED));
            return result.getUserID();
        }
        if(userRepository.existsByEmail(login)) {
            User result = userRepository.findByEmail(login).orElseThrow(
                    () -> new AppException(ErrorCode.USER_NOT_EXISTED));
            return result.getUserID();
        }
        throw new AppException(ErrorCode.USER_NOT_EXISTED);
    }

    String generateRandomNumber() {
        Random random = new Random();
        StringBuilder code = new StringBuilder();
        for (int i = 0; i < 6; i++) {
            code.append(random.nextInt(10));
        }
        return code.toString();
    }


    public UserResponse verify(VerificationRequest request)
    {
        PendingUser pendingUser = pendingUserRepository.findByEmail(request.getEmail())
                .orElseThrow(()-> new AppException(ErrorCode.USER_NOT_EXISTED));
        pendingUser.isVerified();
        if(!pendingUser.isVerified())
        {
            boolean abc = request.getCode().equals(pendingUser.getCode());
            if(request.getCode().equals(pendingUser.getCode()))
            {
                User user = userMapper.toUser(pendingUser);
                user.setActive(true);
                user.setPassword(pendingUser.getPassword());
                Set<Role> roles= new HashSet<>();
                roleRepository.findById(PredefinedRole.USER_ROLE.getRole()).ifPresent(roles::add);
                user.setRoles(roles);
                user.setCreateAt(LocalDate.now());

                UserResponse result = userMapper.toUserResponse(userRepository.save(user));
                pendingUser.setVerified(true);
                pendingUserRepository.save(pendingUser);


                return result;
            }
            throw new AppException(ErrorCode.INVALID_VERIFY_CODE);
        }
        throw new AppException(ErrorCode.USER_EXISTED);
    }

    public UserResponse userRegistration(UserRegistration request) throws IOException {

        if(pendingUserRepository.existsByUsernameOrEmailOrPhone(request.getUsername(), request.getEmail(), request.getPhone())
                && !userRepository.existsByUsername(request.getUsername()))
        {
            return null;
        }

        PendingUser pendingUser = userMapper.toPendingUser(request);


        pendingUser.setCode(generateRandomNumber());
        pendingUser.setGender(request.getGender());
        pendingUser.setPassword(passwordEncoder.encode(request.getPassword()));
        pendingUserRepository.save(pendingUser);
        mailService.sendMail(request.getEmail(), pendingUser.getCode());
        UserResponse result = userMapper.pendingUserToUserResponse(pendingUser);
        result.setUserID(pendingUser.getID().toString());

        return result;
    }


    public List<UserResponse> findAllUsers()
    {
        List<User> users = userRepository.findAll();
        List<UserResponse> results = new ArrayList<>();
        for( User user : users)
        {
            results.add(userMapper.toUserResponse(user));
        }
        return results;
    }

    public UserResponse getMyInfo()
    {
        var context = SecurityContextHolder.getContext();
        String login =context.getAuthentication().getName();
        String userID = getUserID(login);

        User user = userRepository.findById(userID).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        if(!user.getActive())
            throw new AppException(ErrorCode.BANNED);
        UserResponse userResponse = userMapper.toUserResponse(user);

        Set<Role> roles = user.getRoles();
        Set<AddressResponse> addressResponses = new HashSet<>();
        for(Address a : addressRepository.findByUser(user))
        {
            addressResponses.add(addressMapper.toAddressResponse(a));
        }
        userResponse.setAddressResponses(addressResponses);

        userResponse.setRoles(roles);

        CartResponse cartResponse = cartService.getCart();
        userResponse.setCart(cartResponse);
        return userResponse;
    }


    public UserResponse updateUser(UserUpdateRequest request)
    {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if(!user.getActive())
            throw new AppException(ErrorCode.BANNED);

        if(!request.getEmail().equals(user.getEmail()))
        {
            if(userRepository.existsByEmail(request.getEmail()))
            {
                throw new AppException(ErrorCode.EMAIL_USED);
            }
        }
        userMapper.updateUser(user, request);


        return userMapper.toUserResponse(userRepository.save(user));
    }

    public String updateAvatar(MultipartFile file) throws IOException {
        var authentication = SecurityContextHolder.getContext().getAuthentication().getName();
        String userID = getUserID(authentication);
        User user = userRepository.findById(userID).orElseThrow(()-> new AppException(ErrorCode.USER_NOT_EXISTED));
        user.setPictures(ImageUtils.compressImage(file.getBytes()));
        userRepository.save(user);
        return "Avatar changed";
    }

    public void banUser(String userID)
    {
        User user = userRepository.findById(userID).orElseThrow(()-> new AppException(ErrorCode.USER_NOT_EXISTED));
        user.setActive(false);
    }


    public AuthenticationResponse logIn(AuthenticationRequest request)
    {
        String userID = getUserID(request.getUsername());

        User user = userRepository.findById(userID)
                .orElseThrow(()-> new AppException(ErrorCode.USER_NOT_EXISTED));

        if(!user.getActive())
        {
            throw new AppException(ErrorCode.BANNED);
        }
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);
        boolean authenticated = passwordEncoder.matches(request.getPassword(), user.getPassword());

        if(!authenticated)
        {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        var token = authenticationService.generateToken(user);

        return AuthenticationResponse.builder()
                .token(token)
                .build();
    }

    public boolean ownerShip(Item item)
    {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String userID = getUserID(authentication.getName());
        User user = userRepository.findById(userID).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        Shop shop = shopRepository.findByUsername(user.getUsername()).orElseThrow(()-> new AppException(ErrorCode.SHOP_NOT_CREATED));
        return shop.equals(item.getShop());
    }

    public boolean shopOwner(Shop request)
    {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String userID = getUserID(authentication.getName());
        User user = userRepository.findById(userID).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        Shop shop = shopRepository.findByUsername(user.getUsername()).orElseThrow(()-> new AppException(ErrorCode.SHOP_NOT_CREATED));
        return shop.equals(request);
    }


    // gửi code về mail và lưu pending user
    public void reset(ResetPasswordRequest request)
    {
        PendingUser pendingUser = pendingUserRepository.findByEmail(request.getEmail())
                .orElseThrow(()-> new AppException(ErrorCode.USER_NOT_EXISTED));
        pendingUser.setCode(generateRandomNumber());
        pendingUserRepository.save(pendingUser);
        mailService.sendMail(request.getEmail(), pendingUser.getCode());
    }

    // xác minh mã và gửi về token
    public AuthenticationResponse resetPasswordAuthentication(VerificationRequest request)
    {
        PendingUser pendingUser = pendingUserRepository.findByEmail(request.getEmail())
                .orElseThrow(()-> new AppException(ErrorCode.USER_NOT_EXISTED));

        if(pendingUser.getCode().equals(request.getCode()))
        {
            var token = authenticationService.generateResetPasswordToken(request.getEmail());
            return AuthenticationResponse.builder()
                    .token(token)
                    .build();
        }
        throw new AppException(ErrorCode.INVALID_VERIFY_CODE);
    }

    public String resetPassword(ResetPasswordRequest request)  {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(()-> new AppException(ErrorCode.USER_NOT_EXISTED));

        PendingUser pendingUser = pendingUserRepository.findByEmail(request.getEmail())
                .orElseThrow(()-> new AppException(ErrorCode.USER_NOT_EXISTED));

        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);
        pendingUser.setPassword(null);
        pendingUserRepository.save(pendingUser);
        return "Password reset";

    }
}
