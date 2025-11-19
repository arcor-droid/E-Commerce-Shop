"""Populate sample image URLs with public, license-free resources."""
import asyncio
from sqlalchemy import text
from database import engine
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Public, hotlink-friendly image URLs from Unsplash
REMOTE_CATEGORY_IMAGES = {
    "hoodies": "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=80",
    "shirts": "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=900&q=80",
    "joggers": "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&w=900&q=80",
    "posters": "https://images.unsplash.com/photo-1513519245088-0e12902e35ca?auto=format&fit=crop&w=900&q=80",
    "schnick-schnack": "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=900&q=80",
}

REMOTE_PRODUCT_IMAGES = {
    "Classic Black Hoodie": "https://images.unsplash.com/photo-1614214191247-5b2d3a734f1b?q=80&w=1364&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "Grey Zip Hoodie": "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8aG9vZGllfGVufDB8fDB8fHww",
    "White Cotton T-Shirt": "https://images.unsplash.com/photo-1622445275463-afa2ab738c34?auto=format&fit=crop&w=800&q=80",
    "Graphic Print Shirt": "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=800&q=80",
    "Comfort Joggers Black": "https://images.unsplash.com/photo-1542818212-9899bafcb9db?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGNvbWZvcnQlMjBqb2dnZXJzJTIwYmxhY2t8ZW58MHx8MHx8fDA%3D",
    "Sport Joggers Grey": "https://images.unsplash.com/photo-1723972405511-e3785a045721?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fHNwb3J0JTIwam9nZ2VycyUyMGdyZXl8ZW58MHx8MHx8fDA%3D",
    "Motivational Poster A2": "https://images.unsplash.com/photo-1504805572947-34fad45aed93?auto=format&fit=crop&w=800&q=80",
    "Abstract Art Poster": "https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=800&q=80",
    "Branded Sticker Pack": "https://plus.unsplash.com/premium_photo-1752230474021-5749c334925a?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8YnJhbmRlZCUyMHN0aWNrZXIlMjBwYWNrfGVufDB8fDB8fHww",
    "Coffee Mug": "https://images.unsplash.com/photo-1572119865084-43c285814d63?auto=format&fit=crop&w=800&q=80",
    # Optional extra items used in staging databases
    "Poster - Nature": "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=800&q=80",
    "Poster - Minimal": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80",
    "Keychain": "https://images.unsplash.com/photo-1611085583191-a3b181a88401?auto=format&fit=crop&w=800&q=80",
}


async def update_images(table: str, lookup_column: str, mapping: dict[str, str]) -> None:
    """Generic helper to update image URLs based on a unique column."""
    async with engine.begin() as conn:
        for key, image_url in mapping.items():
            result = await conn.execute(
                text(f"UPDATE {table} SET image = :image WHERE {lookup_column} = :lookup"),
                {"image": image_url, "lookup": key}
            )

            if result.rowcount:
                logger.info("✓ Updated %s '%s'", table, key)
            else:
                logger.warning("⚠️ No %s record found for '%s'", table, key)


async def main():
    """Update both category and product image URLs."""
    logger.info("=" * 60)
    logger.info("Assigning remote image URLs")
    logger.info("=" * 60)

    await update_images("ProductCategories", "name", REMOTE_CATEGORY_IMAGES)
    await update_images("Products", "title", REMOTE_PRODUCT_IMAGES)

    logger.info("=" * 60)
    logger.info("✓ Image URLs updated successfully")
    logger.info("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())

