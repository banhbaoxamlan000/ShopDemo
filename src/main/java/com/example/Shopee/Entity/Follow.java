package com.example.Shopee.Entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;


@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Data
@Table(name = "follow", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"userid", "shopid"})})
@Entity
public class Follow {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @ManyToOne( fetch = FetchType.LAZY)
    @JoinColumn(name = "userid")
    User user;

    @ManyToOne( fetch = FetchType.LAZY)
    @JoinColumn(name = "shopid")
    Shop shop;
}
