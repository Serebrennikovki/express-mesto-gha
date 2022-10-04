module.exports = class unAuthorizedError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 401;
  }
};
