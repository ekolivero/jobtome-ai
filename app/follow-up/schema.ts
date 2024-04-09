import { DeepPartial } from "ai";
import { z } from "zod";

export const followUpSchema = z.object({
  followsUp: z.array(
    z.string().min(1).max(3).describe("Follow up question to pass to the user.")
  ),
});

export type PartialFollowsUp = DeepPartial<typeof followUpSchema>;
