package com.example.Shopee.Exception;

import com.example.Shopee.DTO.ApiResponse;
import com.nimbusds.jose.JOSEException;
import jakarta.validation.ConstraintViolation;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;


@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(value = RuntimeException.class)
    ResponseEntity<ApiResponse> handlingRuntimeException(RuntimeException exception)
    {
        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setCode(ErrorCode.UNCATEGORIZED_EXCEPTION.getCode());
        apiResponse.setMessage(exception.getMessage());
        return ResponseEntity.badRequest().body(apiResponse);
    }

    @ExceptionHandler(value = MethodArgumentNotValidException.class)
    ResponseEntity<ApiResponse> handlingValidation(MethodArgumentNotValidException exception)
    {
        String enumKey = exception.getFieldError().getDefaultMessage();
        ErrorCode errorCode = ErrorCode.INVALID_ERROR_KEY;
        try{
            errorCode = ErrorCode.valueOf(enumKey);

            var constraintViolation = exception.getBindingResult()
                    .getAllErrors().getFirst().unwrap(ConstraintViolation.class);

            var attribute = constraintViolation.getConstraintDescriptor().getAttributes();
        }catch(IllegalArgumentException e){

        }
        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setMessage(errorCode.getMessage());
        apiResponse.setCode(errorCode.getCode());
        return ResponseEntity.status(errorCode.getStatusCode()).body(apiResponse);
    }

    @ExceptionHandler(value = AppException.class)
    ResponseEntity<ApiResponse> handlingAppException(AppException exception){
        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setMessage(exception.getErrorCode().getMessage());
        apiResponse.setCode(exception.getErrorCode().getCode());
        return ResponseEntity.badRequest().body(apiResponse);
    }

    @ExceptionHandler(value = JOSEException.class)
    ResponseEntity<ApiResponse> handlingJOSEException(AppException exception)
    {
        ApiResponse apiResponse = new ApiResponse<>();
        apiResponse.setCode(exception.getErrorCode().getCode());
        apiResponse.setMessage(exception.getErrorCode().getMessage());
        return ResponseEntity.badRequest().body(apiResponse);
    }

    @ExceptionHandler(value = AccessDeniedException.class)
    ResponseEntity<ApiResponse> handlingAccessDeniedException(AccessDeniedException exception)
    {
        ErrorCode errorCode = ErrorCode.UNAUTHORIZED;
        return ResponseEntity.status(errorCode.getStatusCode()).body(
                ApiResponse.builder()
                        .code(errorCode.getCode())
                        .message(errorCode.getMessage())
                        .build()
        );
    }
}
