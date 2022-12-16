//En este documento tenemos el esquema y modelo de las palabras en nuestra base de datos. También se encuentran los middlewares que se ejecutarán en caso de que el usuario quiera realizar alguna acción con los datos de esta colección.

// Requerimos los modulos npm que utilizaremos en este documento
const mongoose = require("mongoose");
const slugify = require("slugify");

// Declaramos el esquema que van a seguir los documentos de nuestra colección de palabras
const diccionarioSchema = new mongoose.Schema(
  {
    palabra: {
      type: String,
      required: [true, "Debes definir la palabra"],
      unique: true,
      trim: true, //trim elimina todos los espacios en blanco al inicio y final del string
    },
    slug: {
      type: String,
    },
    origen: {
      type: String,
      required: [
        true,
        "Debes asignarle un origen (lengua) a la palabra que deseas crear",
      ],
      trim: true,
    },
    definicion: {
      type: String,
      trim: true,
      required: [true, "La palabra debe tener un significado/definicion"],
    },
    tipo: {
      type: String,
      enum: ["verbo", "sustantivo", "adjetivo", "adverbio", "otro"],
      default: "otro",
    },
    traduccionEspanol: {
      type: String,
      trim: true,
      required: [true, "Define el significado en español de la palabra"],
    },
    fonetica: {
      type: String,
      trim: true,
      default: "Por definir",
    },
    linkAudio: {
      type: String,
      trim: true,
      default: "Por definir",
    },
    linkVideo: {
      type: String,
      trim: true,
      default: "Por definir",
    },
    ejemplosUso: [String],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//Declaramos los index de nuestra colección
//diccionarioSchema.index({ slug: 1 });

//Se creá un "slug" que se usará para identificar las paginas de los palabras en el buscador
diccionarioSchema.pre("save", function(next) {
  this.slug = slugify(this.palabra, { lower: true });
  next();
});

// Middleware que permite a los desarrolladores saber cuanto tiempo tomó realizar una busqueda en la base de datos
diccionarioSchema.pre(/^find/, function(next) {
  this.find({ availability: { $ne: false } });
  this.start = Date.now();
  next();
});

diccionarioSchema.post(/^find/, function(docs, next) {
  console.log(`Query took ${Date.now() - this.start} miliseconds`);
  next();
});

// Establece el modelo de las palabras con base en el esquema previamente definido
const Diccionario = mongoose.model("Diccionario", diccionarioSchema);

//Exportamos el modelo de las palabras
module.exports = Diccionario;
