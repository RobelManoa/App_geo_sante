// Récupérer un prestataire
router.get('/:id', async (req, res) => {
  try {
    const prestataire = await Prestataire.findById(req.params.id);
    res.json(prestataire);
  } catch (error) {
    res.status(404).json({ message: 'Prestataire non trouvé' });
  }
});

// Modifier un prestataire
router.put('/:id', async (req, res) => {
  try {
    const updated = await Prestataire.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: 'Erreur de mise à jour' });
  }
});

// Supprimer un prestataire
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Prestataire.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Prestataire non trouvé' });
    }
    res.json({ message: 'Prestataire supprimé avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});
