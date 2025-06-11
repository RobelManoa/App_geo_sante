import Prestataire from '../models/prestataireModel.js';

// GET all prestataires
export const getAll = async (req, res) => {
  try {
    const prestataires = await Prestataire.find();
    res.status(200).json({
      success: true,
      count: prestataires.length,
      data: prestataires
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
};

// GET single prestataire
export const getOne = async (req, res) => {
  try {
    const prestataire = await Prestataire.findById(req.params.id);
    
    if (!prestataire) {
      return res.status(404).json({
        success: false,
        error: 'Prestataire non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: prestataire
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
};

// POST create prestataire
export const create = async (req, res) => {
  try {
    const newPrestataire = new Prestataire(req.body);
    const savedPrestataire = await newPrestataire.save();
    
    res.status(201).json({
      success: true,
      data: savedPrestataire
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// PUT update prestataire
export const update = async (req, res) => {
  try {
    const updatedPrestataire = await Prestataire.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedPrestataire) {
      return res.status(404).json({
        success: false,
        error: 'Prestataire non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: updatedPrestataire
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// DELETE prestataire
export const remove = async (req, res) => {
  try {
    const deletedPrestataire = await Prestataire.findByIdAndDelete(req.params.id);

    if (!deletedPrestataire) {
      return res.status(404).json({
        success: false,
        error: 'Prestataire non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
};