// En este documento se encontrarán todos los controladores requeridos para la edicion de documentos de documentos de la coleccion diccionario

// Requerimos los modulos que nosotros realizamos y que serán utilizados en este documento
const Diccionario = require(`../models/diccionarioModel`);
const factory = require("./handlerFactory");

// Controlador para obtener todos los documentos de la coleccion Diccionario
exports.getAllDiccionario = factory.getAll(Diccionario);
// Controlador para obtener un documento específico de la coleccion Diccionario
exports.getDiccionario = factory.getOne(Diccionario);
// Controlador para crear un nuevo documento de la coleccion Diccionario
exports.createDiccionario = factory.createOne(Diccionario);
// Controlador para actualizar un documento de la coleccion Diccionario
exports.updateDiccionario = factory.updateOne(Diccionario);
// Controlador para eliminar un documento de la coleccion Diccionario
exports.deleteDiccionario = factory.deleteOne(Diccionario);
