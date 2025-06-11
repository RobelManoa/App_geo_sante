// server.js (ES Modules)
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import prestataireRoutes from "./routes/prestataireRoutes.js";
import chatRoutes from "./routes/chat.js";
import userRoutes from "./routes/users.js";

dotenv.config();

// Pour résoudre __dirname avec ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/prestataires", prestataireRoutes);
app.use("/api/utilisateurs", userRoutes);
app.use("/api/chat", chatRoutes);

// MongoDB
const mongoURI = 'mongodb+srv://Robelmanoa:Robel2525@medicappcluster.eqwxvlc.mongodb.net/?retryWrites=true&w=majority&appName=MedicappCluster';
// const mongoURI = 'mongodb://localhost:27017/medicapp-api';
mongoose
  .connect(mongoURI)
  .then(() => {
    console.log("✅ Connecté à MongoDB avec succès");
    app.listen(PORT, () => {
      console.log(`🚀 API active sur http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Erreur de connexion à MongoDB:", err.message);
    process.exit(1);
  });
