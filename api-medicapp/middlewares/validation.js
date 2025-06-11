import Joi from 'joi';

export const validateUser = (req, res, next) => {
  const schema = Joi.object({
    societe: Joi.string().required(),
    identifiant: Joi.string().required(),
    nom: Joi.string().required(),
    prenom: Joi.string().required(),
    dateNaissance: Joi.date().required(),
    dateArrivee: Joi.date().required(),
    fonction: Joi.string().required(),
    niveauFonction: Joi.string().required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details.map(d => d.message)
    });
  }

  next();
};