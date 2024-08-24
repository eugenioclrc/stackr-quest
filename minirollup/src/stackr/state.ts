import { State } from "@stackr/sdk/machine";
import { solidityPackedKeccak256 } from "ethers";

export enum ENTITY_TYPE {
  PLAYER = "PLAYER",
  ORC = "ORC",
  STAIRS = "STAIRS",
}

export type Entity = {
  id: string;
  x: number;
  y: number;
  type: ENTITY_TYPE;
  extra: string; // json with extra data if need
};

export type Counters = {
  address: string;
  randomseed: bigint;// random seed for the map
  currentseed: bigint; // random seed after each movement
  entities: Entity[];
}[];

export class CounterState extends State<Counters> {
  constructor(state: Counters) {
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
