const Card = require('../models/card');
const NoRightsError = require('../errors/noRightsError');
const ValidationError = require('../errors/validationError');
const NotFoundError = require('../errors/notFoundError');

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send(cards))
    .catch(next);
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.send({ card }))
    .catch((error) => {
      if (error.name === 'ValidationError') {
        next(new ValidationError('Переданы некорректные данные при создании карточки'));
      } else {
        next(error);
      }
    });
};

module.exports.likeCard = (req, res, next) => Card.findByIdAndUpdate(
  req.params.cardId,
  { $addToSet: { likes: req.user._id } },
  { new: true },
)
  .then((newCard) => {
    if (!newCard) {
      next(new NotFoundError(`Карточка с указанным ${req.params.cardId} не найдена.`));
    }
    return res.send(newCard);
  })
  .catch((error) => {
    if (error.name === 'CastError') {
      next(new ValidationError('Передан некорректный id карточки'));
    } else {
      next(error);
    }
  });

module.exports.dislikeCard = (req, res, next) => Card.findByIdAndUpdate(
  req.params.cardId,
  { $pull: { likes: req.user._id } },
  { new: true },
)
  .then((newCard) => {
    if (!newCard) {
      throw new NotFoundError(`Карточка с указанным ${req.params.cardId} не найдена.`);
    } else {
      res.send(newCard);
    }
  })
  .catch((error) => {
    if (error.name === 'CastError') {
      next(new NotFoundError('Передан некорректный id карточки'));
    } else {
      next(error);
    }
  });

module.exports.deleteCard = (req, res, next) => {
  Card.findById(req.params.cardId)
    .then((card) => {
      if (!card) {
        next(new NotFoundError(`Карточка с указанным ${req.params.cardId} не найдена.`));
      }
      if (req.user._id !== card.owner.toString()) {
        next(new NoRightsError(`Карточка с указанным ${req.params.cardId} не может быть удалена. Нет прав.`));
      }
      return Card.findByIdAndRemove(req.params.cardId)
        .then((deleteCard) => res.send(deleteCard))
        .catch((error) => {
          if (error.name === 'CastError') {
            next(new ValidationError('Передан некорректный id карточки'));
          }
          next(error);
        });
    })
    .catch((error) => {
      if (error.name === 'CastError') {
        next(new ValidationError('Передан некорректный id карточки'));
      } else {
        next(error);
      }
    });
};
