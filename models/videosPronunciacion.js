//En este documento tenemos el esquema y modelo de los videos de pronunciacion en nuestra base de datos. También se encuentran los middlewares que se ejecutarán en caso de que el usuario quiera realizar alguna acción con los datos de esta colección.

// Requerimos los modulos npm que utilizaremos en este documento
const mongoose = require("mongoose");
const slugify = require("slugify");

// Declaramos el esquema que van a seguir los documentos de nuestra colección de videos de pronunciacion
const videosPronunSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: [true, "Debes definir el titulo del video"],
      unique: true,
      trim: true, //trim elimina todos los espacios en blanco al inicio y final del string
    },
    slug: {
      type: String,
    },
    lengua: {
      type: String,
      enum: ["náhuatl", "otomí", "maya", "mixteco", "otro"],
      default: "otro",
    },
    linkVideo: {
      type: String,
      trim: true,
      required: [true, "Debes asignar el link del video"],
    },
    transcripcion: {
      type: String,
      trim: true,
    },
    duracionMinutos: {
      type: Number,
      required: [true, "Debes asignar la duracion del video en minutos"],
    },
    fechaPublicacion: {
      type: Date,
      required: [true, "Debes definir la fecha de publicacion del video"],
    },
    fechaActualizacion: {
      type: Date,
      default: this.fechaPublicacion,
    },
    autor: {
      type: String,
      required: [true, "Debes definir el nombre del autor del video"],
      trim: true,
    },
    linkAudio: {
      type: String,
      trim: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//Declaramos los index de nuestra colección
videosPronunSchema.index({ slug: 1 });

//Se creá un "slug" que se usará para identificar las paginas de los palabras en el buscador
videosPronunSchema.pre("save", function(next) {
  this.slug = slugify(this.titulo, { lower: true });
  next();
});

// Middleware que permite a los desarrolladores saber cuanto tiempo tomó realizar una busqueda en la base de datos
videosPronunSchema.pre(/^find/, function(next) {
  this.find({ availability: { $ne: false } });
  this.start = Date.now();
  next();
});

videosPronunSchema.post(/^find/, function(docs, next) {
  console.log(`Query took ${Date.now() - this.start} miliseconds`);
  next();
});

// Establece el modelo de los videos de pronunciacion con base en el esquema previamente definido
const VideosPronun = mongoose.model("VideosPronun", videosPronunSchema);

//Exportamos el modelo de los videos de pronunciacion
module.exports = VideosPronun;
