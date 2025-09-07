package com.example.Shopee.Entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class Variant{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer variantID;

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    Set<Attribute> attribute;

    Integer quantity;
    Double price;
    String SKU;

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "pictures")
    Image pictures;
}
