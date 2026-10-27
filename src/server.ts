import express from "express";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.get("/", (req, res) => {
  res.send("BokBok");
});

app.listen(PORT, () => {
  console.log("Sluša na http://localhost:" + PORT);
});
