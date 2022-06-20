const Sauce = require('../models/Sauce');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    likes: 0,
    dislikes: 0,
    usersLiked: "",
    usersDisliked:"",
  });
  sauce.save()
    .then(() => res.status(201).json({ message: 'enregistré!'}))
    .catch(error => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({
    _id: req.params.id
    }).then(
        (sauce) => {
            res.status(200).json(sauce);
        }
    ).catch(
        (error) => {
            res.status(404).json({
                error: error
            });
        }
    );
};


exports.modifySauce = (req, res, next) => {
  // suprimer l'ancienne image si on la modifie
  if (req.file)
    {     
      Sauce.findOne({ _id: req.params.id })
      .then(sauce => {
        const filename = sauce.imageUrl.split('/images/')[1];
        exists(`images/${filename}`, (exist) => {
          if(exist) fs.unlink(`images/${filename}`,() => {})
        });        
      })
      .catch(error => res.status(500).json({ error }));
  }
  
  const sauceObject = req.file ?
  {
    ...JSON.parse(req.body.sauce),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`

  } :
  { ...req.body };
  Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Objet modifié !'}))
    .catch(error => res.status(400).json({ error }));     
};


exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      
      if (!sauce) {
        res.status(404).json({
          error: new Error('aucune sauce!')
        });
      }
      if (sauce.userId !== req.auth.userId) {
        res.status(400).json({
          error: new Error('requéte non autorisé!')
        });
      }

      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Objet supprimé !'}))
          .catch(error => res.status(400).json({ error }));
      });
    })
    .catch(error => res.status(500).json({ error }));
};

exports.getAllSauce = (req, res, next) => {
  Sauce.find().then(
    (sauces) => {
      res.status(200).json(sauces);
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};

exports.likeSauce = (req, res, next) => {
  
  Sauce.findOne({ _id: req.params.id })
  .then(sauce => {
    switch (req.body.like) {
      //Si l'utilisateur dislike : 
      case -1:
          Sauce.updateOne({ _id: req.params.id }, {
              $inc: { dislikes: 1 },
              $push: { usersDisliked: req.body.userId },
              _id: req.params.id
          })
              .then(() => res.status(201).json({ message: 'Dislike pris en compte !' }))
              .catch(error => res.status(400).json({ error }))
          break;

      //Si like ou dislike ! de 0, on retire le like / dislike'
      case 0:
          //Si la sauce est déjà liké :
          if (sauce.usersLiked.find(user => user === req.body.userId)) {
              Sauce.updateOne({ _id: req.params.id }, {
                  $inc: { likes: -1 },
                  $pull: { usersLiked: req.body.userId },
                  _id: req.params.id
              })
                  .then(() => res.status(201).json({ message: ' Avis mis à jour !' }))
                  .catch(error => res.status(400).json({ error }))
          }

          //Si la sauce est déjà disliké :
          if (sauce.usersDisliked.find(user => user === req.body.userId)) {
              Sauce.updateOne({ _id: req.params.id }, {
                  $inc: { dislikes: -1 },
                  $pull: { usersDisliked: req.body.userId },
                  _id: req.params.id
              })
                  .then(() => res.status(201).json({ message: ' Avis mis à jour !' }))
                  .catch(error => res.status(400).json({ error }));
          }
          break;

      //Si l'utilisateur like la sauce, +1 :
      case 1:
          Sauce.updateOne({ _id: req.params.id }, {
              $inc: { likes: 1 },
              $push: { usersLiked: req.body.userId },
              _id: req.params.id
          })
              .then(() => res.status(201).json({ message: 'Like pris en compte !' }))
              .catch(error => res.status(400).json({ error }));
          break;
      default:
          return res.status(500).json({ error });
    }
    
  })
  .catch(error => res.status(500).json({ error }));  
}; 