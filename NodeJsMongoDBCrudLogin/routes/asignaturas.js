const express = require('express');
const router = express.Router();
const Asignatura = require('../models/asignatura');
const Software = require('../models/software');//const para sacar el modelo de software
const User = require('../models/user');//const para sacar el modelo de user
const fs = require('fs'); // filesystem
const csv = require('csv-parser');// Encargado de parsear

const readCsvFile = async (fileName) => {

  let result = [];

  var cont = 1;

  await fs.createReadStream(fileName)

    .pipe(csv({ separator: "," }))

    .on("data", (data) => result.push(data))

    .on("end", () => {

      result.map(asignatura => {

        if (asignatura.nombre && asignatura.planEstudios && asignatura.cuatrimestre && asignatura.curso

          && (asignatura.planEstudios == "Grado" || asignatura.planEstudios == "Master"

            || asignatura.planEstudios == "Doctorado")) {//Verificamos la validez del objeto antes de integrarlo

          var tarea = new Asignatura();

          tarea.nombre = asignatura.nombre;

          tarea.planEstudios = asignatura.planEstudios;

          tarea.cuatrimestre = asignatura.cuatrimestre;

          tarea.curso = asignatura.curso;

          tarea.save();

        }

        else {

          console.error('Faltan campos requeridos o el plan de estudios es inválido en la asignatura con índice:', cont);

        }

        cont++;

      });

    })

};

//Modificada ruta para acceder al panel de control, pasandole solo los usuarios
router.get('/controlPanel/users', isAuthenticated, async (req, res) => {

  if (req.user.rol == "administrador") {

    const success = req.query.success; // Obtener el parámetro de consulta "success"

    const error = req.query.error;

    const user = new User();

    const users = await user.findAll();

    res.render('users', {

      users, error, success

    });

  } else {

    res.redirect('/');

  }

});

//Nueva ruta para acceder al panel de control, pasandole solo las tareas
router.get('/controlPanel/asignaturas', isAuthenticated, async (req, res) => {

  if (req.user.rol == "administrador") {

    const success = req.query.success; // Obtener el parámetro de consulta "success"

    const error = req.query.error;

    const asignatura = new Asignatura();

    const asignaturas = await asignatura.findAll();

    res.render('asignaturas', {

      asignaturas, error, success

    });

  } else {

    res.redirect('/');

  }

});


//Ruta para acceder a los asignaturas del usuario logged in
router.get('/asignaturas/user/:userId', isAuthenticated, async (req, res) => {

  const asignatura = new Asignatura();

  const asignaturas = await asignatura.findAllUser(req.params.userId);

  res.render('userAsignaturas', { asignaturas });

});

router.post('/asignaturas/add', isAuthenticated, async (req, res, next) => {

  const asignatura = new Asignatura(req.body);

  await asignatura.insert();

  res.redirect('/controlPanel/asignaturas?success=true');

});

router.get('/asignaturas/turn/:id', isAuthenticated, async (req, res, next) => {

  let { id } = req.params;

  const asignatura = await Asignatura.findById(id);

  asignatura.status = !asignatura.status;

  await asignatura.insert();

  res.redirect('/asignaturas');

});

//Route - Asignaturas
router.get('/asignaturas/edit/:id', isAuthenticated, async (req, res, next) => {

  if (req.user.rol == "administrador" || req.user.rol == "profesor") {

    var asignatura = new Asignatura();

    var softwares = new Software();

    asignatura = await asignatura.findById(req.params.id);

    res.render('edit_asignatura', { asignatura, softwares });

  } else {

    res.redirect('/');

  }

});

router.post('/asignaturas/edit/:id', isAuthenticated, async (req, res, next) => {

  const asignatura = new Asignatura();

  const { id } = req.params;

  await asignatura.update({ _id: id }, req.body);

  res.redirect('/asignaturas/update_asignatura/' + id + '?success=true');

});

router.get('/asignaturas/delete/:id', isAuthenticated, async (req, res, next) => {

  if (req.user.rol == "administrador") {

    const asignatura = new Asignatura();

    let { id } = req.params;

    await asignatura.delete(id);

    res.redirect('/controlPanel/asignaturas?success=true');

  } else {

    res.redirect('/');

  }

});

router.get('/asignaturas/search', isAuthenticated, async (req, res, next) => {

  const asignatura = new Asignatura();

  let search = req.query.search;

  const asignaturas = await asignatura.findSearch(search, req.user._id);

  res.render('asignaturas', {

    asignaturas

  });

});


function isAuthenticated(req, res, next) {

  if (req.isAuthenticated()) {

    return next();

  }

  res.redirect('/')

}

//Método para el botón ver.
router.get('/asignaturas/update_asignatura/:id', isAuthenticated, async (req, res) => {

  try {

    const { id } = req.params;

    const asignatura = await Asignatura.findById(id).populate('usuario'); // Encuentra la tarea por su ID y llena los datos de usuario

    // Encuentra el software que tiene asignada esta tarea
    const success = req.query.success; // Obtener el parámetro de consulta "success"

    const error = req.query.error;

    const softwares = await Software.find({ asignatura: id }); // Buscar el software con la tarea asociada

    const users = await User.find({});

    console.log('Software encontrado: ' + softwares);

    res.render('update_asignatura', { asignatura, softwares, users, error, success });

  } catch (error) {

    console.error('Error al obtener la tarea para actualizar:', error);

    res.redirect('/asignaturas/update_asignatura/' + id + '?error=true'); // En caso de error, redirigir a la lista de tareas

  }

});

//Método que permite eliminar el id de un usuario del array de usuarios de una asignatura
router.post('/asignaturas/:id/removeUser', isAuthenticated, async (req, res) => {

  const { id } = req.params;

  const userId = req.body.userId;

  const asignatura = await Asignatura.findById(id);

  const index = asignatura.usuario.indexOf(userId);

  if (index > -1) {

    asignatura.usuario.splice(index, 1);

    await asignatura.save();

  }

  res.redirect('/asignaturas/update_asignatura/' + id + '?success=true');

});

//Método que permite agregar usuarios a una asignatura
router.post('/asignaturas/:id/addUser', isAuthenticated, async (req, res) => {

  const { id } = req.params;

  const users = req.body.users; //Cambiado para que coja el array de IDs

  const asignatura = await Asignatura.findById(id);

  if (users != null) { //Controla si no se ha seleccionado ningun usuario (el select es null)

    if (Array.isArray(users)) {

      for (var i = 0; i < users.length; i++) { //Recorre el array de usuarios, mira si ya están añadidos, y si no los añade

        if (!await asignatura.usuario.includes(users[i])) {

          asignatura.usuario.push(users[i]);

          await asignatura.save();

        }

      }

    } else {

      if (! await asignatura.usuario.includes(users)) {

        asignatura.usuario.push(users);

        await asignatura.save();

      }

    }

  }

  res.redirect('/asignaturas/update_asignatura/' + id + '?success=true');

});

router.post('/asignaturas/uploadCSV', isAuthenticated, (req, res) => {

  var fileAsignaturas = req.files.file;

  fileAsignaturas.mv(`./files/asignaturas/${fileAsignaturas.name}`, err => {

    if (err) return res.status(500).send({ message: err });

    readCsvFile(`./files/asignaturas/${fileAsignaturas.name}`);

    res.redirect("/controlPanel/asignaturas?success=true");

  });

});

module.exports = router;
