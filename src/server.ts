import "dotenv/config";
import express from "express";
import { auth, requiredScopes } from "express-oauth2-jwt-bearer";
import { auth as oidc, requiresAuth } from "express-openid-connect";
import { createTable } from "./db";
import { handleHome, handleInfo } from "./routes/public";
import { handleGetPass, handleCreatePass } from "./routes/api";
import { handleCancel, handleDelete } from "./routes/admin";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

const checkToken = auth({
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  audience: process.env.AUTH0_AUDIENCE,
});

app.use(
  oidc({
    authRequired: false,
    auth0Logout: true,
    baseURL: process.env.BASE_URL,
    issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
    clientID: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    secret: process.env.SESSION_SECRET,
    authorizationParams: {
      response_type: "code",
    },
  })
);

app.get("/", handleHome);
app.get("/info/:id", handleInfo);

app.get("/passes/:id", checkToken, requiredScopes("read:passes"), handleGetPass);
app.post("/passes", checkToken, requiredScopes("create:passes"), express.json(), handleCreatePass);

app.post("/passes/:id/cancel", requiresAuth(), handleCancel);
app.post("/passes/:id/delete", requiresAuth(), handleDelete);

function handleListen(): void {
  console.log(`Server sluša na http://localhost:${PORT}`);
}

async function start(): Promise<void> {
  await createTable();
  console.log("Tablica passes spremna");
  app.listen(PORT, handleListen);
}

start();
