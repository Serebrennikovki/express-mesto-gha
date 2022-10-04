module.exports = class ServerError extends Error {
  constructor() {
    super();
    this.statusCode = 500;
  }
};
