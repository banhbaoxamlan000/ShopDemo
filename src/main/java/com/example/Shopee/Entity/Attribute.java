package com.example.Shopee.Entity;


import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.context.annotation.DependsOn;

import java.util.List;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class Attribute {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer attributeID;


    String name;
    String value;

}
