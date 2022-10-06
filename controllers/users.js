const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const EmailExistError = require('../errors/emailExistError');
const ValidationError = require('../errors/validationError');
const NotFoundError = require('../errors/notFoundError');

const SECRET_KEY = 'LMLJVJVVFDSKVJKDSFJV';

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => {
      res.send(users);
    })
    .catch(next);
};

module.exports.getUserMe = (req, res, next) => {
  User.findById(req.user._id)
    .then((userInfo) => {
      if (!userInfo) {
        throw new NotFoundError(`Пользователь по указанному ${req.user._id} не найден`);
      }
      return res.send(userInfo);
    })
    .catch((error) => {
      if (error.name === 'CastError') {
        next(new ValidationError('Передан некорректный id'));
      } else { next(error); }
    });
};

module.exports.getUser = (req, res, next) => {
  User.findById(req.params.userId)
    .then((userInfo) => {
      if (!userInfo) {
        throw new NotFoundError(`Пользователь по указанному ${req.params.userId} не найден`);
      }
      return res.send(userInfo);
    })
    .catch((error) => {
      if (error.name === 'CastError') {
        next(new ValidationError('Передан некорректный id'));
      } else { next(error); }
    });
};

module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => {
      User.create({
        name, about, avatar, email, password: hash,
      })
        .then((userInfo) => {
          res.send({
            _id: userInfo._id,
            name: userInfo.name,
            about: userInfo.about,
            avatar: userInfo.avatar,
            email: userInfo.email,
          });
        })
        .catch((err) => {
          if (err.name === 'ValidationError') {
            next(new ValidationError('Не правильно введены пароль или почта'));
          } else { next(err); }
          if (err.code === 11000) {
            next(new EmailExistError('данный email, уже зарегистрирован'));
          } else { next(err); }
        });
    });
};

module.exports.updateUser = (req, res, next) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, about }, { new: true, runValidators: true })
    .then((newUserInfo) => { res.send(newUserInfo); })
    .catch((error) => {
      if (error.name === 'ValidationError') {
        next(new ValidationError('Переданы некорректные данные при обновлении профиля'));
      } else { next(error); }
    });
};

module.exports.updateUserAvatar = (req, res, next) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(req.user._id, { avatar }, { new: true, runValidators: true })
    .then((newUserInfo) => { res.send(newUserInfo); })
    .catch((error) => {
      if (error.name === 'ValidationError') {
        next(new ValidationError('Переданы некорректные данные при обновлении аватара'));
      } else { next(error); }
    });
};

module.exports.loginUser = function (req, res, next) {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((userData) => {
      if (!userData) {
        throw new ValidationError('Неправильные почта или пароль');
      }
      const token = jwt.sign({ _id: userData._id }, SECRET_KEY, { expiresIn: '7d' });
      return res.status(200).cookie('jwt', token, {
        maxAge: 3600000 * 24 * 7,
        httpOnly: true,
      }).send({ jwt: token });
    })
    .catch((err) => {
      console.log(err);
      next(err);
    });
};
