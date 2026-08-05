/**
 * Local type stub for @opengovsg/validators/email.
 * The package's real types pull zod/v4 .d.cts (TS 5+ const type params),
 * which this repo's TypeScript 4.7 cannot parse. Runtime still resolves
 * the real package; tsconfig paths only remaps types for tsc.
 */
export declare function createEmailSchema(options?: unknown): {
  safeParse(email: string): { success: boolean; data?: string }
}
