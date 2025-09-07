package com.example.Shopee.Entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.query.Order;

import java.util.Set;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer orderItemID;

    Double price;
    Integer quantity;

    @Column(name = "isReview", columnDefinition = "boolean default false")
    boolean isReview;

    @ManyToOne
    @JoinColumn(name = "variantid")
    Variant variants;

    @ManyToOne
    @JoinColumn(name = "itemid")
    Item items;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "orderid")
    @JsonBackReference
    Orders order;

    @Override
    public int hashCode() {
        return orderItemID != null ? orderItemID.hashCode() : 0;
    }
}
