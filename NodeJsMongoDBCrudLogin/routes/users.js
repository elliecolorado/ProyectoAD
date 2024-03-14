const router = require('express').Router();
const passport = require('passport');
const User = require('../models/user'); //Añadida esta linea para que se pueda usar el modelo de User y acceder a sus metodos
const fs = require('fs'); //filesystem
const csv = require('csv-parser');//Para parsear el  csv

const readCsvFile = async (fileName) => {
  let result = [];
  var cont = 1;
  await fs.createReadStream(fileName)
    .pipe(csv({ separator: "," }))
    .on("data", (data) => result.push(data))
    .on("end", () => {
        result.map(async user=>{
          if(user.nombre && user.apellidos && user.email.includes('@') && user.password && user.rol &&
            (user.rol == "administrador" || user.rol == "profesor" || user.rol == "alumno")) {//Verificamos la validez del objeto antes de integrarlo
            let usuarioExistente = await User.findOne({ email: user.email });//Verificamos si el usuario ya existe

            if(usuarioExistente){
              console.error('Ya existe un usuario con el email:', user.email);
            }     
            else{
              var usuario = new User();
              usuario.nombre=user.nombre;
              usuario.apellidos=user.apellidos;
              usuario.email=user.email;
              usuario.password=usuario.encryptPassword(user.password);
              usuario.rol=user.rol;
              usuario.save();
            }       
          } else {
            console.error('Faltan campos requeridos, el valor de rol es inválido o el email no contiene una @ en el usuario con índice:', cont);
          }
          cont++;
        });   
    })
};


router.get('/', (req, res, next) => {
  res.render('index');
});

router.get('/signin', (req, res, next) => {
  res.render('signin');
});

router.post('/signin', passport.authenticate('local-signin', {
  successRedirect: '/profile',
  failureRedirect: '/signin',
  failureFlash: true
}));

router.get('/profile', isAuthenticated, (req, res, next) => {
  res.render('profile');
});

router.get('/logout', (req, res, next) => {
  req.logout();
  res.redirect('/');
});

//Añadida la ruta /users/add
router.post('/users/add', passport.authenticate('local-signup', {
  //Rutas cambiadas para que, falle o salga bien, añadir un usuario lleve a la pantalla de usuarios
  successRedirect: '/controlPanel/users',
  failureRedirect: '/controlPanel/users?success=true',
  failureFlash: true
}));

//Añadida la ruta /users
router.get('/users', isAuthenticated, async (req, res) => {
  if(req.user.rol=="administrador"){ 
    const success = req.query.success; // Obtener el parámetro de consulta "success"
    const error = req.query.error;
  const user = new User();
  const users = await user.findAll();
  res.render('users', {
    users, error, success
  });
}else{
  res.redirect('/');
}
});

//Añadida la ruta /users/delete/:id
router.get('/users/delete/:id', isAuthenticated, async (req, res, next) => {
  if(req.user.rol=="administrador"){
  const user = new User();
  let { id } = req.params;
  await user.delete(id);
  res.redirect('/controlPanel/users?success=true');
}else{
  res.redirect('/');
}
});

//Añadida la rutas edit (get)
router.get('/users/edit/:id', isAuthenticated, async (req, res, next) => {
  if(req.user.rol=="administrador"){
    //Cambiado el nombre de la variable a "editUser" para que la aplicacion no lo confunda con el "user" que tiene la sesión actual
  var editUser = new User(); 
  editUser = await editUser.findById(req.params.id);
  res.render('userEdit', { editUser });
}else{
  res.redirect('/');
}
});

//Añadida la rutas edit (post)
router.post('/users/edit/:id', isAuthenticated, async (req, res, next) => {
  const user = new User();
  const { id } = req.params;
  await user.update({ _id: id }, req.body);
  res.redirect('/controlPanel/users?success=true');
});

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect('/')
}

router.post('/users/uploadCSV', isAuthenticated, (req, res) => {
  var fileUsers=req.files.file;
  fileUsers.mv(`./files/users/${fileUsers.name}`,err=>{
    if(err) return res.status(500).send({message:err});
    readCsvFile(`./files/users/${fileUsers.name}`);
    res.redirect("/users?success=true");
  });
});

module.exports = router;
