const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const User = require('../models/user');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

passport.use('local-signup', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, async (req, email, password, done) => {
  var user = new User();
  user = await user.findEmail(email)
  if (user) {
    return done(null, false, req.flash('signupMessage', 'Este correo ya está registrado')); //Traducido a español
  } else {
    const newUser = new User();
    newUser.nombre = req.body.nombre; //Añadido del rol cogiendo el valor del formulario de signup
    newUser.apellidos = req.body.apellidos; //Añadido del rol cogiendo el valor del formulario de signup
    newUser.email = email;
    newUser.password = newUser.encryptPassword(password);
    newUser.rol = req.body.rol; //Añadido del rol cogiendo el valor del formulario de signup
    await newUser.insert();
    done(null); //Quitado el usuario como parametro para que la sesión actual no se convierta en la del usuario nuevo
  }
}));

passport.use('local-signin', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, async (req, email, password, done) => {
  var user = new User();
  user = await user.findEmail(email);
  if (!user || !user.comparePassword(password)) {
    return done(null, false, req.flash('signinMessage', 'Correo o contraseña incorrectos')); //Juntado de ambos errores (contraseña incorrecta y usuario no existente) en un solo mensaje de error
  }
  return done(null, user);
}));
