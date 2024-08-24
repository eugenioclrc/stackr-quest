import { DA, KeyPurpose, SignatureScheme, StackrConfig } from "@stackr/sdk";
import dotenv from "dotenv";

dotenv.config();

const stackrConfig: StackrConfig = {
  isSandbox: true,
  sequencer: {
    blockSize: 16,
    blockTime: 10,
  },
  syncer: {
    vulcanRPC: process.env.VULCAN_RPC as string,
    L1RPC: process.env.L1_RPC as string,
  },
  operator: {
    accounts: [
      {
        privateKey: process.env.PRIVATE_KEY as string,
        purpose: KeyPurpose.BATCH,
        scheme: SignatureScheme.ECDSA,
      },
    ],
  },
  domain: {
    name: "StackrQuest",
    version: "1",
    salt: "0x84a6a617d3078517f6f6610921717927c98d88c4cffe8c7ea017c4abb61b4dce",
  },
  datastore: {
    type: "sqlite",
    uri: process.env.DATABASE_URI as string,
  },
  registryContract: process.env.REGISTRY_CONTRACT as string,
  preferredDA: DA.CELESTIA,
  logLevel: "log",
};

export { stackrConfig };
