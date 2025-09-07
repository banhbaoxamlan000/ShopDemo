package com.example.Shopee.Entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String userID;

    @Column(name = "username", unique = true, columnDefinition = "VARCHAR (255)")
    String username;

    String firstName;
    String lastName;
    LocalDate dob;
    String password;

    @Column(name = "phone", unique = true)
    String phone;

    @Column(name = "email", unique = true)
    String email;

    String gender;

    @Column(name = "followings", columnDefinition = "int default 0")
    int followings;


    @Column(name = "active", columnDefinition = "boolean default true")
    Boolean active;

    @ManyToMany
    Set<Role> roles;

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    Cart cart;

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JoinColumn(name = "pictures")
    Image pictures;
}
