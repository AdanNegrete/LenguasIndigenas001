// En este documento se encontrarán todos los controladores requeridos para la edicion de documentos de documentos de la coleccion VideosPronun

// Requerimos los modulos que nosotros realizamos y que serán utilizados en este documento
const VideosPronun = require(`../models/videosPronunciacion`);
const factory = require("./handlerFactory");

// Controlador para obtener todos los documentos de la coleccion VideosPronun
exports.getAllVideosPronun = factory.getAll(VideosPronun);
// Controlador para obtener un documento específico de la coleccion VideosPronun
exports.getVideosPronun = factory.getOne(VideosPronun);
// Controlador para crear un nuevo documento de la coleccion VideosPronun
exports.createVideosPronun = factory.createOne(VideosPronun);
// Controlador para actualizar un documento de la coleccion VideosPronun
exports.updateVideosPronun = factory.updateOne(VideosPronun);
// Controlador para eliminar un documento de la coleccion VideosPronun
exports.deleteVideosPronun = factory.deleteOne(VideosPronun);
