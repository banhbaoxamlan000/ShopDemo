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
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Variant{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    Integer variantID;

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    Set<Attribute> attribute;

    Integer quantity;
    Double price;

    @EqualsAndHashCode.Include
    String SKU;

    @OneToOne( mappedBy = "variant")
    @ToString.Exclude
    Image pictures;
}
