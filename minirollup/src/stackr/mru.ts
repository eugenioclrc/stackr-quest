import { MicroRollup } from "@stackr/sdk";
import { stackrConfig } from "../../stackr.config";
import { machine } from "./machine";
import { UpdateCounterSchema, MoveCounterSchema } from "./schemas";
import { Playground } from "@stackr/sdk/plugins";

const mru = await MicroRollup({
  config: stackrConfig,
  actionSchemas: [UpdateCounterSchema, MoveCounterSchema],
  stateMachines: [machine],
});

await mru.init();

Playground.init(mru); 

export { mru };
