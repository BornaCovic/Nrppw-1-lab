import { writeFile } from "node:fs/promises";

export async function getToken(
    authority: string,
    audience: string,
    clientId: string,
    clientSecret: string,
    scope: string
): Promise<string> {
    let baseUrl = authority;
    if (baseUrl.endsWith("/")) {
        baseUrl = baseUrl.slice(0, -1);
    }

    const response = await fetch(`${baseUrl}/oauth/token`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            grant_type: "client_credentials",
            client_id: clientId,
            client_secret: clientSecret,
            audience: audience,
            scope: scope,
        }),
    });

    if (!response.ok) {
        throw new Error(`Dohvat tokena nije uspio, status ${response.status}`);
    }

    const data = await response.json();
    return data.access_token;
}

export async function issuePass(
  url: string,
  token: string,
  name: string,
  document: string
): Promise<void> {
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name: name,
            document: document,
        }),
    });

    if (response.status !== 201) {
        throw new Error(`Izdavanje propusnice nije uspjelo, status ${response.status}`);
    }

    const location = response.headers.get("Location");
    if (location === null) {
        throw new Error("Odgovor nema zaglavlje Location");
    }

    const parts = location.split("/");
    const id = parts[parts.length - 1];

    const bytes = await response.arrayBuffer();
    await writeFile(`${id}.png`, Buffer.from(bytes));
}
