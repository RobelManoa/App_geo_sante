// middlewares/upload.js (ES Modules)

import multer from "multer";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Pour résoudre __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads/"));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + ext);
  },
});

const allowedTypes = /jpeg|jpg|png|webp/;

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 Mo par fichier
  },
  fileFilter: (req, file, cb) => {
    const extOk = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeOk = allowedTypes.test(file.mimetype);
    if (extOk && mimeOk) {
      return cb(null, true);
    }
    cb(new Error("Seules les images (jpg, jpeg, png, webp) sont autorisées"));
  },
});

export default upload;
