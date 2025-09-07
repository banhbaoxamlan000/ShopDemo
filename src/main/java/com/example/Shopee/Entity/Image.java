package com.example.Shopee.Entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;


@Entity
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
@Data
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Image {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    String url;


    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "itemID")
    @ToString.Exclude
    Item item;

}
