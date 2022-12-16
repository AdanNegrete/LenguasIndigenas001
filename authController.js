/* eslint-disable node/no-unsupported-features/node-builtins */
// En este documento se encontrarán todos los controladores requeridos para la autorización y autenticación de usuarios

// Requerimos los modulos npm que utilizaremos en este documento
const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
// Requerimos los modulos que nosotros realizamos y que serán utilizados en este documento
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

// Funcion para crear el JWT (JSON Web Token)
// eslint-disable-next-line arrow-body-style
const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

//Función para enviar token (JWT) al usuario
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true; //Con esto la coockie solo se enviera en una conexion HTTPS

  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token
  });
};

// Controlador para dar de alta un nuevo usuario
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role
  });

  const url = `${req.protocol}://${req.get('host')}/me`;

  await new Email(newUser, url).sendWelcome();

  createSendToken(newUser, 201, res);
});

// Controlador para ingresar con un usuario ya existente
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(
      new AppError('Por favor ingresa un correo electrónico y contraseña.', 400)
    );
  }

  const user = await User.findOne({ email: email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Correo y/o contraseña incorrectos.'), 401);
  }

  createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ status: 'success' });
};

// Controlador para la autenticación de usuario.
exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError(
        `No haz ingresado a tu cuenta! Por favor accede con tu cuenta, o bien crea una nueva para tener acceso.`,
        401
      )
    );
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('El usuario al que le pertenece este token no existe.', 401)
    );
  }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    next(
      new AppError(
        'El usuario cambió recientemente su contraseña! Por favor vuelve a ingresar.',
        401
      )
    );
  }

  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

//Controlador solo para paginas renderizadas con el que se verifica si el usuario ingresó con su cuenta
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

// Controlador para la autorización de usuarios para acceder a contenidos restringidos dependiendo del rol asignado
// eslint-disable-next-line arrow-body-style
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //roles ['admin', 'lead-guide'].
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('No tienes permiso para realizar esta acción.', 403)
      );
    }
    next();
  };
};

// Controlador para mandar e-mail que contiene Token para reestablecer la contraseña en caso de que haya sido olvidada
exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new AppError('No existe usuario con este correo electrónico.', 404)
    );
  }

  //2) Generate random resettoken
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  //3) send it to user's email
  try {
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/resetPassword/${resetToken}`;
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token enviado al correo electrónico'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'A ocurrido un error al enviar el correo. Intenta de nuevo en unos momentos!',
        500
      )
    );
  }
});

// Controlador para reestablecer la contraseña de un usuario usando el token enviado mediante correo electronico
exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    return next(new AppError('Token inválido o expirado.', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  createSendToken(user, 200, res);
});

// Controlador para que el usuario loggeado pueda actualizar su propia contraseña
exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('password');

  if (!user.correctPassword(req.body.passwordCurrent, user.password)) {
    return next(new AppError('Contraseña actual incorrecta', 401));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  createSendToken(user, 200, res);
});
