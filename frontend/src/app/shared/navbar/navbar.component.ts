import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  private cartService = inject(CartService);
  
  cartCount = 0;
  mobileMenuOpen = false;
  private cartSubscription?: Subscription;

  ngOnInit(): void {
    // Subscribe to cart updates
    this.cartSubscription = this.cartService.cart$.subscribe(cart => {
      this.cartCount = cart.total_items;
    });
  }

  ngOnDestroy(): void {
    this.cartSubscription?.unsubscribe();
  }

  logout(): void {
    this.authService.logout();
    this.closeMobileMenu();
  }
  
  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }
  
  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }
}
