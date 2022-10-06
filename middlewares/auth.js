const jwt = require('jsonwebtoken');
const UnAuthorizedError = require('../errors/unAuthorizedError');

const SECRET_KEY = 'LMLJVJVVFDSKVJKDSFJV';

module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new UnAuthorizedError('необходимо авторизоваться');
  }
  const token = authorization.replace('Bearer ', '');
  let payload;
  try {
    payload = jwt.verify(token, SECRET_KEY);
  } catch (err) {
    next(new UnAuthorizedError('необходимо авторизоваться'));
  }
  req.user = payload;
  next();
  return false;
};
