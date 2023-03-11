const Sauce = require('../models/Sauce')
const fs = require('node:fs')

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: []
    });
    sauce.save()
        .then(() => { res.status(201).json({ message: 'Objet enregistré !' }) })
        .catch(error => { res.status(400).json({ error }) })
};


exports.getSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }));


}
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({ error }));
}

exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message: 'Not authorized' });
            } else {
                Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Objet modifié!' }))
                    .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};

exports.usersLiked = (req, res, next) => {
    const like = req.body.like // si like = 1, si dislike = -1, si on enlève = 0 (body)
    const userId = req.body.userId
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            if (like === 1) {
                sauce.likes++
                sauce.usersLiked.push(userId)
            } else if (like === -1) {
                sauce.dislikes++
                sauce.usersDisliked.push(userId)
            } else {
                let indexToDelete = sauce.usersLiked.findIndex((id) => id === userId)
                if (indexToDelete >= 0) {
                    sauce.usersLiked.splice(indexToDelete, 1)
                    sauce.likes--
                } else {
                    indexToDelete = sauce.usersDisliked.findIndex((id) => id === userId)
                    sauce.usersDisliked.splice(indexToDelete, 1)
                    sauce.dislikes--
                }
            }
            sauce.save()
                .then(() => { res.status(200).json({ message: 'Objet modifié !' }) })
                .catch(error => { res.status(400).json({ error }) })
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
}
exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message: 'Not authorized' });
            } else {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Sauce.deleteOne({ _id: req.params.id })
                        .then(() => { res.status(200).json({ message: 'Objet supprimé !' }) })
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch(error => {
            res.status(500).json({ error });
        });
};