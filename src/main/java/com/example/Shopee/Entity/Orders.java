package com.example.Shopee.Entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.context.annotation.DependsOn;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@DependsOn("user")
public class Orders {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer orderID;

    LocalDateTime date;
    Double total;
    String delivery;
    String currentStatus;

    @ManyToOne
    @JoinColumn(name = "addressID")
    Address address;

    @ManyToOne
    @JoinColumn(name = "userID")
    User user;

    @ManyToOne
    @JoinColumn(name = "shopID")
    Shop shop;

    @OneToMany(fetch = FetchType.LAZY)
    @JsonManagedReference
    @ToString.Exclude
    Set<OrderItem> orderItems;

    @OneToMany(fetch = FetchType.LAZY)
    @ToString.Exclude
    Set<OrderStatus> orderStatus;

    @Override
    public int hashCode() {
        return orderID != null ? orderID.hashCode() : 0;
    }

}
