const path = require("path");
const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
//const helmet = require('helmet');
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const diccionarioRouter = require("./routes/diccionarioRoutes");
const userRouter = require("./routes/userRoutes");
const guiaGramRouter = require("./routes/guiaGramaticalRoutes");
const lecturasRouter = require("./routes/lecturasRoutes");
const videosPronunRouter = require("./routes/videosPronunciacionRoutes");

const app = express();

// 1) MIDDLEWARES
// Serving static files
// Nos permite acceder a los archivos estaticos siempre serán "servidos" desde un folder llamado "public"
app.use(express.static(path.join(__dirname, "public")));

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Limit requests from same API
// Limitamos la cantidad de solicitudes de una misma IP en un periodo de tiempo
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many request from this IP, please try again in an hour!",
});
app.use("/api", limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Data sanitization against NoSQL query injection
// Sanitizamos los datos de la solicitud para eliminar codigo NoSQL malicioso
app.use(mongoSanitize());

// Data sanitization against XSS
// Sanitizamos los datos de la solicitud para eliminar todos los simbolos HTML
app.use(xss());

// Prevent parameter pollution
//app.use(
//  hpp({
//    whitelist: [
//      "duration",
//      "ratingsAverage",
//      "ratingsQuantity",
//      "maxGroupSize",
//      "difficulty",
//      "price",
//    ],
//  })
//);

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  //console.log(req.cookies);
  next();
});

// Rutas de la API
app.use("/api/v1/diccionario", diccionarioRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/guiaGram", guiaGramRouter);
app.use("/api/v1/lecturas", lecturasRouter);
app.use("/api/v1/videosPronun", videosPronunRouter);

app.all("*", (req, res, next) => {
  // const err = new Error(`Can't find ${req.originalUrl} on this server!!`);
  // err.status = 'fail';
  // err.statusCode = 404;

  next(new AppError(`Can't find ${req.originalUrl} on this server!!`, 404));
});

app.use(globalErrorHandler);

// 3) START THE SERVER
module.exports = app;
