//En este documento se encuentran todos los manejadores de ruta de los usuarios

// Requerimos los modulos npm que utilizaremos en este documento
const express = require('express');
// Requerimos los modulos que nosotros realizamos y que serán utilizados en este documento
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

// Creamos el router en express.
const router = express.Router();

// Establecemos los manejadores de ruta para dar de alta, ingresar, solicitar una nueva contraseña y reestabler contraseña.
// La ruta se establece unicamente en post (o patch) ya que no tiene sentido usar otro metodo http para ejectutar estas acciones.
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// Proteje todas las rutas que se encuentran detras de esta linea de codigo limitando su acceso a solamente las personas que se encuentran dadas de alta en nuestra base de datos
router.use(authController.protect);

// Rutas para que el propio usuario pueda editar su información.
router.patch('/updateMyPassword', authController.updatePassword);
router.get('/me', userController.getMe, userController.getUser);
router.patch(
  '/updateMe',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);
router.delete('/deleteMe', userController.deleteMe);

// A las siguientes rutas solo tienen acceso los usuarios administradores, para limitar eso usamos retrictTo
router.use(authController.restrictTo('admin'));

// Establecemos los manejadores de ruta para las reseñas con ruta '/'.
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
// Establecemos los manejadores de ruta para las reseñas con ruta '/:id'.
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

// Exportamos el router creado para usarlo en nuestra app
module.exports = router;
