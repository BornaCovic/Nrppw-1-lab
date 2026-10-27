import { Request, Response } from "express";
import { countAll, countActive, getPass } from "../db";

function renderPage(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="hr">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <link href="https://fonts.googleapis.com/css2?family=Roboto+Slab&display=swap" rel="stylesheet">
  <style>
    body { font-family: "Roboto Slab", serif; max-width: 600px; margin: 40px auto; padding: 0 16px; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  ${body}
</body>
</html>`;
}

export async function handleHome(req: Request, res: Response): Promise<void> {
  const total = await countAll();
  const active = await countActive();

  const body = `
    <p>Ukupno propusnica: ${total}</p>
    <p>Aktivnih propusnica: ${active}</p>
  `;
  res.send(renderPage("Digitalne propusnice", body));
}

export async function handleInfo(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id);
  const pass = await getPass(id);

  if (pass === null) {
    res.status(404);
    res.send(renderPage("Propusnica ne postoji", ""));
    return;
  }

  const body = `
    <p>Status: <strong>${pass.status}</strong></p>
    <p>Ime i prezime: ${pass.name}</p>
    <p>Dokument: ${pass.document}</p>
    <p>Vrijeme izdavanja: ${pass.issued_at.toISOString()}</p>
  `;
  res.send(renderPage("Propusnica", body));
}
