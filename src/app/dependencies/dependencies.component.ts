import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AppStore, Dependency, LOAD_PACKAGE_INFO, RemoveDependency, AddDependency, UpdateDependency } from '../dependencies';
import { Store } from '@ngrx/store';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'vn-dependencies',
  templateUrl: './dependencies.component.html',
  styleUrls: ['./dependencies.component.scss']
})
export class DependenciesComponent implements OnInit {
  @Input() dependencies: Dependency[];
  @ViewChild('dependencyForm') dependencyForm: NgForm;

  dependencyToAdd: Partial<Dependency> = {};

  constructor(private _store: Store<AppStore>) { }

  ngOnInit() {
  }

  refresh() {
    this._store.dispatch({type: LOAD_PACKAGE_INFO});
  }

  removeDependency(dependencyName) {
    this._store.dispatch(new RemoveDependency(dependencyName));
  }

  checkFormValidity(): this is this & {dependencyToAdd: Dependency} {
    return this.dependencyForm.valid;
  }

  addDependency() {
    if (this.checkFormValidity()) {
      this._store.dispatch(new AddDependency(this.dependencyToAdd));
    } else {
      console.log('error');
    }
  }

  updateDependency(dependencyIdx: number) {
    this._store.dispatch(new UpdateDependency(dependencyIdx));
  }
}
