// server.js (ES Modules)
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

import prestataireRoutes from "./routes/prestataireRoutes.js";
import chatRoutes from "./routes/chat.js";
import userRoutes from "./routes/users.js";
import carteRoutes from "./routes/carte.js";
import prestataireAuthRoutes from "./routes/prestataireAuth.js";
import prestataireAccountsRoutes from "./routes/prestataireAccounts.js";

dotenv.config();

if (!process.env.SESSION_TOKEN_SECRET || !process.env.CARD_TOKEN_SECRET) {
  console.error("❌ SESSION_TOKEN_SECRET et CARD_TOKEN_SECRET doivent être définis (voir .env.example)");
  process.exit(1);
}

// Pour résoudre __dirname avec ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const mongoURI = process.env.MONGO_URI || "mongodb://mongo:27017/medicapp";

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/prestataires", prestataireRoutes);
app.use("/api/utilisateurs", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/carte", carteRoutes);
app.use("/api/prestataireAuth", prestataireAuthRoutes);
app.use("/api/prestataireAccounts", prestataireAccountsRoutes);

const startServer = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log("✅ Connecté à MongoDB avec succès");

    app.listen(PORT, () => {
      console.log(`🚀 API active sur http://192.168.100.203:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Erreur de connexion à MongoDB:", err.message);
    process.exit(1);
  }
};

startServer();
