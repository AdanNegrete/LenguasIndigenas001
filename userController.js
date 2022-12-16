// En este documento se encontrarán todos los controladores requeridos para la manipulación de documentos de nuestra base de datos en la coleccion de Usuarios
// Requerimos los modulos npm que utilizaremos en este documento
const multer = require('multer');
const sharp = require('sharp');
// Requerimos los modulos que nosotros realizamos y que serán utilizados en este documento
const User = require(`./../models/userModel`);
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

//Almacenamos la foto en la memoria temporal
const multerStorage = multer.memoryStorage();
//Filtramos los archivos recibidos por el cliente para que solo se puedan recibir archivos de imagenes
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadUserPhoto = upload.single('photo');
// Ajustamos el tamaño de la foto y la almacenamos en el File System
exports.resizeUserPhoto = (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
};

//Con esta funcion podemos filtrar lo datos que el propio usuario no puede editar
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// Controlador para que el usuario loggeado pueda actualizar sus propios datos
exports.updateMe = async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.'
      )
    );
  }

  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
};

// Controlador para que el usuario loggeado pueda eliminar sus propios datos
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Controlador para que el usuario loggeado pueda obtener sus propios datos
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

//Controlador en caso de que el cliente intente acceder a la ruta "crear usuario"
exports.createUser = (req, res) => {
  res.status(500).json({
    //500 - Internal server error
    status: 'error',
    message: 'This route is not defined! Please use /signup insted'
  });
};

// Controlador para obtener todos los documentos de la coleccion Usuarios
exports.getAllUsers = factory.getAll(User);

//En este caso no existe el controlador de crear usuario, ya que eso se hace a traves de "Dar de alta (sign up)" en el documento con los controladores de autorizacion y autenticación

// Controlador para obtener un documento específico de la coleccion Usuarios
exports.getUser = factory.getOne(User);

// Controlador para actualizar un documento de la coleccion Usuarios
// Do NOT update passwords with this.
exports.updateUser = factory.updateOne(User);

// Controlador para eliminar un documento de la coleccion Usuarios
exports.deleteUser = factory.deleteOne(User);
