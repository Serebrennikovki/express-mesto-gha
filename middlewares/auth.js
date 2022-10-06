const jwt = require('jsonwebtoken');
const UnAuthorizedError = require('../errors/unAuthorizedError');

const SECRET_KEY = 'LMLJVJVVFDSKVJKDSFJV';

module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next(new UnAuthorizedError('Необходимо авторизоваться'));
  }
  const token = authorization.replace('Bearer ', '');
  let payload;
  try {
    payload = jwt.verify(token, SECRET_KEY);
  } catch (err) {
    next(new UnAuthorizedError('Необходимо авторизоваться'));
  }
  req.user = payload;
  next();
  return false;
};
