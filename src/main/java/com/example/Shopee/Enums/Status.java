package com.example.Shopee.Enums;

import com.example.Shopee.Exception.AppException;
import com.example.Shopee.Exception.ErrorCode;

public enum Status {
    TO_SHIP(1, "To Ship"),
    TO_RECEIVE(2, "To Receive"),
    COMPLETED(3, "Completed"),
    Cancelled(4, "Cancelled"),
    RETURN(5, "Return Refund");

    private Integer code;
    private String status;

    public static String getStatusByCode(Integer code)
    {
        for (Status status : Status.values()) {
            if (status.getCode().equals(code)) {
                return status.getStatus();
            }
        }
        throw new AppException(ErrorCode.INVALID_STATUS_CODE);
    }

    Status(Integer code, String status) {
        this.code = code;
        this.status = status;
    }

    public Integer getCode() {
        return code;
    }

    public void setCode(Integer code) {
        this.code = code;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
