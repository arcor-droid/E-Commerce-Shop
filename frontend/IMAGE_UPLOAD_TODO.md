# Image Upload Feature - Implementation Notes

## Current Status
The product form now supports:
- ✅ Image URL input (Unsplash, Imgur, CDN URLs)
- ✅ File selection interface
- ✅ Image preview
- ✅ Updated placeholder text (no more localhost references)

## Backend Integration Needed

To enable full image upload functionality, implement one of these options:

### Option 1: Cloud Storage (Recommended)
Use a service like:
- **Cloudinary** (free tier available, easy integration)
- **AWS S3** with CloudFront
- **Imgur API**
- **ImgBB**

### Option 2: Local Upload Endpoint
Create a FastAPI endpoint:

```python
from fastapi import UploadFile, File
from pathlib import Path
import uuid

@router.post("/products/upload-image")
async def upload_product_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_admin_user)
):
    # Validate file type
    if not file.content_type.startswith('image/'):
        raise HTTPException(400, "File must be an image")
    
    # Generate unique filename
    ext = Path(file.filename).suffix
    filename = f"{uuid.uuid4()}{ext}"
    
    # Save to static directory or cloud storage
    file_path = Path("static/images/products") / filename
    
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
    
    return {"url": f"/static/images/products/{filename}"}
```

### Frontend Service Update
```typescript
uploadProductImage(file: File): Observable<{url: string}> {
  const formData = new FormData();
  formData.append('file', file);
  
  return this.http.post<{url: string}>(
    `${this.apiUrl}/products/upload-image`,
    formData
  );
}
```

### Component Update
```typescript
onFileSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const file = input.files[0];
    
    // Upload to backend
    this.productService.uploadProductImage(file).subscribe({
      next: (response) => {
        this.productForm.patchValue({ image: response.url });
        this.imagePreview = response.url;
      },
      error: (error) => {
        this.errorMessage = 'Failed to upload image';
      }
    });
  }
}
```

## Recommended: Cloudinary Integration

1. Sign up at https://cloudinary.com (free tier: 25GB storage, 25GB bandwidth/month)
2. Install SDK: `pip install cloudinary`
3. Configure in backend:

```python
import cloudinary
import cloudinary.uploader

cloudinary.config(
    cloud_name="your_cloud_name",
    api_key="your_api_key",
    api_secret="your_api_secret"
)

@router.post("/products/upload-image")
async def upload_to_cloudinary(
    file: UploadFile = File(...),
    current_user: User = Depends(get_admin_user)
):
    result = cloudinary.uploader.upload(
        file.file,
        folder="ecommerce/products",
        transformation=[
            {'width': 800, 'height': 800, 'crop': 'limit'},
            {'quality': 'auto'},
            {'fetch_format': 'auto'}
        ]
    )
    return {"url": result['secure_url']}
```

## Current Workaround
Users can:
1. Upload images to Unsplash, Imgur, or any image hosting service
2. Copy the direct image URL
3. Paste it into the "Image URL" field in the product form

This works well for now and doesn't require backend changes!
