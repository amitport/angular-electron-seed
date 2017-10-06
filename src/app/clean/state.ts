import { ImmutableArray, ImmutableObject } from 'seamless-immutable';

const Immutable = require("seamless-immutable").static;

type StateSchema = {
  dependencies: ImmutableArray<ImmutableObject<Dependency>>;
}

type State = ImmutableObject<StateSchema>;

interface Dependency {
  name: string;
  tag?: string;

  version?: string;

  registry: {
    loading: boolean;
    version?: string
  }
}


function addDependency(state: State, dependency: Dependency) {

}
