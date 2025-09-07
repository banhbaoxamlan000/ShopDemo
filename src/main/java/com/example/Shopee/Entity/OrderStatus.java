package com.example.Shopee.Entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.context.annotation.DependsOn;


import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@DependsOn("orders")
public class OrderStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer orderStatusID;

    @ManyToOne
    @JoinColumn(name = "orderID")
    Orders orders;

    @Column(name = "status")
    String status;

    LocalDateTime date;
}
