import { Request, Response } from "express";
import { cancelPass, deletePass } from "../db";

export async function handleCancel(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id);
  await cancelPass(id);
  res.redirect("/");
}

export async function handleDelete(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id);
  await deletePass(id);
  res.redirect("/");
}
