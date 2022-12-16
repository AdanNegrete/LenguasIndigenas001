// En este documento se encuentra una función que nos permite construir nuestro codigo de error, establecer su mensaje y declarlo como operacional

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    //StackTrace muestra donde ocurrió el error en nuestro programa
    Error.captureStackTrace(this, this.constructor);
  }
}

// Exportamos la clase para poder hacer uso de ella
module.exports = AppError;
