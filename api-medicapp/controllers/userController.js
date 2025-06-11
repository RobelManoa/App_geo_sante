import User from "../models/User.js";

// @desc    Récupérer tous les utilisateurs
// @route   GET /api/users
// @access  Privé (Admin)
export const getAllUsers = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Tri et filtrage
    const sort = req.query.sort || "-createdAt";
    const query = {};

    if (req.query.societe) {
      query.societe = new RegExp(req.query.societe, "i");
    }

    const users = await User.find(query).sort(sort).skip(skip).limit(limit);
    const total = await User.countDocuments(query);

    res.json({
      success: true,
      count: users.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: users,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: "Erreur serveur lors de la récupération des utilisateurs",
    });
  }
};

// @desc    Récupérer un utilisateur
// @route   GET /api/users/:id
// @access  Privé (Admin)
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Utilisateur non trouvé",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: "Erreur serveur lors de la récupération de l'utilisateur",
    });
  }
};

// @desc    Créer un utilisateur
// @route   POST /api/users
// @access  Privé (Admin)
export const createUser = async (req, res) => {
  try {
    const existingUser = await User.findOne({
      identifiant: req.body.identifiant,
    });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "Cet identifiant est déjà utilisé",
      });
    }

    const user = new User(req.body);
    await user.save();

    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (err) {
    console.error(err);

    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        error: messages,
      });
    }

    res.status(500).json({
      success: false,
      error: "Erreur serveur lors de la création de l'utilisateur",
    });
  }
};

// @desc    Mettre à jour un utilisateur
// @route   PUT /api/users/:id
// @access  Privé (Admin)
export const updateUser = async (req, res) => {
  try {
    if (req.body.identifiant) {
      const existingUser = await User.findOne({
        identifiant: req.body.identifiant,
        _id: { $ne: req.params.id },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: "Cet identifiant est déjà utilisé par un autre utilisateur",
        });
      }
    }

    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Utilisateur non trouvé",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (err) {
    console.error(err);

    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        error: messages,
      });
    }

    res.status(500).json({
      success: false,
      error: "Erreur serveur lors de la mise à jour de l'utilisateur",
    });
  }
};

// @desc    Supprimer un utilisateur
// @route   DELETE /api/users/:id
// @access  Privé (Admin)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Utilisateur non trouvé",
      });
    }

    res.json({
      success: true,
      data: {},
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: "Erreur serveur lors de la suppression de l'utilisateur",
    });
  }
};
