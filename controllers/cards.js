const Card = require('../models/card');
const { ERROR_CODE_VALIDATION, ERROR_CODE_AVAILABILITY, ERROR_CODE_DEFAULT } = require('../utils/error-code');

module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send(cards))
    .catch(() => { res.status(ERROR_CODE_DEFAULT).send({ message: 'Упс. Что-то пошло нет.' }); });
};

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.send({ card }))
    .catch((error) => {
      if (error.name === 'ValidationError') {
        res.status(ERROR_CODE_VALIDATION).send({ message: 'Переданы некорректные данные при создании карточки' });
      } else {
        res.status(ERROR_CODE_DEFAULT).send({ message: 'Упс. Что-то пошло нет.' });
      }
    });
};

module.exports.likeCard = (req, res) => Card.findByIdAndUpdate(
  req.params.cardId,
  { $addToSet: { likes: req.user._id } },
  { new: true },
)
  .then((newCard) => {
    if (newCard) {
      return res.send(newCard);
    }
    return res.status(ERROR_CODE_AVAILABILITY).send({ message: `Карточка с указанным ${req.params.cardId} не найдена.` });
  })
  .catch((error) => {
    if (error.name === 'CastError') {
      res.status(ERROR_CODE_VALIDATION).send({ message: 'Передан некорректный id карточки' });
    } else {
      res.status(ERROR_CODE_DEFAULT).send({ message: 'Упс. Что-то пошло нет.' });
    }
  });

module.exports.dislikeCard = (req, res) => Card.findByIdAndUpdate(
  req.params.cardId,
  { $pull: { likes: req.user._id } },
  { new: true },
)
  .then((newCard) => {
    if (newCard) {
      res.send(newCard);
    } else {
      res.status(ERROR_CODE_AVAILABILITY).send({ message: `Карточка с указанным ${req.params.cardId} не найдена.` });
    }
  })
  .catch((error) => {
    if (error.name === 'CastError') {
      res.status(ERROR_CODE_VALIDATION).send({ message: 'Передан некорректный id карточки' });
    } else {
      res.status(ERROR_CODE_DEFAULT).send({ message: 'Упс. Что-то пошло нет.' });
    }
  });

module.exports.deleteCard = (req, res) => Card.findByIdAndRemove(req.params.cardId)
  .then((deleteCard) => {
    if (deleteCard) {
      res.send(deleteCard);
    } else {
      res.status(ERROR_CODE_AVAILABILITY).send({ message: `Карточка с указанным ${req.params.cardId} не найдена.` });
    }
  })
  .catch((error) => {
    if (error.name === 'CastError') {
      res.status(ERROR_CODE_VALIDATION).send({ message: 'Передан некорректный id карточки' });
    } else {
      res.status(ERROR_CODE_DEFAULT).send({ message: 'Упс. Что-то пошло нет.' });
    }
  });
