function assertEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

export const sanityWebhookSecret = () => assertEnv("SANITY_WEBHOOK_SECRET");
