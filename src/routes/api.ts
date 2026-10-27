import { Request, Response } from "express";
import { toBuffer } from "qrcode";
import { createPass, getPass } from "../db";

function isEmpty(value: unknown): boolean {
  if (typeof value !== "string") {
    return true;
  }
  return value.trim() === "";
}

export async function handleGetPass(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id);
  const pass = await getPass(id);

  if (pass === null) {
    res.sendStatus(404);
    return;
  }

  res.json({
    id: pass.id,
    name: pass.name,
    document: pass.document,
    issuedAt: pass.issued_at.toISOString(),
    status: pass.status,
  });
}

export async function handleCreatePass(req: Request, res: Response): Promise<void> {
  if (req.body === undefined || isEmpty(req.body.name) || isEmpty(req.body.document)) {
    res.status(400);
    res.send("name i document su obavezni");
    return;
  }

  const id = await createPass(req.body.name, req.body.document);

  const baseUrl = process.env.BASE_URL;
  const png = await toBuffer(`${baseUrl}/info/${id}`);

  res.status(201);
  res.set("Location", `${baseUrl}/passes/${id}`);
  res.type("png");
  res.send(png);
}
