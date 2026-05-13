import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = `${environment.apiUrl}/api/v1/auth`;
  currentUser$ = new BehaviorSubject<any>(this.getStoredUser());

  /** Public endpoints that don't need Authorization header */
  static readonly PUBLIC_PATHS = [
    '/api/v1/auth/login',
    '/api/v1/auth/register',
    '/api/v1/auth/google',
    '/api/v1/auth/uploads/',
    '/api/v1/books/all',
    '/api/v1/books/search',
    '/api/v1/books/genre/',
    '/api/v1/books/featured',
    '/api/v1/books/uploads/',
    '/api/v1/reviews/book/',
    '/api/v1/reviews/average/'
  ];

  constructor(private http: HttpClient) {
    // Clean up stale/expired token on service init
    this.cleanUpStaleToken();
  }

  register(data: any) {
    return this.http.post(`${this.api}/register`, data);
  }

  login(email: string, password: string) {
    return this.http.post(`${this.api}/login`, { email, password }, { responseType: 'text' }).pipe(
      tap(res => {
        if (res) {
          const actualToken = res.replace(/^"|"$/g, '');
          localStorage.setItem('token', actualToken);
          this.decodeAndStoreUser(actualToken);
        }
      })
    );
  }

  loginWithGoogle(idToken: string) {
    return this.http.post<any>(`${this.api}/google`, { idToken }).pipe(
      tap(res => {
        if (res && res.token) {
          localStorage.setItem('token', res.token);
          this.decodeAndStoreUser(res.token);
        }
      })
    );
  }

  logout() {
    // Capture token BEFORE clearing storage, so we can send it in the header
    const token = localStorage.getItem('token');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser$.next(null);
    // Manually set the Authorization header since localStorage is already cleared
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return this.http.post(`${this.api}/logout`, {}, { headers });
  }

  getProfile(userId?: number) {
    if (userId) {
      return this.http.get(`${this.api}/getProfile/${userId}`);
    }
    return this.http.get(`${this.api}/me`);
  }

  updateProfile(user: any) {
    return this.http.patch(`${this.api}/update`, user);
  }

  changePassword(userId: number, oldPassword: string, newPassword: string) {
    // Backend expects userId in body, not URL path
    return this.http.patch(`${this.api}/change-password`, { userId: String(userId), oldPassword, newPassword });
  }

  getAllUsers() {
    return this.http.get<any[]>(`${this.api}/users`);
  }

  deleteUser(userId: number) {
    return this.http.delete(`${this.api}/delete/${userId}`);
  }

  changeRole(userId: number, role: string) {
    return this.http.patch(`${this.api}/change-role/${userId}`, {}, { params: { role } });
  }

  uploadProfileImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.api}/upload-profile-image`, formData);
  }

  /**
   * Check if user is logged in AND has a non-expired token.
   * Returns false and cleans up if token is expired.
   */
  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;

    if (this.isTokenExpired(token)) {
      // Token expired — clean up silently
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.currentUser$.next(null);
      return false;
    }

    return true;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserId(): number | null {
    const user = this.getStoredUser();
    return user?.userId || null;
  }

  getRole(): string {
    const user = this.getStoredUser();
    return user?.role || 'CUSTOMER';
  }

  /**
   * Check if the JWT token has expired by decoding the `exp` claim.
   */
  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (!payload.exp) return false;
      // exp is in seconds, Date.now() is in milliseconds
      return (payload.exp * 1000) < Date.now();
    } catch {
      // If we can't decode the token, treat it as expired
      return true;
    }
  }

  /**
   * Check if a request URL is a public endpoint that doesn't need auth.
   */
  isPublicUrl(url: string): boolean {
    // Extract the path from the full URL
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname;

      // Check against known public paths
      for (const publicPath of AuthService.PUBLIC_PATHS) {
        if (path.startsWith(publicPath)) return true;
      }
    } catch {
      // If URL parsing fails, check as a string
      for (const publicPath of AuthService.PUBLIC_PATHS) {
        if (url.includes(publicPath)) return true;
      }
    }

    return false;
  }

  private getStoredUser(): any {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  }

  private decodeAndStoreUser(token: string) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const user = { userId: payload.userId, email: payload.sub, role: payload.role || 'CUSTOMER' };
      localStorage.setItem('user', JSON.stringify(user));
      this.currentUser$.next(user);
    } catch (e) {
      console.error('Failed to decode token', e);
    }
  }

  /**
   * On service init, check if there's a stale token and clean up.
   */
  private cleanUpStaleToken() {
    const token = localStorage.getItem('token');
    if (token && this.isTokenExpired(token)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.currentUser$.next(null);
    }
  }
}
