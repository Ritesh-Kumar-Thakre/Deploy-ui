import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  imports: [AsyncPipe],
  templateUrl: './toast.html',
  styleUrl: './toast.css'
})
export class Toast {
  toast = inject(ToastService);
}
