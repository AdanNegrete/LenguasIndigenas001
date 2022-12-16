//En este documento se encuentran todos los manejadores de ruta de videos de pronunciacion

// Requerimos los modulos npm que utilizaremos en este documento
const express = require("express");
// Requerimos los modulos que nosotros realizamos y que serán utilizados en este documento
const videosPronunController = require("../controllers/videosPronunciacionController");
const authController = require("../controllers/authController");

// Creamos el router en express.
const router = express.Router();

//Ruta para obtener todos los documentos, y para crear un nuevo documento (Solo usuarios admin y editor)
router
  .route("/")
  .get(videosPronunController.getAllVideosPronun)
  .post(
    authController.protect,
    authController.restrictTo("admin", "editor"),
    videosPronunController.createVideosPronun
  );
//Ruta para obtener, actualizar o eliminar un documento mediante su id (Solo usuarios admin y editor pueden actualizar o editar)
router
  .route("/:id")
  .get(videosPronunController.getVideosPronun)
  .patch(
    authController.protect,
    authController.restrictTo("admin", "editor"),
    videosPronunController.updateVideosPronun
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin", "editor"),
    videosPronunController.deleteVideosPronun
  );

module.exports = router;
