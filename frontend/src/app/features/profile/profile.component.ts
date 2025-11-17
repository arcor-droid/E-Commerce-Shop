import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  readonly authService = inject(AuthService);

  profileForm!: FormGroup;
  user: User | null = null;
  successMessage = '';
  errorMessage = '';
  isLoading = false;

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
      if (user) {
        this.initForm(user);
      }
    });
  }

  private initForm(user: User): void {
    this.profileForm = this.fb.group({
      email: [user.email, [Validators.required, Validators.email]],
      nickname: [user.nickname, [Validators.required, Validators.minLength(3)]],
      street_address: [user.street_address || ''],
      city: [user.city || ''],
      postal_code: [user.postal_code || ''],
      country: [user.country || ''],
      payment_method: [user.payment_method || '']
    });
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.authService.updateProfile(this.profileForm.value).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Profile updated successfully!';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.detail || 'Failed to update profile';
      }
    });
  }

  get email() {
    return this.profileForm?.get('email');
  }

  get nickname() {
    return this.profileForm?.get('nickname');
  }
}
