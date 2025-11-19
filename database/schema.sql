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
    role ENUM('CUSTOMER', 'ADMIN') NOT NULL DEFAULT 'CUSTOMER',
    
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
('admin@shop.com', 'admin', '$2b$12$KIS8Jf3pr6ZUDR1xY55Xj.Y5IVOd/KTZeqB7t87JKq5TpzlLfQqhW', 'ADMIN');

-- Create a test customer (password: customer123)
INSERT INTO Users (email, nickname, password_hash, role, street_address, city, postal_code, country) VALUES
('customer@example.com', 'testuser', '$2b$12$luSqdFGSQpFQ9tVU.S7l5.oafzreqAAi3iZDK5uBbTaPwMv4Djil.', 'CUSTOMER', '123 Test Street', 'Berlin', '10115', 'Germany');

-- Create product categories
INSERT INTO ProductCategories (name, title, image, display_order) VALUES
('hoodies', 'Hoodies', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=80', 1),
('shirts', 'Shirts', 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=900&q=80', 2),
('joggers', 'Joggers', 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&w=900&q=80', 3),
('posters', 'Posters', 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?auto=format&fit=crop&w=900&q=80', 4),
('schnick-schnack', 'Schnick Schnack', 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=900&q=80', 5);

-- Create sample products
INSERT INTO Products (category_id, title, description, image, base_price, options, stock_quantity) VALUES
-- Hoodies
(1, 'Classic Black Hoodie', 'Comfortable black hoodie with front pocket', 'https://images.unsplash.com/photo-1614214191247-5b2d3a734f1b?q=80&w=1364&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 49.99, '{"sizes": ["S", "M", "L", "XL"], "colors": ["black"]}', 50),
(1, 'Grey Zip Hoodie', 'Premium grey zip-up hoodie', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8aG9vZGllfGVufDB8fDB8fHww', 59.99, '{"sizes": ["S", "M", "L", "XL"], "colors": ["grey"]}', 30),

-- Shirts
(2, 'White Cotton T-Shirt', 'Classic white cotton t-shirt', 'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?auto=format&fit=crop&w=800&q=80', 19.99, '{"sizes": ["S", "M", "L", "XL", "XXL"], "colors": ["white"]}', 100),
(2, 'Graphic Print Shirt', 'Cool graphic design t-shirt', 'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=800&q=80', 24.99, '{"sizes": ["S", "M", "L", "XL"], "colors": ["black", "navy", "white"]}', 75),

-- Joggers
(3, 'Comfort Joggers Black', 'Soft and comfortable joggers', 'https://images.unsplash.com/photo-1542818212-9899bafcb9db?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGNvbWZvcnQlMjBqb2dnZXJzJTIwYmxhY2t8ZW58MHx8MHx8fDA%3D', 39.99, '{"sizes": ["S", "M", "L", "XL"], "colors": ["black"]}', 40),
(3, 'Sport Joggers Grey', 'Athletic joggers for active lifestyle', 'https://images.unsplash.com/photo-1723972405511-e3785a045721?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fHNwb3J0JTIwam9nZ2VycyUyMGdyZXl8ZW58MHx8MHx8fDA%3D', 44.99, '{"sizes": ["S", "M", "L", "XL"], "colors": ["grey", "navy"]}', 35),

-- Posters
(4, 'Motivational Poster A2', 'Inspirational quote poster', 'https://images.unsplash.com/photo-1504805572947-34fad45aed93?auto=format&fit=crop&w=800&q=80', 12.99, '{"sizes": ["A2", "A3"]}', 200),
(4, 'Abstract Art Poster', 'Modern abstract art print', 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=800&q=80', 15.99, '{"sizes": ["A1", "A2", "A3"]}', 150),

-- Schnick Schnack (Misc)
(5, 'Branded Sticker Pack', 'Pack of 10 assorted stickers', 'https://plus.unsplash.com/premium_photo-1752230474021-5749c334925a?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8YnJhbmRlZCUyMHN0aWNrZXIlMjBwYWNrfGVufDB8fDB8fHww', 4.99, '{}', 500),
(5, 'Coffee Mug', 'Ceramic coffee mug with logo', 'https://images.unsplash.com/photo-1572119865084-43c285814d63?auto=format&fit=crop&w=800&q=80', 9.99, '{"colors": ["black", "white"]}', 80);
