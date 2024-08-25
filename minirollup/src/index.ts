import { ActionConfirmationStatus } from "@stackr/sdk";
import { Wallet } from "ethers";
import { schemas, UpdateCounterSchema } from "./stackr/schemas.ts";
import { mru } from "./stackr/mru.ts";
import { signMessage } from "./utils.ts";
import { transitions } from "./stackr/transitions.ts";

import express, { Request, Response } from "express";

const PORT = 3210;

export async function setupServer() {
  const app = express();
  app.use(express.json());
  // allow CORS
  app.use((_req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
  });

  const { stateMachines, config, getStfSchemaMap, submitAction } = mru;
  const machine = stateMachines.getFirst();

  if (!machine) {
    throw new Error("Machine not found");
  }

  const transitionToSchema = getStfSchemaMap();

  /** Routes */
  app.get("/info", (_req: Request, res: Response) => {
    res.send({
      isSandbox: config.isSandbox,
      domain: config.domain,
      transitionToSchema,
      schemas: Object.values(schemas).reduce((acc, schema) => {
        acc[schema.identifier] = {
          primaryType: schema.EIP712TypedData.primaryType,
          types: schema.EIP712TypedData.types,
        };
        return acc;
      }, {} as Record<string, any>),
    });
  });

  app.get("/world/:address", (_req: Request, res: Response) => {
    res.json({ state: machine.state.find((v) => v.address === req.params.address) });
  });

  app.post("/:transition", async (req: Request, res: Response) => {
    const { transition } = req.params;

    if (!transitions[transition]) {
      res.status(400).send({ message: "NO_TRANSITION_FOR_ACTION" });
      return;
    }

    try {
      const { msgSender, signature, inputs } = req.body;

      const schemaId = transitionToSchema[transition];
      const schema = Object.values(schemas).find(
        (schema) => schema.identifier === schemaId
      );

      if (!schema) {
        throw new Error("NO_SCHEMA_FOUND");
      }

      const signedAction = schema.actionFrom({
        msgSender,
        signature,
        inputs,
      });

      const ack = await submitAction(transition, signedAction);
      const { logs, errors } = await ack.waitFor(ActionConfirmationStatus.C1);
      if (errors?.length) {
        throw new Error(errors[0].message);
      }
      res.status(201).send({ logs, ackHash: ack.hash });
    } catch (e: any) {
      res.status(400).send({ error: e.message });
    }
    return;
  });

  
  app.get("/", (_req: Request, res: Response) => {
    res.json({ state: machine.state });
  });

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
const main = async () => {
  await setupServer();
  console.log(UpdateCounterSchema)
  /*
  const inputs = {
    timestamp: Date.now(),
  };

  // Create a random wallet
  const wallet = Wallet.createRandom();

  const signature = await signMessage(wallet, UpdateCounterSchema, inputs);
  const incrementAction = UpdateCounterSchema.actionFrom({
    inputs,
    signature,
    msgSender: wallet.address,
  });

  let ack = await mru.submitAction("increment", incrementAction);
  console.log(ack.hash);

  // leverage the ack to wait for C1 and access logs & error from STF execution
  let { logs, errors } = await ack.waitFor(ActionConfirmationStatus.C1);
  console.log({ logs, errors });

  const inputs2 = {
    position: 2,
    timestamp: Date.now(),
  };



  const signature2 = await signMessage(wallet, UpdateCounterSchema, inputs2);
  const incrementAction2 = UpdateCounterSchema.actionFrom({
    inputs: inputs2,
    signature: signature2,
    msgSender: wallet.address,
  });

  const ack2 = await mru.submitAction("move", incrementAction2);
  console.log(ack2.hash);

  // leverage the ack to wait for C1 and access logs & error from STF execution
  const rr = await ack2.waitFor(ActionConfirmationStatus.C1);
  console.log(rr);

return;

  // Create a random wallet
  const wallet2 = Wallet.createRandom();

  const signature3 = await signMessage(wallet2, UpdateCounterSchema, inputs);
  const incrementAction3 = UpdateCounterSchema.actionFrom({
    inputs,
    signature: signature3,
    msgSender: wallet2.address,
  });

  let ack3 = await mru.submitAction("increment", incrementAction3);
  console.log(ack3.hash);

  // leverage the ack to wait for C1 and access logs & error from STF execution
  const er = await ack3.waitFor(ActionConfirmationStatus.C1);
  console.log(er);
  */

};

main();
