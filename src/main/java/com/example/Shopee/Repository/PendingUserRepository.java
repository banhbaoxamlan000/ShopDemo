package com.example.Shopee.Repository;

import com.example.Shopee.Entity.PendingUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PendingUserRepository extends JpaRepository<PendingUser, Integer> {
    Optional<PendingUser> findByUsername(String username);
    Optional<PendingUser> findByEmail(String email);

    boolean existsByUsernameOrEmailOrPhone(String username, String email, String phone);
    boolean existsByUsername(String username);
    boolean existsByPhone(String phone);
    boolean existsByEmail(String email);
}
