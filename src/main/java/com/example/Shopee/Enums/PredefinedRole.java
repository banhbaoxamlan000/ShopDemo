package com.example.Shopee.Enums;

public enum PredefinedRole {
    ADMIN_ROLE("ADMIN"),
    USER_ROLE("USER"),
    SHOP_ROLE("SHOP");

    private String role;

    PredefinedRole(String role) {
        this.role = role;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
