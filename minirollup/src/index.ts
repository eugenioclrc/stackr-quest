import { ActionConfirmationStatus } from "@stackr/sdk";
import { Wallet } from "ethers";
import { mru } from "./stackr/mru.ts";
import { UpdateCounterSchema } from "./stackr/schemas.ts";
import { signMessage } from "./utils.ts";

const main = async () => {
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

  inputs.timestamp = Date.now();


  const signature2 = await signMessage(wallet, UpdateCounterSchema, inputs);
  const incrementAction2 = UpdateCounterSchema.actionFrom({
    inputs,
    signature: signature2,
    msgSender: wallet.address,
  });

  const ack2 = await mru.submitAction("increment", incrementAction2);
  console.log(ack2.hash);

  // leverage the ack to wait for C1 and access logs & error from STF execution
  const rr = await ack2.waitFor(ActionConfirmationStatus.C1);
  console.log(rr);



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

};

main();
