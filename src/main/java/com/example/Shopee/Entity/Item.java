package com.example.Shopee.Entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer itemID;

    String name;
    Double price;
    Integer quantity;
    Double rate;
    Integer liked;

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, mappedBy = "item")
    List<Image> pictures;

    String description;

    @ManyToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "shopid")
    Shop shop;

    @ManyToOne(fetch = FetchType.EAGER)
    Category category;

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    Set<Variant> variants;

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    List<Review> reviews;


}
