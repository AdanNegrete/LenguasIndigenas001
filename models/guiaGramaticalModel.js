//En este documento tenemos el esquema y modelo de las guias gramaticales en nuestra base de datos. También se encuentran los middlewares que se ejecutarán en caso de que el usuario quiera realizar alguna acción con los datos de esta colección.

// Requerimos los modulos npm que utilizaremos en este documento
const mongoose = require("mongoose");
const slugify = require("slugify");

// Declaramos el esquema que van a seguir los documentos de nuestra colección de guiaGramatical
const guiaGramSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "Debes definir el nombre de la regla gramatical"],
      unique: true,
      trim: true, //trim elimina todos los espacios en blanco al inicio y final del string
    },
    slug: {
      type: String,
    },
    reglas: [String],
    lenguasApli: {
      type: String,
      trim: true,
      required: [true, "Debes definir en que lenguas aplican estas reglas"],
    },
    explicacion: {
      type: String,
      trim: true,
      required: [true, "Debes definir una explicacion del uso de estas reglas"],
    },
    casosUso: [String],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//Declaramos los index de nuestra colección
guiaGramSchema.index({ slug: 1 });

//Se creá un "slug" que se usará para identificar las paginas de los palabras en el buscador
guiaGramSchema.pre("save", function(next) {
  this.slug = slugify(this.nombre, { lower: true });
  next();
});

// Middleware que permite a los desarrolladores saber cuanto tiempo tomó realizar una busqueda en la base de datos
guiaGramSchema.pre(/^find/, function(next) {
  this.find({ availability: { $ne: false } });
  this.start = Date.now();
  next();
});

guiaGramSchema.post(/^find/, function(docs, next) {
  console.log(`Query took ${Date.now() - this.start} miliseconds`);
  next();
});

// Establece el modelo de las palabras con base en el esquema previamente definido
const GuiaGram = mongoose.model("GuiaGram", guiaGramSchema);

//Exportamos el modelo de las palabras
module.exports = GuiaGram;
