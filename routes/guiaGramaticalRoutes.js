//En este documento se encuentran todos los manejadores de ruta de las guias

// Requerimos los modulos npm que utilizaremos en este documento
const express = require("express");
// Requerimos los modulos que nosotros realizamos y que serán utilizados en este documento
const guiaGramController = require("../controllers/guiaGramaticalController");
const authController = require("../controllers/authController");

// Creamos el router en express.
const router = express.Router();

//Ruta para obtener todos las guias, y para crear un nuevo producto(Solo usuarios admin y editor)
router
  .route("/")
  .get(guiaGramController.getAllGuiaGram)
  .post(
    authController.protect,
    authController.restrictTo("admin", "editor"),
    guiaGramController.createGuiaGram
  );
//Ruta para obtener, actualizar o eliminar un producto mediante su id (Solo usuarios admin y editor pueden actualizar o editar)
router
  .route("/:id")
  .get(guiaGramController.getGuiaGram)
  .patch(
    authController.protect,
    authController.restrictTo("admin", "editor"),
    guiaGramController.updateGuiaGram
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin", "editor"),
    guiaGramController.deleteGuiaGram
  );

module.exports = router;
