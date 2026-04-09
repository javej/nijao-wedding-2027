function assertEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

export const resendApiKey = () => assertEnv("RESEND_API_KEY");
