//En este documento se encuentran los controladores que nos a permitir mostrar al usuario los errores que se presenten

// Lo errores operacionales son aquellos problemas que podemos predecir que en algún  momento van a ocurrir (Por ejemplo: Tratar de ingresar a una ruta que no esta declarada, Tratar de ingresar elementos duplicados a la base de datos, No cumplir con todos los campos obligatorios solicitados al momento de darse de alta, etc...)

// Los errores de Programación son aquellos que los desarrolladores ingresamos en nuestro codigo y tienen que ser solucionados para un correcto funcionamiento de nuestra aplicaión

// Requerimos los modulos que nosotros realizamos yt serán utilizados en este documento
const AppError = require('../utils/appError');

// Función que establece los errores de busquedas invalidas en la base de datos como errores operacionales
const handleCastErrorDB = err => {
  const message = `Invalido ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

// Función que establece los errores por intentar ingresar elementos duplicados en la base de datos como errores operacionales
const handleDuplicateFieldsDB = err => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/);
  const message = `Valor duplicado: ${value}. Por favor ingresa un nuevo valor `;
  return new AppError(message, 400);
};

// Función que establece los errores de validacion en la base de datos como errores operacionales
const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Datos ingresados invalidos ${errors.join('. ')}`;
  return new AppError(message, 400);
};

// Función que establece un token invalido como error operacional
const handleJWTError = () =>
  new AppError('Token inválido. Por favor ingresa de nuevo.', 401);

// Función que establece un token expirado como error operacional
const handleJWTExpiredError = () =>
  new AppError('Token expirado. Por favor ingresa de nuevo.');

// Formato en el que será enviado el error si nos encontramos en el entorno de node de desarrollo
const sendErrorDev = (err, req, res) => {
  //API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
    //SITIO WEB RENDERIZADO
  }
  console.error('Error 💥', err);
  return res.status(err.statusCode).render('error', {
    title: 'Algo salio mal!',
    msg: err.message
  });
};

// Formato en el que será enviado el error si nos encontramos en el entorno de node de producción
const sendErrorProd = (err, req, res) => {
  //API
  if (req.originalUrl.startsWith('/api')) {
    // Operational, trusted error: send message to the client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });

      // Programming or other unkonw error: don't leak error details
    }
    // 1) Log the error
    console.error('Error 💥', err);
    // 2) Send generic message
    return res.status(500).json({
      status: 'error',
      message: 'Algo salió muy mal'
    });
  }
  // SITIO WEB RENDERIZADO
  // Operational, trusted error: send message to the client
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Algo salio mal!',
      msg: err.message
    });

    // Programming or other unkonw error: don't leak error details
  }
  // 1) Log the error
  console.error('Error 💥', err);

  // 2) Send generic message
  return res.status(err.statusCode).render('error', {
    title: 'Algo salio mal!',
    msg: 'Por favor intenta de nuevo mas tarde'
  });
};

//Función que manda el error al cliente dependiendo del tipo de error, el entorno de desarrollo y si es un error operacional o de programación
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } /*if (process.enc.NODE_ENV === 'production')*/ else {
    let error = Object.create(err);
    error.message = err.message;

    if (err.name === 'CastError') error = handleCastErrorDB(err);
    if (err.code === 11000) error = handleDuplicateFieldsDB(err);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};
