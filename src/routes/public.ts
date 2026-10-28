import { Request, Response } from "express";
import { countAll, countActive, getPass, listPasses } from "../db";

function escapeHtml(text: string): string {
  let result = text;
  result = result.replaceAll("&", "&amp;");
  result = result.replaceAll("<", "&lt;");
  result = result.replaceAll(">", "&gt;");
  result = result.replaceAll('"', "&quot;");
  return result;
}

function renderPage(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="hr">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <link href="https://fonts.googleapis.com/css2?family=Roboto+Slab&display=swap" rel="stylesheet">
  <style>
    body { font-family: "Roboto Slab", serif; max-width: 800px; margin: 40px auto; padding: 0 16px; }
    table { border-collapse: collapse; }
    th, td { border: 1px solid #ccc; padding: 4px 8px; text-align: left; }
    form { display: inline; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  ${body}
</body>
</html>`;
}

async function renderPassTable(): Promise<string> {
  const passes = await listPasses();

  let rows = "";
  for (const pass of passes) {
    let cancelButton = "";
    if (pass.status === "ACTIVE") {
      cancelButton = `<form method="post" action="/passes/${pass.id}/cancel"><button>Poništi</button></form>`;
    }
    const deleteButton = `<form method="post" action="/passes/${pass.id}/delete"><button>Obriši</button></form>`;

    rows += `
      <tr>
        <td>${escapeHtml(pass.name)}</td>
        <td>${escapeHtml(pass.document)}</td>
        <td>${pass.issued_at.toISOString()}</td>
        <td>${pass.status}</td>
        <td>${cancelButton} ${deleteButton}</td>
      </tr>`;
  }

  return `
    <table>
      <tr><th>Ime i prezime</th><th>Dokument</th><th>Izdano</th><th>Status</th><th></th></tr>
      ${rows}
    </table>`;
}

export async function handleHome(req: Request, res: Response): Promise<void> {
  const total = await countAll();
  const active = await countActive();

  let body = `
    <p>Ukupno propusnica: ${total}</p>
    <p>Aktivnih propusnica: ${active}</p>
  `;

  if (req.oidc.isAuthenticated()) {
    body += `<p><a href="/logout">Odjava</a></p>`;
    body += await renderPassTable();
  } else {
    body += `<p><a href="/login">Prijava</a></p>`;
  }

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
    <p>Ime i prezime: ${escapeHtml(pass.name)}</p>
    <p>Dokument: ${escapeHtml(pass.document)}</p>
    <p>Vrijeme izdavanja: ${pass.issued_at.toISOString()}</p>
  `;
  res.send(renderPage("Propusnica", body));
}
