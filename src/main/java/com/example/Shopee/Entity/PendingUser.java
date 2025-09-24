package com.example.Shopee.Entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class PendingUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer ID;

    @Column(name = "username")
    String username;

    @Column(name = "phone")
    String phone;

    @Column(name = "email")
    String email;

    @Column(name = "password")
    String password;

    @Column(name = "code")
    String code;

    @Column(name = "verified", columnDefinition = "boolean default false")
    boolean verified;

    LocalDate dob;
    String firstName;
    String lastName;
    @Column(name = "followings", columnDefinition = "int default 0")
    int followings;
    String gender;


}
