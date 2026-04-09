function assertEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

export const googleServiceAccountJson = () =>
  assertEnv("GOOGLE_SERVICE_ACCOUNT_JSON");
