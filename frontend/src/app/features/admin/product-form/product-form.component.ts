import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { AuthService } from '../../../core/services/auth.service';
import { ProductCategory } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-form',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss'
})
export class ProductFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productService = inject(ProductService);
  readonly authService = inject(AuthService);

  productForm!: FormGroup;
  categories: ProductCategory[] = [];
  isEditMode = false;
  productId: number | null = null;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  ngOnInit(): void {
    // Check if user is admin
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/']);
      return;
    }

    this.initForm();
    this.loadCategories();

    // Check if edit mode
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.productId = +id;
      this.loadProduct(this.productId);
    }
  }

  initForm(): void {
    this.productForm = this.fb.group({
      category_id: [null, Validators.required],
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      base_price: [0, [Validators.required, Validators.min(0)]],
      image: [''],
      stock_quantity: [0, [Validators.required, Validators.min(0)]],
      is_active: [true],
      // Options as JSON string for simplicity
      options_json: ['{}']
    });
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load categories';
        console.error('Failed to load categories:', error);
      }
    });
  }

  loadProduct(id: number): void {
    this.isLoading = true;
    this.productService.getProduct(id).subscribe({
      next: (product) => {
        this.productForm.patchValue({
          category_id: product.category_id,
          title: product.title,
          description: product.description || '',
          base_price: product.base_price,
          image: product.image || '',
          stock_quantity: product.stock_quantity,
          is_active: product.is_active,
          options_json: JSON.stringify(product.options || {}, null, 2)
        });
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load product';
        this.isLoading = false;
        console.error('Failed to load product:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.errorMessage = 'Please fill in all required fields';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formValue = this.productForm.value;
    
    // Parse options JSON
    let options = {};
    try {
      options = JSON.parse(formValue.options_json || '{}');
    } catch (e) {
      this.errorMessage = 'Invalid JSON in options field';
      this.isLoading = false;
      return;
    }

    const productData = {
      category_id: formValue.category_id,
      title: formValue.title,
      description: formValue.description || undefined,
      base_price: formValue.base_price,
      image: formValue.image || undefined,
      stock_quantity: formValue.stock_quantity,
      is_active: formValue.is_active,
      options: Object.keys(options).length > 0 ? options : undefined
    };

    if (this.isEditMode && this.productId) {
      // Update existing product
      this.productService.updateProduct(this.productId, productData).subscribe({
        next: (product) => {
          this.successMessage = 'Product updated successfully!';
          this.isLoading = false;
          setTimeout(() => {
            this.router.navigate(['/products', product.id]);
          }, 1500);
        },
        error: (error) => {
          this.errorMessage = 'Failed to update product';
          this.isLoading = false;
          console.error('Failed to update product:', error);
        }
      });
    } else {
      // Create new product
      this.productService.createProduct(productData).subscribe({
        next: (product) => {
          this.successMessage = 'Product created successfully!';
          this.isLoading = false;
          setTimeout(() => {
            this.router.navigate(['/products', product.id]);
          }, 1500);
        },
        error: (error) => {
          this.errorMessage = 'Failed to create product';
          this.isLoading = false;
          console.error('Failed to create product:', error);
        }
      });
    }
  }

  cancel(): void {
    if (this.isEditMode && this.productId) {
      this.router.navigate(['/products', this.productId]);
    } else {
      this.router.navigate(['/products']);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
      
      // For now, we'll use a placeholder URL since we don't have backend upload
      // In a real implementation, you would upload to a service like Cloudinary, S3, etc.
      this.errorMessage = 'Note: File selected. For now, please use an image URL from Unsplash or another CDN.';
    }
  }

  clearImage(): void {
    this.selectedFile = null;
    this.imagePreview = null;
    this.productForm.patchValue({ image: '' });
  }
}
