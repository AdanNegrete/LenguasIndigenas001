// En este documento se encontrarán todos los controladores requeridos para la manipulación de documentos de nuestra base de datos en la coleccion de reseñas

// Requerimos los modulos que nosotros realizamos y que serán utilizados en este documento
const GuiaGram = require("../models/guiaGramaticalModel");
const factory = require("./handlerFactory");

// Controlador para obtener todos los documentos de la coleccion GuiaGram
exports.getAllGuiaGram = factory.getAll(GuiaGram);

// Controlador para obtener un documento específico de la coleccion GuiaGram
exports.getGuiaGram = factory.getOne(GuiaGram);

// Controlador para crear un nuevo documento de la coleccion GuiaGram
exports.createGuiaGram = factory.createOne(GuiaGram);

// Controlador para actualizar un documento de la coleccion GuiaGram
exports.updateGuiaGram = factory.updateOne(GuiaGram);

// Controlador para eliminar un documento de la coleccion GuiaGram
exports.deleteGuiaGram = factory.deleteOne(GuiaGram);
