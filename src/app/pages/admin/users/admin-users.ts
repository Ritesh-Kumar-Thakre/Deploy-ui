import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-admin-users',
  imports: [],
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.css'
})
export class AdminUsers implements OnInit {
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  users: any[] = [];
  loading = true;

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.auth.getAllUsers().subscribe({
      next: (res) => {
        this.users = res;
        this.loading = false;
      },
      error: () => {
        this.users = [];
        this.loading = false;
        this.toast.show('Failed to load users', 'error');
      }
    });
  }

  deleteUser(userId: number) {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      this.auth.deleteUser(userId).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.userId !== userId);
          this.toast.show('User deleted successfully', 'success');
        },
        error: (err) => this.toast.show(err.error?.message || 'Failed to delete user', 'error')
      });
    }
  }

  changeRole(userId: number, event: any) {
    const role = event.target.value;
    this.auth.changeRole(userId, role).subscribe({
      next: () => {
        this.toast.show(`Role updated to ${role}`, 'success');
        // Update local list
        const user = this.users.find(u => u.userId === userId);
        if (user) user.role = role;
      },
      error: (err) => {
        this.toast.show(err.error?.message || 'Failed to update role', 'error');
        this.loadUsers(); // Revert on failure
      }
    });
  }
}
