import { State } from "@stackr/sdk/machine";
import { solidityPackedKeccak256 } from "ethers";

export enum ENTITY_TYPE {
  PLAYER = "PLAYER",
  ORC = "ORC",
  STAIRS = "STAIRS",
}

export type Entity = {
  id: number;
  x: number;
  y: number;
  type: ENTITY_TYPE;
  hp?: number;
  xp?: number;
  level?: number;
  xp_award?: number;
  dead?: boolean;
  extra: string; // json with extra data if need
  increased_max_hp?: number;
  increased_power?: number;
  increased_defense?: number;
  effective_max_hp?: number;
  effective_power?: number;
  effective_defense?: number;
  base_max_hp?: number;
  base_power?: number;
  base_defense?: number;
  getExtra(param: string, defaultValue: any): any;
};

export type Counters = {
  address: string;
  level: number;
  genseed: string;// random seed for the map
  currentseed: string; // random seed after each movement
  entities: Entity[];
};

export function newEntity(id: number, type: ENTITY_TYPE, x: number, y: number, extra: string): Entity {
  const ret = { 
    id, type, x, y, extra,
    getExtra(param: string, defaultValue: any) {
      return JSON.parse(this.extra)[param] || defaultValue;
    },
    get increased_max_hp() { return 0; /* eventually could be a function of level / equipment */ },
    get increased_power() { return 0; /* eventually could be a function of level / equipment */ },
    get increased_defense() { return 0; /* eventually could be a function of level / equipment */ },
    get effective_max_hp() { return this.getExtra('base_max_hp', 0) + this.increased_max_hp; },
    get effective_power() { return this.getExtra('base_power', 0) + this.increased_power; },
    get effective_defense() { return this.getExtra('base_defense', 0) + this.increased_defense; },
  };

  Object.keys(extra).forEach((key) => {
    ret[key] = extra[key];
  });

  return ret;
}

export class CounterState extends State<Counters[]> {
  constructor(state: Counters[]) {
    super(state);
  }

  // Here since the state is simple and doesn't need wrapping, we skip the transformers to wrap and unwrap the state

  // transformer() {
  //   return {
  //     wrap: () => this.state,
  //     unwrap: (wrappedState: number) => wrappedState,
  //   };
  // }

  getRootHash() {
    // NOTE: The following line is for testing purposes only
    // in production, the root hash should be calculated
    // by creating a merkle tree of the state leaves.
    return solidityPackedKeccak256(["string"], [JSON.stringify(this.state)]);
  }
}
