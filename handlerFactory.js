// Este documento contiene todas las funciones para manipular información/documentos en nuestra base de datos
// Requerimos los modulos que nosotros realizamos y que serán utilizados en este documento
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

// Función para eliminar un documento de nuestra base de datos
exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(
        new AppError('No se encontró ningún documento con ese ID', 404)
      );
    }

    res.status(204).json({
      //Codigo 204 para "No content"
      status: 'success',
      data: null
    });
  });

// Función para actualizar un documento de nuestra base de datos
exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!doc) {
      return next(
        new AppError('No se encontró ningún documento con ese ID', 404)
      );
    }

    res.status(202).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

// Función para crear un documento en nuestra base de datos
exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        data: newDoc
      }
    });
  });

// Función para buscar un documento de nuestra base de datos
exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOptions) query = query.populate(populateOptions);
    const doc = await query;

    if (!doc) {
      return next(
        new AppError('No se encontró ningún documento con ese ID', 404)
      );
    }

    res.status(200).json({
      status: 'success',
      data: { doc }
    });
  });

// Función para obtener todos los documentos de una colección de nuestra base de datos
exports.getAll = Model =>
  catchAsync(async (req, res, next) => {
    //To allow for nested GET reviews on product
    let filter = {};
    if (req.params.product) filter = { touproduct: req.params.product };

    // Execute query
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    //const doc = await features.query.explain();
    const doc = await features.query;

    //Send response
    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: { data: doc }
    });
  });
