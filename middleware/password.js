const { default: mongoose } = require("mongoose");
const PasswordValidator = require("password-validator");

const passwordSchema = new PasswordValidator();

// Pré-requis mot de passe

passwordSchema
  .is()
  .min(8) // Minimum length 8
  .is()
  .max(16) // Maximum length 100
  .has()
  .uppercase() // Must have uppercase letters
  .has()
  .lowercase() // Must have lowercase letters
  .has()
  .digits(2) // Must have at least 2 digits
  .has()
  .not()
  .spaces() // Should not have spaces
  .is()
  .not()
  .oneOf(["Passw0rd", "Password123"]); // Blacklist these values


// Validation du mot de passe en fonction de son schéma pour le SignUp

module.exports = (req, res, next) => {
  if (passwordSchema.validate(req.body.password)) {
    next();
  } else {
    return (
      res.writeHead(
        400,
        "Votre mot de passe doit contenir entre 8 et 16 caractères et 2 chiffres"
      ),
      res.end(
        "Votre mot de passe doit contenir entre 8 et 16 caractères et 2 chiffres"
      )
    );
  }
};