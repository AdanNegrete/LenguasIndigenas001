//Esta funcion nos permite atrapar posibles errores que ocurran en nuestro codigo asincrono de JavaScript
module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
