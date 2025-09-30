import fastify from "fastify";

const app = fastify();

app.listen({port: Number(process.env.PORT)}).then(() => {
  console.log("Server is running on port 3305");
});