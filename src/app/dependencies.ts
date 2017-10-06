import { Action, Store } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/mergeMap';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/merge';
import { of } from 'rxjs/observable/of';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/operator/do';
import { initialDependencies } from './initial-dependencies';

export const LOAD_DEPENDENCIES_SUCCESS = 'LOAD_DEPENDENCIES_SUCCESS';

export const LOAD_PACKAGE_INFO = 'LOAD_PACKAGE_INFO';
export const LOAD_PACKAGE_INFO_FAILURE = 'LOAD_PACKAGE_INFO_FAILURE';
export const LOAD_PACKAGE_INFO_SUCCESS = 'LOAD_PACKAGE_INFO_SUCCESS';

export const REMOVE_DEPENDENCY = 'REMOVE_DEPENDENCY';
export const ADD_DEPENDENCY = 'ADD_DEPENDENCY';
export const UPDATE_DEPENDENCY = 'UPDATE_DEPENDENCY';

export interface Dependency {
  registryVersion?: string;
  name: string;
  referenceVersion: string;
  tag?: string;
}

interface PackageInfo {
  name: string;
  versions: { [key: string]: { version: string } };
  'dist-tags': { [key: string]: string }
}

type Dependencies = Dependency[] & { lastUpdate?: string, loadingPackageeInfo?: boolean };

export interface AppStore {
  dependencies: Dependencies;
}

class LoadDependenciesSuccess implements Action {
  readonly type = LOAD_DEPENDENCIES_SUCCESS;

  constructor(public payload: Dependency[]) {
  }
}

class LoadPackageInfo implements Action {
  readonly type = LOAD_PACKAGE_INFO;
}

class LoadPackageInfoSuccess implements Action {
  readonly type = LOAD_PACKAGE_INFO_SUCCESS;

  constructor(public payload: PackageInfo) {
  }
}

class LoadPackageInfoFailure implements Action {
  readonly type = LOAD_PACKAGE_INFO_FAILURE;
}

export class RemoveDependency implements Action {
  readonly type = REMOVE_DEPENDENCY;

  constructor(public payload: string) {
  }
}

export class AddDependency implements Action {
  readonly type = ADD_DEPENDENCY;

  constructor(public payload: Dependency) {
  }
}

export class UpdateDependency implements Action {
  readonly type = UPDATE_DEPENDENCY;

  constructor(public payload: number) {
  }
}

export type AppAction =
  LoadDependenciesSuccess
  | LoadPackageInfo
  | LoadPackageInfoSuccess
  | LoadPackageInfoFailure
  | RemoveDependency
  | AddDependency
  | UpdateDependency;

export function dependenciesReducer(state: Dependencies, action: AppAction): Dependencies {
  console.log(action);
  switch (action.type) {
    case LOAD_DEPENDENCIES_SUCCESS:
      return action.payload;
    case LOAD_PACKAGE_INFO: {
      const dependencies: Dependencies = state.slice();
      dependencies.lastUpdate = state.lastUpdate;
      dependencies.loadingPackageeInfo = true;
      return dependencies;
    }
    case LOAD_PACKAGE_INFO_SUCCESS: {
      const packageInfo = action.payload;
      const dependencyIdx = state.findIndex(_ => _.name === packageInfo.name);
      if (dependencyIdx !== -1) {
        const dependency = state[dependencyIdx];
        const registryVersion = packageInfo.versions[packageInfo['dist-tags'][dependency.tag ? dependency.tag : 'latest']].version;
        const dependencies: Dependencies = [...state.slice(0, dependencyIdx), {
          ...dependency,
          registryVersion
        }, ...state.slice(dependencyIdx + 1)];
        dependencies.lastUpdate = new Date().toLocaleTimeString();
        dependencies.loadingPackageeInfo = false;
        return dependencies;
      } else {
        return state;
      }
    }
    case LOAD_PACKAGE_INFO_FAILURE: {
      const dependencies: Dependencies = state.slice();
      dependencies.lastUpdate = state.lastUpdate;
      dependencies.loadingPackageeInfo = false;
      return dependencies;
    }
    case REMOVE_DEPENDENCY: {
      const dependencyName = action.payload;
      const dependencyIdx = state.findIndex(_ => _.name === dependencyName);
      const dependencies: Dependencies = [...state.slice(0, dependencyIdx), ...state.slice(dependencyIdx + 1)];
      dependencies.lastUpdate = state.lastUpdate;
      dependencies.loadingPackageeInfo = state.loadingPackageeInfo;
      return dependencies;
    }
    case ADD_DEPENDENCY: {
      const dependency = action.payload;

      const dependencies: Dependencies = [...state, dependency];
      dependencies.lastUpdate = state.lastUpdate;
      dependencies.loadingPackageeInfo = state.loadingPackageeInfo;
      return dependencies;
    }
    case UPDATE_DEPENDENCY: {
      const dependencyIdx = action.payload;
      const dependency = state[dependencyIdx];
      const updatedDependency = {
        registryVersion: dependency.registryVersion,
        name: dependency.name,
        referenceVersion: dependency.registryVersion,
        tag: dependency.tag,
      };
      const dependencies: Dependencies = [...state.slice(0, dependencyIdx), updatedDependency, ...state.slice(dependencyIdx + 1)];
      dependencies.lastUpdate = state.lastUpdate;
      dependencies.loadingPackageeInfo = state.loadingPackageeInfo;
      return dependencies;
    }
    default:
      return state;
  }
}

@Injectable()
export class DependenciesEffects {
  @Effect() loadDependencies$: Observable<Action> = this
    .actions$.ofType('LOAD_DEPENDENCIES')
    .map(() => {
      const dependencies = window.localStorage.hasOwnProperty('dependencies') ?
        JSON.parse(window.localStorage.dependencies) :
        initialDependencies;

      return new LoadDependenciesSuccess(dependencies);
    });

  @Effect() loadPackageInfo$: Observable<Action> = this
    .actions$.ofType(LOAD_PACKAGE_INFO).withLatestFrom(this._store.select('dependencies'))
    .mergeMap(([, dependencies]) =>
      dependencies.length === 0 ?
        of({type: LOAD_PACKAGE_INFO_FAILURE}) :
        Observable.merge(...dependencies.map(({name}) => this.http.get<PackageInfo>(
          `https://registry.npmjs.org/${name.replace('/', '%2F')}`)
          .map((data) => new LoadPackageInfoSuccess(data))
          .catch(() => of({type: LOAD_PACKAGE_INFO_FAILURE}))))
    );

  @Effect() compareCurrentVersion$: Observable<Action> = this
    .actions$.ofType(LOAD_DEPENDENCIES_SUCCESS, ADD_DEPENDENCY)
    .map(() => ({type: LOAD_PACKAGE_INFO}));

  @Effect({dispatch: false}) dependenciesChanged = this.actions$
    .ofType('LOAD_DEPENDENCIES_SUCCESS', REMOVE_DEPENDENCY, ADD_DEPENDENCY, UPDATE_DEPENDENCY)
    .withLatestFrom(this._store.select('dependencies'))
    .do(([, dependencies]) => {
      window.localStorage.dependencies = JSON.stringify(dependencies);
    });

  constructor(private http: HttpClient,
              private _store: Store<AppStore>,
              private actions$: Actions) {
  }
}
