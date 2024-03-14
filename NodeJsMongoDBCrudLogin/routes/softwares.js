//Ruta nueva, con algunos post y get de tasks.js
const express = require('express');
const router = express.Router();
const Software = require('../models/software');
const path = require('path');//Para la búsqueda de archivos y su descarga
const fs = require('fs');//Para la búsqueda de archivos y su descarga

// Ruta obsoleta
// router.get('/softwares',isAuthenticated, async (req, res) => {
//     const software = new Software();
//     const softwares = await software.findAll();
//     console.log(softwares);
//     res.render('softwares', {
//         softwares
//     });
// });

router.post('/softwares/add/:id', isAuthenticated, async (req, res) => {
    try {
        // Obtener el ID de la tarea desde los parámetros de la URL
        const taskId = req.params.id;

        // Crear una nueva instancia del modelo Software con los datos del formulario
        const newSoftware = new Software({
            nombre: req.body.nombre,
            url: req.body.url,
            descripcion: req.body.descripcion,
            task: taskId
        });

        // Guardar el nuevo software en la base de datos
        await newSoftware.save();

        // Redirigir a la lista de software después de agregar con un mensaje de éxito
        res.redirect(`/tasks/update_task/${taskId}?success=true`);
    } catch (error) {
        console.error('Error al agregar el nuevo software:', error);
        res.redirect(`/tasks/update_task/${taskId}?error=true`);
    }
});

router.get('/softwares/delete/:id', isAuthenticated,async (req, res, next) => {
    if(req.user.rol=="administrador" || req.user.rol=="profesor"){
    let { id } = req.params;
    const software = await Software.findById(id);
    const taskId = software.task;
    console.log("id del task" + taskId);
    await software.delete(id);
    res.redirect(`/tasks/update_task/${taskId}?success=true`);
}else{
    res.redirect('/');
  }
});

function isAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
      return next();
    }
    res.redirect('/')
}

/*Métodos nuevos*/
// GET para obtener el formulario de actualización de un software
router.get('/softwares/update/:id', isAuthenticated, async (req, res) => {
    if(req.user.rol=="administrador" || req.user.rol=="profesor"){
    try {
        // Obtener el ID del software de la URL
        const { id } = req.params;
        const success = req.query.success; // Obtener el parámetro de consulta "success"
        const error = req.query.error;
        // Buscar el software por su ID en la base de datos
        const software = await Software.findById(id);
        // Renderizar el formulario de actualización con los datos del software
        res.render('update_software', { software,error, success });
    } catch (error) {
        console.error('Error al obtener el formulario de actualización de software:', error);
        res.redirect(`/tasks/update_task/${taskId}?success=true`); // Redirigir a la lista de software en caso de error
    }
}else{
    res.redirect('/');
  }
});

/*Métodos nuevos*/
// POST para procesar la actualización de un software
router.post('/softwares/update/:id', isAuthenticated, async (req, res) => {
    try {
        // Obtener el ID del software de la URL
        const { id } = req.params;
        // Buscar el software por su ID en la base de datos
        const software = await Software.findById(id);

        // Obtener el ID de la tarea asociada al software
        const taskId = software.task._id;

        // Actualizar los campos del software con los nuevos datos del formulario
        software.nombre = req.body.nombre; // Aquí actualizamos el nombre del software
        software.url = req.body.url;
        software.descripcion = req.body.descripcion;

        // Guardar los cambios en la base de datos
        await software.save();

        // Redirigir a la lista de software después de la actualización con un mensaje de éxito
        res.redirect(`/tasks/update_task/${taskId}?success=true`);
    } catch (error) {
        console.error('Error al actualizar el software:', error);
        res.redirect(`/tasks/update_task/${taskId}?error=true`); // Redirigir a la lista de software en caso de error
    }
});

router.post('/softwares/upload/:id', isAuthenticated, async (req, res) => { 
    try {
        // Obtener el ID del software de la URL
        const { id } = req.params;
        // Buscar el software por su ID en la base de datos
        const software = await Software.findById(id);

        // Procesar el archivo subido
        let EDFile = req.files.file;
        let path = `./files/${EDFile.name}`;
        EDFile.mv(path, async err => { 
            if(err) {
                console.error('Error al mover el archivo:', err);
                return res.status(500).send({ message : err });
            }

            // Guardar la información del archivo en el software
            software.archivos.push({
                name: EDFile.name,
                path: path
            });

            // Guardar los cambios en la base de datos
            await software.save();

            // Redirigir a la página de actualización de software
            res.redirect(`/softwares/update/${id}?success=true`);
        });
    } catch (error) {
        console.error('Error al subir el archivo:', error);
        res.redirect(`/softwares/update/${id}?error=true`);
    }
});

router.get('/softwares/deleteFile/:id/:index', isAuthenticated, async (req, res) => {
    if(req.user.rol=="administrador" || req.user.rol=="profesor"){
        try {
            // Obtener el ID del software y el índice del archivo de la URL
            const { id, index } = req.params;
            // Buscar el software por su ID en la base de datos
            const software = await Software.findById(id);
        
            // Eliminar el archivo del array de archivos
            software.archivos.splice(index, 1);

            // Guardar los cambios en la base de datos
            await software.save();
        
            // Redirigir a la página de actualización de software
            res.redirect(`/softwares/update/${id}?success=true`);
        } catch (error) {
        console.error('Error al eliminar el archivo:', error);
        res.redirect(`/softwares/update/${id}?error=true`);
        }
    }
    else{
        res.redirect('/');
    }
});

router.get('/softwares/download/:name', isAuthenticated, async (req, res) => {
    try {
        // Obtener el nombre del archivo de la URL
        const { name } = req.params;
        
        // Hacer una ruta de acceso al archivo
        const directoryPath = path.join(__dirname, '../files'); 
        const filePath = path.join(directoryPath, name);

        // Comprobar si el archivo existe y descargarlo. Si no, error por consola
        if (fs.existsSync(filePath)) {
            res.download(filePath, name, function(err){
                if (err) {
                    console.error('Error al descargar el archivo:', err);
                    res.redirect('back');//Para recargar la página en caso de error
                }
            });
          } else {
            console.error('El archivo no existe:', filePath);
            res.redirect('back');//Para recargar la página en caso de error
          }
    } catch (error) {
        console.error('Error al descargar el archivo:', error);
        res.redirect('back');//Para recargar la página en caso de error
    }
});

module.exports = router;