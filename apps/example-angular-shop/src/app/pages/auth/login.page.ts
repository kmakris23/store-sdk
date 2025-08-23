import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StoreSdk } from '@store-sdk/core';
import { environment } from '../../../environments/environment.development';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.page.html',
})
export class LoginPageComponent {
  username = signal(environment.auth?.username ?? '');
  password = signal(environment.auth?.password ?? '');
  loading = signal(false);
  error = signal<string | null>(null);

  private router = inject(Router);

  onField(sig: { set(v: string): void }, ev: Event) {
    const target = ev.target as HTMLInputElement | null;
    if (target) sig.set(target.value);
  }

  async onSubmit(e: Event) {
    e.preventDefault();
    this.loading.set(true);
    this.error.set(null);
    const { data, error } = await StoreSdk.simpleJwt.auth.token({
      username: this.username(),
      password: this.password(),
    });
    if (error) {
      this.error.set('Invalid credentials');
    } else if (data) {
      this.router.navigateByUrl('/products');
    }
    this.loading.set(false);
  }
}
