package com.example.Shopee.Repository;

import com.example.Shopee.Entity.Address;
import com.example.Shopee.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Set;

@Repository
public interface AddressRepository extends JpaRepository<Address, Integer> {
    boolean existsByUser(User user);
    Set<Address> findByUser(User user);

    boolean existsByUserAndPhoneAndCityAndDistrictAndWardAndDetail(User user,String phone, String city, String district, String ward, String detail);
}
