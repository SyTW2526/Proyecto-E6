import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import photoRoutes from "./routes/photos.js";
import authRoutes from "./routes/auth.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" })); // Aumentar límite para imágenes base64
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Conexión con MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Conectado a MongoDB"))
  .catch((err) => console.error("Error conectando a MongoDB:", err));

// Rutas
app.get("/", (req, res) => {
  res.send("Servidor funcionando");
});

app.use("/api/auth", authRoutes);
app.use("/api/photos", photoRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
