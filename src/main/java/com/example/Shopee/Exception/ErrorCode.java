package com.example.Shopee.Exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized exception", HttpStatus.BAD_REQUEST),
    INVALID_ERROR_KEY(-1, "Invalid error key", HttpStatus.BAD_REQUEST),
    USER_EXISTED(1001, "User existed", HttpStatus.INTERNAL_SERVER_ERROR),
    USER_NOT_EXISTED(1002, "User not existed", HttpStatus.BAD_REQUEST),
    USERNAME_INVALID(1003, "Username must at least 8 characters", HttpStatus.BAD_REQUEST),
    PASSWORD_INVALID(1004, "Password must at least 8 characters", HttpStatus.BAD_REQUEST),
    PHONE_INVALID(1017, "Invalid Phone Number", HttpStatus.BAD_REQUEST),
    UNAUTHENTICATED(1005, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    GENERATE_TOKEN_ERROR(1006, "Fail to generate token", HttpStatus.BAD_REQUEST),
    BANNED(1007, "You're ban from shopee, please contact to our service for more detail.",HttpStatus.BAD_REQUEST),
    SHOP_NOT_CREATED(1008, "Shop is not created", HttpStatus.NOT_MODIFIED),
    INVALID_DOB(1009, "Your age must be at least {min}", HttpStatus.BAD_REQUEST),
    UNAUTHORIZED(1010, "You do not have permission", HttpStatus.FORBIDDEN),
    USERNAME_USED(1011, "Username existed", HttpStatus.INTERNAL_SERVER_ERROR),
    EMAIL_USED(1012, "Email existed", HttpStatus.INTERNAL_SERVER_ERROR),
    PHONE_USED(1013, "Phone existed", HttpStatus.INTERNAL_SERVER_ERROR),
    ITEM_NOT_EXISTED(1014, "Item not existed", HttpStatus.BAD_REQUEST),
    ITEM_EXISTED(1015, "Item existed", HttpStatus.BAD_REQUEST),
    ADDRESS_EXISTED(1016, "This address is existed", HttpStatus.BAD_REQUEST),
    ADDRESS_NOT_EXISTED(1017, "Address is not existed", HttpStatus.BAD_REQUEST),
    ADDRESS_DEFAULTED(1016, "This address is default already", HttpStatus.BAD_REQUEST),
    BLANK_CITY(1017, "City can not be blank", HttpStatus.BAD_REQUEST),
    BLANK_WARD(1017, "Ward can not be blank", HttpStatus.BAD_REQUEST),
    BLANK_DISTRICT(1017, "District can not be blank", HttpStatus.BAD_REQUEST),
    INVALID_TAX_NUMBER(1018, "Invalid Tax Number", HttpStatus.BAD_REQUEST),
    SHOP_EXISTED(1019, "Shop name has been used", HttpStatus.BAD_REQUEST),
    CART_NOT_EXISTED(1020, "User not existed", HttpStatus.BAD_REQUEST),
    ITEM_NOT_IN_CART(1021, "Item does not exist in cart", HttpStatus.BAD_REQUEST),
    NON_OWNERSHIP(1022, "You do not own this item", HttpStatus.BAD_REQUEST),
    LACK_OF_QUANTITY(1023, "Lack of quantity", HttpStatus.BAD_REQUEST),
    ORDER_NOT_EXISTED(1024, "Order not existed", HttpStatus.BAD_REQUEST),
    INVALID_STATUS_CODE(1025, "Status code is from 1-5, try again", HttpStatus.BAD_REQUEST),
    UPDATE_ORDER_STATUS_FAIL(1026, "You're not shop to update order status", HttpStatus.BAD_REQUEST),
    INVALID_VARIANT(1027, "This variant doesnt exist in item", HttpStatus.BAD_REQUEST),
    NO_RIGHT_REVIEW(1028, "You have to buy to give feedback", HttpStatus.BAD_REQUEST),
    ALREADY_FOLLOW(1029, "You already follow this shop", HttpStatus.BAD_REQUEST),
    ALREADY_REVIEW(1030, "You already review this item", HttpStatus.BAD_REQUEST),
    OVERTIME_REVIEW(1031, "It's over 30 days since you bought this item", HttpStatus.BAD_REQUEST),
    INVALID_VERIFY_CODE(1032, "Invalid verify code, try again", HttpStatus.BAD_REQUEST),
    INVALID_NUMBER_IMAGES(1033, "Number of images and codes are different", HttpStatus.BAD_REQUEST),
    IMAGE_NOT_EXIST(1034, "Image not existed", HttpStatus.BAD_REQUEST),
    NON_ITEM(1035, "Shop doesn't have any items now", HttpStatus.BAD_REQUEST),
    NOT_FOLLOW(1036, "You're not follow to unfollow", HttpStatus.BAD_REQUEST);
    ;

    ErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }

    private int code;
    private String message;
    private HttpStatusCode statusCode;

    public int getCode() {
        return code;
    }

    public void setCode(int code) {
        this.code = code;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public HttpStatusCode getStatusCode() {
        return statusCode;
    }

    public void setStatusCode(HttpStatusCode statusCode) {
        this.statusCode = statusCode;
    }
}
