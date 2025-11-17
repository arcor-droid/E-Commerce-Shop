-- E-Commerce Shop Database Schema
-- MySQL 8.0+

-- =============================================
-- Drop tables if they exist (for clean setup)
-- =============================================
DROP TABLE IF EXISTS OrderItems;
DROP TABLE IF EXISTS Orders;
DROP TABLE IF EXISTS CartItems;
DROP TABLE IF EXISTS Products;
DROP TABLE IF EXISTS ProductCategories;
DROP TABLE IF EXISTS Users;

-- =============================================
-- Create Users table
-- =============================================
CREATE TABLE Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    nickname VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
    
    -- Address fields (optional)
    street_address VARCHAR(255),
    city VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    
    -- Payment fields (optional - simplified for now)
    payment_method VARCHAR(50),
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_nickname (nickname),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Create ProductCategories table
-- =============================================
CREATE TABLE ProductCategories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    image VARCHAR(500),
    display_order INT DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Create Products table
-- =============================================
CREATE TABLE Products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image VARCHAR(500),
    base_price DECIMAL(10, 2) NOT NULL,
    
    -- Options stored as JSON for flexibility
    -- Example: {"sizes": ["S", "M", "L"], "colors": ["red", "blue"]}
    options JSON,
    
    -- Inventory
    stock_quantity INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (category_id) REFERENCES ProductCategories(id) ON DELETE CASCADE,
    
    INDEX idx_category (category_id),
    INDEX idx_active (is_active),
    INDEX idx_title (title)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Create CartItems table
-- =============================================
CREATE TABLE CartItems (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    
    -- Store selected options (e.g., size, color)
    selected_options JSON,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Products(id) ON DELETE CASCADE,
    
    -- Ensure user doesn't have duplicate cart items for same product
    UNIQUE KEY unique_cart_item (user_id, product_id, selected_options(255)),
    
    INDEX idx_user (user_id),
    INDEX idx_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Create Orders table
-- =============================================
CREATE TABLE Orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM(
        'Pending',
        'Confirmed',
        'Payment Pending',
        'Payment Received',
        'Delivered',
        'Canceled'
    ) NOT NULL DEFAULT 'Pending',
    
    -- Shipping information (captured at order time)
    shipping_street VARCHAR(255),
    shipping_city VARCHAR(100),
    shipping_postal_code VARCHAR(20),
    shipping_country VARCHAR(100),
    
    -- Order totals
    subtotal DECIMAL(10, 2) NOT NULL,
    tax DECIMAL(10, 2) DEFAULT 0.00,
    shipping_cost DECIMAL(10, 2) DEFAULT 0.00,
    total DECIMAL(10, 2) NOT NULL,
    
    -- Notes
    customer_notes TEXT,
    admin_notes TEXT,
    
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE RESTRICT,
    
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_order_date (order_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Create OrderItems table
-- =============================================
CREATE TABLE OrderItems (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    
    -- Capture product details at purchase time (denormalized for history)
    product_title VARCHAR(255) NOT NULL,
    product_image VARCHAR(500),
    
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,  -- Price at time of purchase
    
    -- Selected options at time of purchase
    selected_options JSON,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES Orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Products(id) ON DELETE RESTRICT,
    
    INDEX idx_order (order_id),
    INDEX idx_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Insert sample data for development
-- =============================================

-- Create an admin user (password: admin123)
-- Note: In production, use proper password hashing via backend
INSERT INTO Users (email, nickname, password_hash, role) VALUES
('admin@shop.com', 'admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqYo8hiZ6W', 'admin');

-- Create a test customer (password: customer123)
INSERT INTO Users (email, nickname, password_hash, role, street_address, city, postal_code, country) VALUES
('customer@example.com', 'testuser', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqYo8hiZ6W', 'customer', '123 Test Street', 'Berlin', '10115', 'Germany');

-- Create product categories
INSERT INTO ProductCategories (name, title, image, display_order) VALUES
('hoodies', 'Hoodies', '/images/categories/hoodies.jpg', 1),
('shirts', 'Shirts', '/images/categories/shirts.jpg', 2),
('joggers', 'Joggers', '/images/categories/joggers.jpg', 3),
('posters', 'Posters', '/images/categories/posters.jpg', 4),
('schnick-schnack', 'Schnick Schnack', '/images/categories/misc.jpg', 5);

-- Create sample products
INSERT INTO Products (category_id, title, description, image, base_price, options, stock_quantity) VALUES
-- Hoodies
(1, 'Classic Black Hoodie', 'Comfortable black hoodie with front pocket', '/images/products/hoodie-black.jpg', 49.99, '{"sizes": ["S", "M", "L", "XL"], "colors": ["black"]}', 50),
(1, 'Grey Zip Hoodie', 'Premium grey zip-up hoodie', '/images/products/hoodie-grey.jpg', 59.99, '{"sizes": ["S", "M", "L", "XL"], "colors": ["grey"]}', 30),

-- Shirts
(2, 'White Cotton T-Shirt', 'Classic white cotton t-shirt', '/images/products/shirt-white.jpg', 19.99, '{"sizes": ["S", "M", "L", "XL", "XXL"], "colors": ["white"]}', 100),
(2, 'Graphic Print Shirt', 'Cool graphic design t-shirt', '/images/products/shirt-graphic.jpg', 24.99, '{"sizes": ["S", "M", "L", "XL"], "colors": ["black", "navy", "white"]}', 75),

-- Joggers
(3, 'Comfort Joggers Black', 'Soft and comfortable joggers', '/images/products/joggers-black.jpg', 39.99, '{"sizes": ["S", "M", "L", "XL"], "colors": ["black"]}', 40),
(3, 'Sport Joggers Grey', 'Athletic joggers for active lifestyle', '/images/products/joggers-grey.jpg', 44.99, '{"sizes": ["S", "M", "L", "XL"], "colors": ["grey", "navy"]}', 35),

-- Posters
(4, 'Motivational Poster A2', 'Inspirational quote poster', '/images/products/poster-motivation.jpg', 12.99, '{"sizes": ["A2", "A3"]}', 200),
(4, 'Abstract Art Poster', 'Modern abstract art print', '/images/products/poster-abstract.jpg', 15.99, '{"sizes": ["A1", "A2", "A3"]}', 150),

-- Schnick Schnack (Misc)
(5, 'Branded Sticker Pack', 'Pack of 10 assorted stickers', '/images/products/stickers.jpg', 4.99, '{}', 500),
(5, 'Coffee Mug', 'Ceramic coffee mug with logo', '/images/products/mug.jpg', 9.99, '{"colors": ["black", "white"]}', 80);
