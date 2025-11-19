import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of, map, switchMap } from 'rxjs';
import { Router } from '@angular/router';
import {
  User,
  LoginRequest,
  RegisterRequest,
  TokenResponse,
  UserUpdateRequest,
  PasswordChangeRequest
} from '../models/user.model';
import { CartService } from './cart.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly cartService = inject(CartService); // Direct injection - no circular dependency
  
  private readonly API_URL = environment.apiUrl;
  private readonly TOKEN_KEY = 'access_token';
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {
    // Load user on init if token exists
    if (this.hasToken()) {
      this.loadCurrentUser().subscribe({
        error: (err) => {
          console.warn('Failed to load user on init, clearing token:', err);
          this.removeToken();
          this.currentUserSubject.next(null);
          this.isAuthenticatedSubject.next(false);
        }
      });
    }
  }

  /**
   * Register a new user
   */
  register(data: RegisterRequest): Observable<User> {
    return this.http.post<User>(`${this.API_URL}/auth/register`, data);
  }

  /**
   * Login with email/nickname and password
   */
  login(username: string, password: string): Observable<User> {
    const formData = new URLSearchParams();
    formData.set('username', username);
    formData.set('password', password);

    return this.http.post<TokenResponse>(
      `${this.API_URL}/auth/login`,
      formData.toString(),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    ).pipe(
      tap(response => {
        // Store token first
        this.setToken(response.access_token);
        this.isAuthenticatedSubject.next(true);
      }),
      // Load user data before completing login
      switchMap(() => this.loadCurrentUser()),
      tap(() => {
        // Refresh cart after user is successfully loaded
        this.cartService.refreshCart();
      }),
      catchError((error) => {
        console.error('Login failed:', error);
        // Clean up on error
        this.removeToken();
        this.isAuthenticatedSubject.next(false);
        throw error;
      })
    );
  }

  /**
   * Logout and clear token
   */
  logout(): void {
    this.removeToken();
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    // Reset cart after logout
    this.cartService.resetCart();
    this.router.navigate(['/login']);
  }

  /**
   * Load current user profile
   */
  loadCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/auth/me`).pipe(
      tap(user => {
        this.currentUserSubject.next(user);
        console.log('User loaded successfully:', user.nickname, 'Role:', user.role);
      }),
      catchError((error) => {
        console.error('Failed to load user:', error);
        // Only logout if it's an authentication error (401)
        if (error.status === 401) {
          this.removeToken();
          this.currentUserSubject.next(null);
          this.isAuthenticatedSubject.next(false);
        }
        // Re-throw error so login() can catch it
        throw error;
      })
    );
  }

  /**
   * Update user profile
   */
  updateProfile(data: UserUpdateRequest): Observable<User> {
    return this.http.put<User>(`${this.API_URL}/auth/me`, data).pipe(
      tap(user => this.currentUserSubject.next(user))
    );
  }

  /**
   * Change password
   */
  changePassword(data: PasswordChangeRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API_URL}/auth/change-password`, data);
  }

  /**
   * Get current user value
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.hasToken();
  }

  /**
   * Check if current user is admin
   */
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }

  /**
   * Check if current user is customer
   */
  isCustomer(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'customer';
  }

  /**
   * Get stored token
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Store token in localStorage
   */
  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Remove token from localStorage
   */
  private removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  /**
   * Check if token exists
   */
  private hasToken(): boolean {
    return !!this.getToken();
  }
}
