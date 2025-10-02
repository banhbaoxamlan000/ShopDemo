INSERT INTO permission (name, description)
SELECT 'BUY_ITEM', 'Purchase items' WHERE NOT EXISTS (SELECT 1 FROM permission WHERE name = 'BUY_ITEM')
UNION ALL
SELECT 'CREATE_ITEM', 'Create items' WHERE NOT EXISTS (SELECT 1 FROM permission WHERE name = 'CREATE_ITEM')
UNION ALL
SELECT 'DELETE_ITEM', 'Delete items' WHERE NOT EXISTS (SELECT 1 FROM permission WHERE name = 'DELETE_ITEM')
UNION ALL
SELECT 'EDIT_ITEM', 'Edit items' WHERE NOT EXISTS (SELECT 1 FROM permission WHERE name = 'EDIT_ITEM')
UNION ALL
SELECT 'PROHIBIT_USER', 'Ban users' WHERE NOT EXISTS (SELECT 1 FROM permission WHERE name = 'PROHIBIT_USER')
UNION ALL
SELECT 'VIEW_ITEM', 'View items' WHERE NOT EXISTS (SELECT 1 FROM permission WHERE name = 'VIEW_ITEM')
UNION ALL
SELECT 'VIEW_ORDERS', 'View orders' WHERE NOT EXISTS (SELECT 1 FROM permission WHERE name = 'VIEW_ORDERS')
UNION ALL
SELECT 'VIEW_USERS', 'View list of users' WHERE NOT EXISTS (SELECT 1 FROM permission WHERE name = 'VIEW_USERS');

INSERT INTO role_permissions (role_name, permissions_name)
SELECT 'USER', 'BUY_ITEM' WHERE NOT EXISTS (SELECT 1 FROM role_permissions WHERE role_name = 'USER' AND permissions_name = 'BUY_ITEM')
UNION ALL
SELECT 'SHOP', 'CREATE_ITEM' WHERE NOT EXISTS (SELECT 1 FROM role_permissions WHERE role_name = 'SHOP' AND permissions_name = 'CREATE_ITEM')
UNION ALL
SELECT 'SHOP', 'DELETE_ITEM' WHERE NOT EXISTS (SELECT 1 FROM role_permissions WHERE role_name = 'SHOP' AND permissions_name = 'DELETE_ITEM')
UNION ALL
SELECT 'SHOP', 'EDIT_ITEM' WHERE NOT EXISTS (SELECT 1 FROM role_permissions WHERE role_name = 'SHOP' AND permissions_name = 'EDIT_ITEM')
UNION ALL
SELECT 'ADMIN', 'PROHIBIT_USER' WHERE NOT EXISTS (SELECT 1 FROM role_permissions WHERE role_name = 'ADMIN' AND permissions_name = 'PROHIBIT_USER')
UNION ALL
SELECT 'USER', 'VIEW_ITEM' WHERE NOT EXISTS (SELECT 1 FROM role_permissions WHERE role_name = 'USER' AND permissions_name = 'VIEW_ITEM')
UNION ALL
SELECT 'SHOP', 'VIEW_ORDERS' WHERE NOT EXISTS (SELECT 1 FROM role_permissions WHERE role_name = 'SHOP' AND permissions_name = 'VIEW_ORDERS')
UNION ALL
SELECT 'ADMIN', 'VIEW_USERS' WHERE NOT EXISTS (SELECT 1 FROM role_permissions WHERE role_name = 'ADMIN' AND permissions_name = 'VIEW_USERS');

