import "dotenv/config";
import express from "express";
import { auth, requiredScopes } from "express-oauth2-jwt-bearer";
import { createTable } from "./db";
import { handleHome, handleInfo } from "./routes/public";
import { handleGetPass, handleCreatePass } from "./routes/api";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

const checkToken = auth({
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  audience: process.env.AUTH0_AUDIENCE,
});

app.get("/", handleHome);
app.get("/info/:id", handleInfo);

app.get("/passes/:id", checkToken, requiredScopes("read:passes"), handleGetPass);
app.post("/passes", checkToken, requiredScopes("create:passes"), express.json(), handleCreatePass);

function handleListen(): void {
  console.log(`Server sluša na http://localhost:${PORT}`);
}

async function start(): Promise<void> {
  await createTable();
  console.log("Tablica passes spremna");
  app.listen(PORT, handleListen);
}

start();
