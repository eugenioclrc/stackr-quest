import { STF, Transitions } from "@stackr/sdk/machine";
import { CounterState } from "./state";

// Synchronous
import {randomBytes} from 'node:crypto';

const increment: STF<CounterState> = {
  handler: ({ state, emit, msgSender }) => {
    const accountIdx = state.findIndex(
      (account) => account.address === msgSender
    );

    if (accountIdx === -1) {
      const buf = randomBytes(256);
      state.push({
        address: msgSender,
        randomseed: BigInt(buf.toString('hex')),
        currentseed: BigInt(buf.toString('hex')),
        entities: [],
      });
    } else {
      state[accountIdx].currentseed += 1n;
    }

    emit({ name: "ValueAfterIncrement", value: JSON.stringify([msgSender,state]
    ) });
    return state;
  },
};

const decrement: STF<CounterState> = {
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
  decrement,
};
