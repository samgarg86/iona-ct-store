import "server-only";

import { ClientBuilder } from "@commercetools/ts-client";
import { createApiBuilderFromCtpClient } from "@commercetools/platform-sdk";

import { env } from "@/lib/env";

const client = new ClientBuilder()
  .withProjectKey(env.projectKey)
  .withClientCredentialsFlow({
    host: env.authUrl,
    projectKey: env.projectKey,
    credentials: { clientId: env.clientId, clientSecret: env.clientSecret },
    scopes: env.scopes,
  })
  .withHttpMiddleware({ host: env.apiUrl, enableRetry: true })
  .build();

/** Project-scoped API root. Server-only: never import from client components. */
export const apiRoot = createApiBuilderFromCtpClient(client).withProjectKey({
  projectKey: env.projectKey,
});
