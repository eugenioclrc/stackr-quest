import { STF, Transitions } from "@stackr/sdk/machine";
import { CounterState } from "./state";
import { createMap, movePlayer } from "./GameLogic";

// Synchronous
import {randomBytes} from 'node:crypto';

const create: STF<CounterState> = {
  handler: ({ state, emit, msgSender }) => {
    const accountIdx = state.findIndex(
      (account) => account.address === msgSender
    );

    const userState = accountIdx > -1 ? state[accountIdx] : {
      address: msgSender,
      level: 1,
      genseed: randomBytes(32).toString('hex'),
      currentseed: randomBytes(32).toString('hex'),
      entities: [],
    };

    if (accountIdx === -1) {
      state.push(userState);
    }

    const map = createMap(userState);

    emit({ name: "ValueAfterIncrement", value: JSON.stringify({
      genseed: userState.genseed,
      currentseed: userState.currentseed,
    }
    ) });
    return state;
  },
};

const move: STF<CounterState> = {
  handler: ({ state, emit, inputs }) => {
    const accountIdx = state.findIndex(
      (account) => account.address === inputs.address
    );

    if (accountIdx === -1) {
      throw new Error("Account not found");
    }

    const userState = state[accountIdx];

    if(inputs.position === 0) {
      movePlayer(userState, -1, 0);
      emit({ name: "ValueAfterMove", value: "left" });
    } else if(inputs.position === 1) {
      movePlayer(userState, 1, 0);
      emit({ name: "ValueAfterMove", value: "right" });
    } else if(inputs.position === 2) {
      movePlayer(userState, 0, -1);
      emit({ name: "ValueAfterMove", value: "up" });
    } else if(inputs.position === 3) {
      movePlayer(userState, 0, 1);
      emit({ name: "ValueAfterMove", value: "down" });
    } else {
      throw new Error("Invalid position");
    }
    return state;
  },
};

export const transitions: Transitions<CounterState> = {
  create,
  move,
};
