package com.example.Shopee.Entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.context.annotation.DependsOn;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@DependsOn("user")
@Table(name = "address", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"phone", "city", "district", "ward", "detail"})})
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer addressID;

    String phone;
    String city;
    String district;
    String ward;
    String detail;
    @Column(name = "defaultAddress", columnDefinition = "boolean default false")
    boolean defaultAddress;

    @ManyToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "userID")
    User user;


}
