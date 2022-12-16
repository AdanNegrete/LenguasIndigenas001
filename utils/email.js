//Este documento contiene el codigo que nos permite enviar el email de bienvenida o bien para reestablecer la contraseña olvidada del usuario

// Requerimos los modulos npm que utilizaremos en este documento
const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

//Creamos la clase que contendrá las funciones a utilizar para mandar emails al usuario
module.exports = class Email {
  //Establecemos el constructor de la clase
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Fernando Mejía <${process.env.EMAIL_FROM}>`;
  }

  //Función para declarar los datos con los que será enviado el correo al usuario
  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      //Sendgrid
      return 1;
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  //Función para enviar el correo electrónico
  async send(template, subject) {
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject
    });

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html)
    };

    await this.newTransport().sendMail(mailOptions);
  }

  // Función para enviar un correo de bienvenida al usuario
  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family!');
  }

  // Función para enviar un correo para reestablecer la contraseña del usuario
  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (Valid only for 10 minutes)'
    );
  }
};
