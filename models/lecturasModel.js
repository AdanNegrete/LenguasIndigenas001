//En este documento tenemos el esquema y modelo de las lecturas en nuestra base de datos. También se encuentran los middlewares que se ejecutarán en caso de que el usuario quiera realizar alguna acción con los datos de esta colección.

// Requerimos los modulos npm que utilizaremos en este documento
const mongoose = require("mongoose");
const slugify = require("slugify");

// Declaramos el esquema que van a seguir los documentos de nuestra colección de lecturas
const lecturasSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: [true, "Debes definir el titulo de la lectura"],
      unique: true,
      trim: true, //trim elimina todos los espacios en blanco al inicio y final del string
    },
    slug: {
      type: String,
    },
    autor: {
      type: String,
      default: "Anonimo",
      trim: true,
    },
    lengua: {
      type: String,
      enum: ["náhuatl", "otomí", "maya", "mixteco", "otro"],
      default: "otro",
    },
    fechaOrigen: {
      type: String, // String debido a que Date solo es a partir de 1970
      default: "Desconocida",
      trim: true,
    },
    textoOriginal: {
      type: String,
      trim: true,
      required: [true, "Debes escribir la lectura que deseas agregar"],
    },
    traduccionEspanol: {
      type: String,
      trim: true,
      required: [true, "Debes escribir la traduccion del texto al español"],
    },
    imagenRelacionada: {
      type: String,
    },
    narraciónVoz: {
      type: String,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//Declaramos los index de nuestra colección
lecturasSchema.index({ slug: 1 });

//Se creá un "slug" que se usará para identificar las paginas de los palabras en el buscador
lecturasSchema.pre("save", function(next) {
  this.slug = slugify(this.titulo, { lower: true });
  next();
});

// Middleware que permite a los desarrolladores saber cuanto tiempo tomó realizar una busqueda en la base de datos
lecturasSchema.pre(/^find/, function(next) {
  this.find({ availability: { $ne: false } });
  this.start = Date.now();
  next();
});

lecturasSchema.post(/^find/, function(docs, next) {
  console.log(`Query took ${Date.now() - this.start} miliseconds`);
  next();
});

// Establece el modelo de las lecturas con base en el esquema previamente definido
const Lecturas = mongoose.model("Lecturas", lecturasSchema);

//Exportamos el modelo de las lecturas
module.exports = Lecturas;
