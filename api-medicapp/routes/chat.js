import express from 'express';
import { OpenAI } from 'openai';
import { v4 as uuidv4 } from "uuid";
import Typo from "typo-js";
import Prestataire from "../models/prestataireModel.js";
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

// Configuration OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Dictionnaire français
const dictionary = new Typo("fr_FR");

// Gestion des conversations avec expiration (1h)
const conversations = new Map();
const SESSION_TIMEOUT = 3600000; // 1 heure en ms

// Fonction de nettoyage de texte
function normalize(text) {
  if (!text) return "";
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\sàâäéèêëîïôöùûüç]/gi, "");
}

// Calcul de distance géographique (Haversine)
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;

  const R = 6371; // Rayon de la Terre en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

// Détection d'intention améliorée
function detectIntent(message) {
  const normalized = normalize(message);

  const intentPatterns = {
    urgence: /urgence|respire|danger|vite|saigne|étouffe|mourir|911|15|112/i,
    grossesse: /accouche|enceinte|gyn|gynéco|obstétrique|bébé|foetus/i,
    symptome:
      /mal|douleur|tête|ventre|fièvre|toux|nausée|vomi|frisson|fatigue/i,
    prestataire:
      /pharmacie|hôpital|clinique|centre|cabinet|médecin|docteur|spécialiste/i,
    conseil: /vaccin|santé|prévention|conseil|hygiène|médicament|ordonnance/i,
    conversation: /bonjour|salut|ça va|comment|saluer|hello|hi|hey/i,
    orientation:
      /aller[ -]?à|direction|trouve[ -]?moi|où est|itinéraire|localiser/i,
  };

  return (
    Object.entries(intentPatterns).find(([_, pattern]) =>
      pattern.test(normalized)
    )?.[0] || "inconnu"
  );
}

// Nettoyage des sessions expirées
function cleanExpiredSessions() {
  const now = Date.now();
  for (const [id, data] of conversations) {
    if (now - data.lastActive > SESSION_TIMEOUT) {
      conversations.delete(id);
    }
  }
}

// Route principale
router.post("/", async (req, res) => {
  try {
    const { message, userLocation, sessionId = uuidv4() } = req.body;

    if (
      !message ||
      typeof message !== "string" ||
      message.trim().length === 0
    ) {
      return res.status(400).json({
        reply: "Votre message semble vide. Pouvez-vous reformuler ?",
      });
    }

    if (!conversations.has(sessionId)) {
      conversations.set(sessionId, {
        history: [
          {
            role: "system",
            content:
              "Vous parlez à un assistant médical francophone. Soyez précis dans vos demandes.",
          },
        ],
        lastActive: Date.now(),
      });
    }

    const session = conversations.get(sessionId);
    session.lastActive = Date.now();
    session.history.push({ role: "user", content: message });

    if (conversations.size % 10 === 0) cleanExpiredSessions();

    const intent = detectIntent(message);
    let reply;

    switch (intent) {
      case "prestataire": {
        const searchTerm = normalize(message).replace(/[^\w\s]/gi, "");
        const query = {
          $or: [
            { nom: { $regex: searchTerm, $options: "i" } },
            { ville: { $regex: searchTerm, $options: "i" } },
            { categorie: { $regex: searchTerm, $options: "i" } },
            { prestations: { $regex: searchTerm, $options: "i" } },
          ],
        };

        const results = await Prestataire.find(query).limit(5);

        if (!results || results.length === 0) {
          reply = `Je n’ai trouvé aucun prestataire correspondant à votre demande 🤔.\nEssayez de reformuler ou d’être plus précis.`;
          session.history.push({ role: "assistant", content: reply });
          return res.json({ reply });
        }

        let sortedResults = results;
        if (userLocation?.latitude && userLocation?.longitude) {
          sortedResults = results
            .map((p) => ({
              ...p._doc,
              distance: calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                p.localisation?.latitude,
                p.localisation?.longitude
              ),
            }))
            .sort((a, b) => a.distance - b.distance);
        }

        const closest = sortedResults[0];
        reply = [
          `📌 Résultats pour "${message}":`,
          `🏥 ${closest.nom} (${
            closest.distance ? Math.round(closest.distance) + " km" : ""
          })`,
          `📍 ${closest.adresse}`,
          `📞 ${closest.telephone}`,
          `🕒 ${closest.horaires || "Horaires non précisés"}`,
          ...sortedResults
            .slice(1, 3)
            .map(
              (p) =>
                `\n🔹 ${p.nom} (${p.ville}) - ${
                  p.distance ? Math.round(p.distance) + " km" : ""
                }`
            ),
        ].join("\n");

        session.history.push({ role: "assistant", content: reply });
        return res.json({ reply });
      }

      case "urgence":
        reply =
          "🚨 URGENCE MÉDICALE 🚨\n\n1. Composez immédiatement le 15 (SAMU)\n2. Ou le 112 (numéro européen)\n3. Je peux vous indiquer les urgences les plus proches si vous partagez votre position.";
        session.history.push({ role: "assistant", content: reply });
        return res.json({ reply });

      case "symptome":
        reply =
          "ℹ️ Pour des symptômes médicaux :\n\n1. Décrivez votre symptôme en détail\n2. Précisez depuis combien de temps\n3. Indiquez votre localisation pour des conseils adaptés\n\n⚠️ En cas d'urgence, appelez le 15 immédiatement.";
        session.history.push({ role: "assistant", content: reply });
        return res.json({ reply });

      case "conseil":
        reply =
          "💡 Conseils santé généraux :\n\n• Lavez-vous les mains fréquemment\n• Hydratez-vous suffisamment\n• Dormez 7-8h par nuit\n• Consultez un médecin pour des conseils personnalisés\n• Pensez à vos vaccins à jour";
        session.history.push({ role: "assistant", content: reply });
        return res.json({ reply });

      case "conversation":
        reply =
          "👋 Bonjour ! Je suis votre assistant médical. Comment puis-je vous aider aujourd'hui ?\n\nVous pouvez :\n• Chercher un professionnel de santé\n• Obtenir des conseils médicaux\n• Décrire des symptômes";
        session.history.push({ role: "assistant", content: reply });
        return res.json({ reply });

      default: {
        try {
          const chatCompletion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: session.history.slice(-6),
            temperature: 0.7,
            max_tokens: 150,
            frequency_penalty: 0.5,
          });

          reply = chatCompletion.choices[0].message.content;
          session.history.push({ role: "assistant", content: reply });
          return res.json({ reply });
        } catch (error) {
          console.error("Erreur OpenAI:", error);
          reply =
            "Je rencontre des difficultés techniques. Pouvez-vous reformuler votre demande plus simplement ?";
          session.history.push({ role: "assistant", content: reply });
          return res.json({ reply });
        }
      }
    }
  } catch (err) {
    console.error("Erreur serveur:", err);
    return res.status(500).json({
      reply:
        "Désolé, un problème technique est survenu. Veuillez réessayer plus tard.",
    });
  }
});

setInterval(cleanExpiredSessions, SESSION_TIMEOUT);

export default router;
