import "dotenv/config";
import express, { Request, Response } from "express";
import { createTable } from "./db";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

function handleHome(req: Request, res: Response): void {
  res.send("Server radi!");
}

app.get("/", handleHome);

function handleListen(): void {
  console.log(`Server sluša na http://localhost:${PORT}`);
}

async function start(): Promise<void> {
  await createTable();
  console.log("Tablica passes spremna");
  app.listen(PORT, handleListen);
}

start();
