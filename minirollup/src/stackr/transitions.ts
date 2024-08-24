import { STF, Transitions } from "@stackr/sdk/machine";
import { CounterState } from "./state";
import { createMap } from "./GameLogic";

// Synchronous
import {randomBytes} from 'node:crypto';

const increment: STF<CounterState> = {
  handler: ({ state, emit, msgSender }) => {
    const accountIdx = state.findIndex(
      (account) => account.address === msgSender
    );

    let userState = accountIdx > -1 ? state[accountIdx] : {
      address: msgSender,
      level: 1,
      genseed: randomBytes(32).toString('hex'),
      currentseed: randomBytes(32).toString('hex'),
      entities: [],
    };

    if (accountIdx === -1) {
      state.push(userState);
    }

    createMap(userState);

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
/*
    if (accountIdx === -1) {
      state.push({
        address: inputs.address,
        counter: -1,
      });
    } else {
      state[accountIdx].counter -= 1;
    }
    emit({ name: "ValueAfterDecrement", value: JSON.stringify(state) });
    */
    return state;
  },
};

export const transitions: Transitions<CounterState> = {
  increment,
  move,
};
