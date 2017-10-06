import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppStore, Dependency } from './dependencies';

@Component({
  selector: 'vn-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  dependencies$: Store<Dependency[]>;

  title = 'vn';
  constructor(store: Store<AppStore>) {
    this.dependencies$ = store.select('dependencies');
  }
}