INSERT INTO category (id, detail, name)
SELECT 1, 'Bike, E-bike', 'Automotive' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 1)
UNION ALL
SELECT 2, 'Motorbike', 'Automotive' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 2)
UNION ALL
SELECT 3, 'Car', 'Automotive' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 3)
UNION ALL
SELECT 4, 'Helmets', 'Automotive' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 4)
UNION ALL
SELECT 5, 'Motorbike Accessories', 'Automotive' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 5)
UNION ALL
SELECT 6, 'Bicycle & E-bike Accessories', 'Automotive' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 6)
UNION ALL
SELECT 7, 'Interior Accessories', 'Automotive' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 7)
UNION ALL
SELECT 8, 'Automotive Oils & Lubes', 'Automotive' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 8)
UNION ALL
SELECT 9, 'Auto Parts & Spares', 'Automotive' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 9)
UNION ALL
SELECT 10, 'Motorbike Spare Parts', 'Automotive' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 10)
UNION ALL
SELECT 11, 'Exterior Accessories', 'Automotive' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 11)
UNION ALL
SELECT 12, 'Automotive Care', 'Automotive' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 12)
UNION ALL
SELECT 13, 'Automotive Services', 'Automotive' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 13)
UNION ALL
SELECT 14, 'Skincare', 'Beauty' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 14)
UNION ALL
SELECT 15, 'Bath & Body Care', 'Beauty' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 15)
UNION ALL
SELECT 16, 'Makeup', 'Beauty' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 16)
UNION ALL
SELECT 17, 'Hair Care', 'Beauty' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 17)
UNION ALL
SELECT 18, 'Beauty Tools & Accessories', 'Beauty' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 18)
UNION ALL
SELECT 19, 'Oral Care', 'Beauty' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 19)
UNION ALL
SELECT 20, 'Perfumes & Fragrances', 'Beauty' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 20)
UNION ALL
SELECT 21, 'Men''s Care', 'Beauty' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 21)
UNION ALL
SELECT 22, 'Others', 'Beauty' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 22)
UNION ALL
SELECT 23, 'Feminine Care', 'Beauty' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 23)
UNION ALL
SELECT 24, 'Beauty Sets & Packages', 'Beauty' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 24)
UNION ALL
SELECT 25, 'Domestic Books', 'Books & Stationery' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 25)
UNION ALL
SELECT 26, 'Foreign Books', 'Books & Stationery' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 26)
UNION ALL
SELECT 27, 'Gift & Wrapping', 'Books & Stationery' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 27)
UNION ALL
SELECT 28, 'Writing & Correction', 'Books & Stationery' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 28)
UNION ALL
SELECT 29, 'School & Office Supplies', 'Books & Stationery' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 29)
UNION ALL
SELECT 30, 'Coloring & Arts', 'Books & Stationery' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 30)
UNION ALL
SELECT 31, 'Notebooks & Paper Products', 'Books & Stationery' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 31)
UNION ALL
SELECT 32, 'Souvenirs', 'Books & Stationery' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 32)
UNION ALL
SELECT 33, 'Music & Media', 'Books & Stationery' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 33)
UNION ALL
SELECT 34, 'Cameras', 'Cameras' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 34)
UNION ALL
SELECT 35, 'Security Cameras & Systems', 'Cameras' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 35)
UNION ALL
SELECT 36, 'Memory Cards', 'Cameras' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 36)
UNION ALL
SELECT 37, 'Lenses', 'Cameras' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 37)
UNION ALL
SELECT 38, 'Camera Accessories', 'Cameras' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 38)
UNION ALL
SELECT 39, 'Drones', 'Cameras' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 39)
UNION ALL
SELECT 40, 'Desktop Computers', 'Computer & Accessories' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 40)
UNION ALL
SELECT 41, 'Monitors', 'Computer & Accessories' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 41)
UNION ALL
SELECT 42, 'Desktop & Laptop Components', 'Computer & Accessories' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 42)
UNION ALL
SELECT 43, 'Data Storage', 'Computer & Accessories' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 43)
UNION ALL
SELECT 44, 'Network Components', 'Computer & Accessories' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 44)
UNION ALL
SELECT 45, 'Printers, Scanners & Projectors', 'Computer & Accessories' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 45)
UNION ALL
SELECT 46, 'Peripherals & Accessories', 'Computer & Accessories' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 46)
UNION ALL
SELECT 47, 'Laptops', 'Computer & Accessories' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 47)
UNION ALL
SELECT 48, 'Others', 'Computer & Accessories' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 48)
UNION ALL
SELECT 49, 'Gaming', 'Computer & Accessories' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 49)
UNION ALL
SELECT 50, 'Wearable Devices', 'Consumer Electronics' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 50)
UNION ALL
SELECT 51, 'Tivi Accessories', 'Consumer Electronics' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 51)
UNION ALL
SELECT 52, 'Gaming & Console', 'Consumer Electronics' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 52)
UNION ALL
SELECT 53, 'Console Accessories', 'Consumer Electronics' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 53)
UNION ALL
SELECT 54, 'Video Games', 'Consumer Electronics' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 54)
UNION ALL
SELECT 55, 'Accessories and spare parts', 'Consumer Electronics' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 55)
UNION ALL
SELECT 56, 'Earphones', 'Consumer Electronics' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 56)
UNION ALL
SELECT 57, 'Audio', 'Consumer Electronics' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 57)
UNION ALL
SELECT 58, 'Tivi', 'Consumer Electronics' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 58)
UNION ALL
SELECT 59, 'Tivi Box', 'Consumer Electronics' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 59)
UNION ALL
SELECT 60, 'Headphones', 'Consumer Electronics' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 60)
UNION ALL
SELECT 61, 'Jackets, Coats & Vests', 'Men Clothes' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 61)
UNION ALL
SELECT 62, 'Suit Jackets & Blazers', 'Men Clothes' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 62)
UNION ALL
SELECT 63, 'Hoodies & Sweatshirts', 'Men Clothes' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 63)
UNION ALL
SELECT 64, 'Jeans', 'Men Clothes' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 64)
UNION ALL
SELECT 65, 'Pants/Suits', 'Men Clothes' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 65)
UNION ALL
SELECT 66, 'Shorts', 'Men Clothes' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 66)
UNION ALL
SELECT 67, 'Tops', 'Men Clothes' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 67)
UNION ALL
SELECT 68, 'Tanks', 'Men Clothes' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 68)
UNION ALL
SELECT 69, 'Innerwear & Underwear', 'Men Clothes' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 69)
UNION ALL
SELECT 70, 'Sleepwear', 'Men Clothes' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 70)
UNION ALL
SELECT 71, 'Sets', 'Men Clothes' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 71)
UNION ALL
SELECT 72, 'Socks', 'Men Clothes' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 72)
UNION ALL
SELECT 73, 'Traditional Wear', 'Men Clothes' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 73)
UNION ALL
SELECT 74, 'Costumes', 'Men Clothes' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 74)
UNION ALL
SELECT 75, 'Occupational Attire', 'Men Clothes' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 75)
UNION ALL
SELECT 76, 'Others', 'Men Clothes' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 76)
UNION ALL
SELECT 77, 'Men Jewelries', 'Men Clothes' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 77)
UNION ALL
SELECT 78, 'Eyewear', 'Men Clothes' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 78)
UNION ALL
SELECT 79, 'Belts', 'Men Clothes' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 79)
UNION ALL
SELECT 80, 'Neckties, Bow Ties & Cravats', 'Men Clothes' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 80)
UNION ALL
SELECT 81, 'Additional Accessories', 'Men Clothes' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 81)
UNION ALL
SELECT 82, 'Mobile Phones', 'Mobile & Gadgets' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 82)
UNION ALL
SELECT 83, 'Tablets', 'Mobile & Gadgets' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 83)
UNION ALL
SELECT 84, 'Powerbanks', 'Mobile & Gadgets' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 84)
UNION ALL
SELECT 85, 'Batteries, Cables & Charger', 'Mobile & Gadgets' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 85)
UNION ALL
SELECT 86, 'Cases, Covers, & Skins', 'Mobile & Gadgets' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 86)
UNION ALL
SELECT 87, 'Screen Protectors', 'Mobile & Gadgets' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 87)
UNION ALL
SELECT 88, 'Phone Holders', 'Mobile & Gadgets' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 88)
UNION ALL
SELECT 89, 'Memory Cards', 'Mobile & Gadgets' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 89)
UNION ALL
SELECT 90, 'Sims', 'Mobile & Gadgets' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 90)
UNION ALL
SELECT 91, 'Other Accessories', 'Mobile & Gadgets' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 91)
UNION ALL
SELECT 92, 'Other devices', 'Mobile & Gadgets' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 92)
UNION ALL
SELECT 93, 'Luggage', 'Sport & Outdoor' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 93)
UNION ALL
SELECT 94, 'Travel Bags', 'Sport & Outdoor' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 94)
UNION ALL
SELECT 95, 'Travel Accessories', 'Sport & Outdoor' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 95)
UNION ALL
SELECT 96, 'Sports & Outdoor Recreation Equipments', 'Sport & Outdoor' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 96)
UNION ALL
SELECT 97, 'Sports Footwear', 'Sport & Outdoor' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 97)
UNION ALL
SELECT 98, 'Sports & Outdoor Apparels', 'Sport & Outdoor' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 98)
UNION ALL
SELECT 99, 'Sports & Outdoor Accessories', 'Sport & Outdoor' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 99)
UNION ALL
SELECT 100, 'Others', 'Sport & Outdoor' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 100)
UNION ALL
SELECT 101, 'Pants & Leggings', 'Women Clothes' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 101)
UNION ALL
SELECT 102, 'Shorts', 'Women Clothes' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 102)
UNION ALL
SELECT 103, 'Skirts', 'Women Clothes' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 103)
UNION ALL
SELECT 104, 'Jeans', 'Women Clothes' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 104)
UNION ALL
SELECT 105, 'Dresses', 'Women Clothes' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 105)
UNION ALL
SELECT 106, 'Wedding Dresses', 'Women Clothes' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 106)
UNION ALL
SELECT 107, 'Jumpsuits, Playsuits & Overalls', 'Women Clothes' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 107)
UNION ALL
SELECT 108, 'Jackets, Coats & Vests', 'Women Clothes' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 108)
UNION ALL
SELECT 109, 'Sweaters & Cardigans', 'Women Clothes' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 109)
UNION ALL
SELECT 110, 'Hoodies & Sweatshirts', 'Women Clothes' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 110)
UNION ALL
SELECT 111, 'Sets', 'Women Clothes' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 111)
UNION ALL
SELECT 112, 'Lingerie & Underwear', 'Women Clothes' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 112)
UNION ALL
SELECT 113, 'Sleepwear & Pajamas', 'Women Clothes' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 113)
UNION ALL
SELECT 114, 'Tops', 'Women Clothes' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 114)
UNION ALL
SELECT 115, 'Sportwear', 'Women Clothes' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 115)
UNION ALL
SELECT 116, 'Maternity Wear', 'Women Clothes' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 116)
UNION ALL
SELECT 117, 'Traditional Wear', 'Women Clothes' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 117)
UNION ALL
SELECT 118, 'Costumes', 'Women Clothes' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 118)
UNION ALL
SELECT 119, 'Fabric', 'Women Clothes' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 119)
UNION ALL
SELECT 120, 'Socks & Stockings', 'Women Clothes' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 120)
UNION ALL
SELECT 121, 'Others', 'Women Clothes' WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = 121);