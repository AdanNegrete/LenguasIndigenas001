// En este documento se encontrarán todos los controladores requeridos para la edicion de documentos de documentos de la coleccion lecturas

// Requerimos los modulos que nosotros realizamos y que serán utilizados en este documento
const Lecturas = require(`../models/lecturasModel`);
const factory = require("./handlerFactory");

// Controlador para obtener todos los documentos de la coleccion Lecturas
exports.getAllLecturas = factory.getAll(Lecturas);
// Controlador para obtener un documento específico de la coleccion Lecturas
exports.getLecturas = factory.getOne(Lecturas);
// Controlador para crear un nuevo documento de la coleccion Lecturas
exports.createLecturas = factory.createOne(Lecturas);
// Controlador para actualizar un documento de la coleccion Lecturas
exports.updateLecturas = factory.updateOne(Lecturas);
// Controlador para eliminar un documento de la coleccion Lecturas
exports.deleteLecturas = factory.deleteOne(Lecturas);
