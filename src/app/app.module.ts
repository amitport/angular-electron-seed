import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { Store, StoreModule } from '@ngrx/store';
import { AppAction, AppStore, DependenciesEffects, dependenciesReducer } from './dependencies';
import { HttpClientModule } from '@angular/common/http';
import { EffectsModule } from '@ngrx/effects';
import { DependenciesComponent } from './dependencies/dependencies.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    DependenciesComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,

    StoreModule.forRoot<AppStore, AppAction>(
      {dependencies: dependenciesReducer},
      {initialState: {dependencies: []}}
    ),
    EffectsModule.forRoot([DependenciesEffects]),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(store: Store<AppStore>) {
    store.dispatch({type: 'LOAD_DEPENDENCIES'});
  }
}
