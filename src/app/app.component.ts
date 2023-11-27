import { Component } from '@angular/core';
import { DbService } from './core/service/db.service';

@Component({
  selector: 'app-root',
  template: `<router-outlet></router-outlet>`,
})
export class AppComponent {
  constructor(private db: DbService) {
    this.db.downloadElbase();
    this.db.downloadElpinf();
  }
}
