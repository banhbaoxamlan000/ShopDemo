package com.example.Shopee.Repository;

import com.example.Shopee.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    boolean existsByUsername(String username);
    boolean existsByPhone(String phone);
    boolean existsByEmail(String email);

    Optional<User> findByUsername(String username);
    Optional<User> findByPhone(String phone);
    Optional<User> findByEmail(String mail);
}
