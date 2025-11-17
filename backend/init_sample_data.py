"""
Initialize sample product images.

Downloads license-free sample images from Picsum (Lorem Picsum) and updates database.
Run this script once to populate product images.

License: All images from Picsum are from Unsplash and free to use (https://picsum.photos)
"""
import asyncio
import httpx
from pathlib import Path
from sqlalchemy import text
from database import engine
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Image directory
IMAGES_DIR = Path(__file__).parent / "static" / "images" / "products"
IMAGES_DIR.mkdir(parents=True, exist_ok=True)

# Sample images mapping - using Picsum (Lorem Picsum) - reliable and free
# Format: product_id -> (filename, picsum_id)
# Picsum IDs are specific images that won't change
SAMPLE_IMAGES = {
    1: ("hoodie-black.jpg", "1"),      # Dark/fashion themed
    2: ("hoodie-grey.jpg", "10"),       # Grey tones
    3: ("shirt-white.jpg", "20"),       # Light/bright
    4: ("shirt-graphic.jpg", "200"),    # Colorful/vibrant
    5: ("joggers-black.jpg", "30"),     # Sporty/active
    6: ("joggers-grey.jpg", "40"),      # Athletic
    7: ("poster-abstract.jpg", "250"),  # Abstract/artistic
    8: ("poster-nature.jpg", "300"),    # Nature/landscape
    9: ("poster-minimal.jpg", "350"),   # Minimal/clean
    10: ("sticker-pack.jpg", "400"),    # Fun/colorful
    11: ("keychain.jpg", "50"),         # Small/detailed
    12: ("mug.jpg", "60"),              # Product/object
}


async def download_image(url: str, filepath: Path) -> bool:
    """Download image from URL and save to filepath."""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            logger.info(f"Downloading: {url}")
            response = await client.get(url, follow_redirects=True)
            response.raise_for_status()
            
            with open(filepath, 'wb') as f:
                f.write(response.content)
            
            logger.info(f"✓ Saved: {filepath.name}")
            return True
    except Exception as e:
        logger.error(f"✗ Failed to download {url}: {e}")
        return False


async def download_sample_images():
    """Download all sample images from Picsum (Lorem Picsum)."""
    logger.info("Starting image download...")
    
    for product_id, (filename, picsum_id) in SAMPLE_IMAGES.items():
        filepath = IMAGES_DIR / filename
        
        # Skip if image already exists
        if filepath.exists():
            logger.info(f"⊙ Image already exists: {filename}")
            continue
        
        # Use Picsum API for consistent, high-quality placeholder images
        # Size: 800x800, specific ID for consistency
        url = f"https://picsum.photos/id/{picsum_id}/800/800"
        
        await download_image(url, filepath)
        
        # Small delay to avoid rate limiting
        await asyncio.sleep(0.5)
    
    logger.info("Image download complete!")


async def update_database():
    """Update product image URLs in database."""
    logger.info("Updating database with image URLs...")
    
    async with engine.begin() as conn:
        for product_id, (filename, _) in SAMPLE_IMAGES.items():
            image_url = f"/static/images/products/{filename}"
            
            await conn.execute(
                text("UPDATE Products SET image = :image WHERE id = :id"),
                {"image": image_url, "id": product_id}
            )
            
            logger.info(f"✓ Updated Product {product_id}: {image_url}")
    
    logger.info("Database update complete!")


async def main():
    """Main initialization function."""
    logger.info("=" * 60)
    logger.info("Initializing Sample Product Images")
    logger.info("=" * 60)
    
    # Download images
    await download_sample_images()
    
    # Update database
    await update_database()
    
    logger.info("=" * 60)
    logger.info("✓ Sample data initialization complete!")
    logger.info(f"✓ Images saved to: {IMAGES_DIR}")
    logger.info("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())

