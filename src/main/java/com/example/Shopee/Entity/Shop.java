package com.example.Shopee.Entity;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Shop {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String shopID;

    @Column(name = "username", unique = true)
    String username;
    String shopName;
    @Column(name = "email", unique = true)
    String email;
    @Column(name = "phone", unique = true)
    String phone;
    Double rate;

    @Column(name = "ratings", columnDefinition = "int default 0")
    int ratings;

    @Column(name = "followers", columnDefinition = "int default 0")
    int followers;

    @Embedded
    ShopAddress address;

    LocalDate createAt;

    @Column(unique = true)
    String taxNumber;

    String business;

    @Lob
    @Column(columnDefinition = "LONGBLOB")
    byte[] pictures;
}
