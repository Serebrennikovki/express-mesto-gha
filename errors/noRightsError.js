module.exports = class NoRightsError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 403;
  }
};
