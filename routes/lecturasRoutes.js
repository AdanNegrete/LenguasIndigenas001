//En este documento se encuentran todos los manejadores de ruta de lecturas

// Requerimos los modulos npm que utilizaremos en este documento
const express = require("express");
// Requerimos los modulos que nosotros realizamos y que serán utilizados en este documento
const lecturasController = require("../controllers/lecturasController");
const authController = require("../controllers/authController");

// Creamos el router en express.
const router = express.Router();

//Ruta para obtener todos los documentos, y para crear un nuevo documento (Solo usuarios admin y editor)
router
  .route("/")
  .get(lecturasController.getAllLecturas)
  .post(
    authController.protect,
    authController.restrictTo("admin", "editor"),
    lecturasController.createLecturas
  );
//Ruta para obtener, actualizar o eliminar un documento mediante su id (Solo usuarios admin y editor pueden actualizar o editar)
router
  .route("/:id")
  .get(lecturasController.getLecturas)
  .patch(
    authController.protect,
    authController.restrictTo("admin", "editor"),
    lecturasController.updateLecturas
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin", "editor"),
    lecturasController.deleteLecturas
  );

module.exports = router;
