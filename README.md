# LenguasIndigenas001

1.- Schema -> Model -> Controller -> Handler -> Route
    1.1 .- Schema: Formato en el que se estructuran los datos a ingresar y recuperar de la base
    1.2 .- Model: Contenedor del Schema para referenciarlo y rtilizarlo en el código
    1.3 .- Controller: Realiza las llamadas al Handler y le envía el modelo correspondiente (i.E. diccionarioController -> Diccionario "controlador diccionario envía medelo Diccionario al manejador")
    1.4 .- Handler: Contiene todas las funciones del CRUD y recibe el modelo a utilizar en la acción solicitada
    1.5 .- Route: Define la ruta del controlador a utilizar dependiendo de la URL y de la cabecera HTTP

2.- Los usuarios comunes no son capaces de modificar o insertar documentos a la base.

3.- El controlador de autenticación permite el manejo de usuarios y sesiones

4.- NOTA (Documentación en Postman): "BEARER TOKEN" hace referencia al JWT (JSON Web Token) perteneciente a la sesión de usuario iniciada que es devuelto al realizar el Log In o el Sign Up

5.- Para ejecutar el proyecto es necesario escribir en consola los comandos "npm install" para instalar la mayoria de librerias requeridas, y, además, el comando "npm i -g nodemon" para instalar la libreria que permitirá mantener el servidor abierto y actualizandose al modificar el código; finalmente, el script "npm start" para iniciar el servidor.