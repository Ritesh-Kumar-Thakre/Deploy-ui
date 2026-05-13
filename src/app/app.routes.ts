import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Catalog } from './pages/catalog/catalog';
import { BookDetail } from './pages/book-detail/book-detail';
import { Search } from './pages/search/search';
import { Cart } from './pages/cart/cart';
import { Checkout } from './pages/checkout/checkout';
import { OrderSuccess } from './pages/order-success/order-success';
import { Orders } from './pages/orders/orders';
import { Wishlist } from './pages/wishlist/wishlist';
import { Wallet } from './pages/wallet/wallet';
import { Notifications } from './pages/notifications/notifications';
import { Profile } from './pages/profile/profile';
import { AdminLayout } from './pages/admin/admin-layout';
import { AdminDashboard } from './pages/admin/dashboard/admin-dashboard';
import { AdminBooks } from './pages/admin/books/admin-books';
import { AdminOrders } from './pages/admin/orders/admin-orders';
import { AdminUsers } from './pages/admin/users/admin-users';
import { AdminReviews } from './pages/admin/reviews/admin-reviews';
import { AdminVerification } from './pages/admin/verification/admin-verification';
import { SellerBooks } from './pages/seller/seller-books';
import { sellerGuard } from './core/guards/seller.guard';
import { NotFound } from './pages/not-found/not-found';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'books', component: Catalog },
  { path: 'books/:id', component: BookDetail },
  { path: 'search', component: Search },
  { path: 'cart', component: Cart, canActivate: [authGuard] },
  { path: 'checkout', component: Checkout, canActivate: [authGuard] },
  { path: 'order-success', component: OrderSuccess, canActivate: [authGuard] },
  { path: 'orders', component: Orders, canActivate: [authGuard] },
  { path: 'wishlist', component: Wishlist, canActivate: [authGuard] },
  { path: 'wallet', component: Wallet, canActivate: [authGuard] },
  { path: 'notifications', component: Notifications, canActivate: [authGuard] },
  { path: 'profile', component: Profile, canActivate: [authGuard] },
  { 
    path: 'admin', 
    component: AdminLayout, 
    canActivate: [adminGuard], 
    children: [
      { path: '', component: AdminDashboard },
      { path: 'books', component: AdminBooks },
      { path: 'verification', component: AdminVerification },
      { path: 'orders', component: AdminOrders },
      { path: 'users', component: AdminUsers },
      { path: 'reviews', component: AdminReviews }
    ]
  },
  { 
    path: 'seller', 
    component: SellerBooks, 
    canActivate: [sellerGuard]
  },
  { path: '**', component: NotFound }
];
