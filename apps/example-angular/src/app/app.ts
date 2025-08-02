import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NxWelcome } from './nx-welcome';
import { StoreSdk } from '@store-sdk/core';
import { environment } from '../environments/environment.development';

@Component({
  imports: [NxWelcome, RouterModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected title = 'example-angular';

  async ngOnInit() {
    const products = await StoreSdk.products.list();
    const token = await StoreSdk.auth.token({
      username: environment.auth.username,
      password: environment.auth.password,
    });
    console.log(token);
    console.log(products);
  }
}
