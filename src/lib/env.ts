import "server-only";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable ${name}. See .env.example.`);
  }
  return value;
}

export const env = {
  projectKey: required("CTP_PROJECT_KEY"),
  clientId: required("CTP_CLIENT_ID"),
  clientSecret: required("CTP_CLIENT_SECRET"),
  authUrl: required("CTP_AUTH_URL"),
  apiUrl: required("CTP_API_URL"),
  scopes: required("CTP_SCOPES").split(" "),

  // Storefront context used for price selection and localized fields
  locale: process.env.STORE_LOCALE ?? "en-US",
  currency: process.env.STORE_CURRENCY ?? "USD",
  country: process.env.STORE_COUNTRY ?? "US",

  isProduction: process.env.NODE_ENV === "production",
};
