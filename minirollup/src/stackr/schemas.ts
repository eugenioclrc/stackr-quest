import { ActionSchema, SolidityType } from "@stackr/sdk";

export const UpdateCounterSchema = new ActionSchema("update-counter", {
  timestamp: SolidityType.UINT,
});


export const MoveCounterSchema = new ActionSchema("move-counter", {
  timestamp: SolidityType.UINT,
  position: SolidityType.UINT, // 0 for left, 1 for right, 2 for up, 3 for down
});


export const schemas = {
  UpdateCounterSchema, MoveCounterSchema
};