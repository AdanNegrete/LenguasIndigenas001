//En este documento tenemos el esquema y modelo de los usuarios en nuestra base de datos. También se encuentran los middlewares que se ejecutarán en caso de que el cliente desee realizar una accion con los documentos de esta colección

// Requerimos los modulos npm que utilizaremos en este documento
const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

// Declaramos el esquema que van a seguir los documentos de nuestra colección de usuarios
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Por favor dinos tu nombre!"],
  },
  email: {
    type: String,
    required: [true, "Por favor proporcionanos tu email!"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Por favor proporcionanos tu email!"],
  },
  photo: { type: String, default: "default.jpg" },
  role: {
    type: String,
    enum: ["usuario", "editor", "admin"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "Por favor establece una contraseña"],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Por favor confirma tu contraseña"],
    validate: {
      //This only works on Create or Save!!!
      validator: function (el) {
        return el === this.password;
      },
      message: "Las contraseñas no coinciden",
    },
  },
  passwordChangedAt: {
    type: Date,
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

//Middleware previo a la consulta de algun documento mediante el cual filtrarenos los usuarios que definimos como inactivos
userSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

//Middleware previo a guardar algun documento mediante el cual
userSchema.pre("save", async function (next) {
  //Only run this function is password was actually modified
  if (!this.isModified("password")) return next();
  //Hash (encripta) the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  //Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

//Middleware previo a guardar algun documento mediante el cual establecemos la fecha en la cual se modificó la contraseña por ultima vez, siempre y cuando no sea nuevo el usuario
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Metodo que nos permite verificar si el usuario ingreso una contraseña correcta
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Metodo que nos permite verificar una contraseña fue modificada despues de la fecha que recibe como parametro de la funcion
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Metodo que crea un token que el usuario tendrá que usar para poder reestablecer su contraseña
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// Establece el modelo de las reseñas con base en el esquema previamente definido
const User = mongoose.model("User", userSchema);

//Exportamos el modelo de usuario
module.exports = User;
