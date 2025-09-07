package com.example.Shopee;

import org.springframework.boot.SpringApplication;

public class TestShopeeApplication {

	public static void main(String[] args) {
		SpringApplication.from(ShopeeApplication::main).with(TestcontainersConfiguration.class).run(args);
	}

}
