import app from "./app.js";

const port = Number(process.env.PORT) || 4000;
const server = app.listen(port, "127.0.0.1", () => {
  process.stdout.write(`M.A.R.S API listening at http://localhost:${port}\n`);
  process.stdout.write(`Swagger docs at http://localhost:${port}/api-docs\n`);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    server.close(() => process.exit(0));
  });
}
