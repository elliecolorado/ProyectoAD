const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const User = require('../models/user');

router.get('/sugerencias', isAuthenticated, async (req, res) => {
    const success = req.query.success; // Obtener el parámetro de consulta "success"
    const error = req.query.error;
    const user = req.user; // Obtener el usuario autenticado
    res.render('sugerencias_formulario', { success, error, user }); // Pasar el parámetro "success" a la vista
});

// Ruta para procesar el envío del formulario de sugerencias
router.post('/sugerencias/enviar', isAuthenticated, async (req, res) => {
    const { name: subject, suggestion } = req.body;
    const user = req.user;

    try {
        // Configuración del transportador de correo electrónico
        //Para un correcto testeo de la aplicación, se debe entrar en https://ethereal.email/ con los datos de 
        //la cuenta que figura abajo, y enviar sugerencias directamente desde la aplicación
        const transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: 'shaylee.kuhlman@ethereal.email',
                pass: 'CpDCAKnFu2kyVt4WUE'
            }
        });

        // Opciones del correo electrónico
        let mailOptions = {
            from: 'shaylee.kuhlman@ethereal.email',
            to: 'dam2proyectoad3@gmail.com',
            subject: `Sugerencia de ${user.nombre}: ${subject}`,
            text: `Sugerencia de ${user.nombre} ${user.apellidos} (${user.email}), Rol: ${user.rol}\n\nSugerencia: ${suggestion}`
        };

        // Enviar correo electrónico al administrador
        const info = await transporter.sendMail(mailOptions);
        console.log('Email enviado: ' + info.response);

        // Redireccionar con parámetro de éxito
        res.redirect('/sugerencias?success=true');
    } catch (error) {
        console.log(error);

        // Redireccionar con parámetro de error
        res.redirect('/sugerencias?error=true');
    }
});

function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }

    res.redirect('/');
}

module.exports = router;
