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
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Image {
    @Id
    String id;

    @Lob
    @Column(columnDefinition = "LONGBLOB")
    byte[] url;


    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "itemID")
    @ToString.Exclude
    Item item;

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "variantID")
    @ToString.Exclude
    Variant variant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewID")
    @ToString.Exclude
    Review review;
}
