import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NxWelcome } from './nx-welcome';
import { StoreSdk } from '@store-sdk/core';

@Component({
  imports: [NxWelcome, RouterModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected title = 'example-angular';

  async ngOnInit() {
    StoreSdk.init({ baseUrl: 'https://example.com' });
    const products = await StoreSdk.products.list();
    console.log(products);
  }
}
