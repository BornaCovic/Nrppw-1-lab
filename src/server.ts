import "dotenv/config";
import express from "express";
import { createTable } from "./db";
import { handleHome, handleInfo } from "./routes/public";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.get("/", handleHome);
app.get("/info/:id", handleInfo);

function handleListen(): void {
  console.log(`Server sluša na http://localhost:${PORT}`);
}

async function start(): Promise<void> {
  await createTable();
  console.log("Tablica passes spremna");
  app.listen(PORT, handleListen);
}

start();
