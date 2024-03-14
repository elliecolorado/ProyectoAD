const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const { Schema } = mongoose;

const userSchema = new Schema({

  nombre: { type: String, required: true },

  apellidos: { type: String, required: true },

  email: { type: String, required: true },

  password: { type: String, required: true },

  rol: { type: String, required: true }

});

userSchema.methods.encryptPassword = (password) => {

  return bcrypt.hashSync(password, bcrypt.genSaltSync(10));

};
userSchema.methods.comparePassword = function (password) {

  return bcrypt.compareSync(password, this.password);

};

userSchema.methods.findEmail = async (email) => {

  const User = mongoose.model("user", userSchema);

  return await User.findOne({ 'email': email })

};

userSchema.methods.insert = async function () {

  await this.save((err, res) => {

    err ? console.log(err) : "";

    console.log("saved: " + res);

  });

};

//Añadido el metodo de findAll que devuelve una lista de usuarios
userSchema.methods.findAll = async function () {

  const User = mongoose.model("user", userSchema);

  return await User.find();

};

//Añadido el metodo de delete, que borra un usuario usando su id
userSchema.methods.delete = async function (id) {

  const User = mongoose.model("user", userSchema);

  await User.deleteOne({ _id: id }, err => {

    if (err) console.log(err);

  });

  console.log(id + " deleted");

};

//Añadido el metodo de findById, que devuelve un usuario segun su id
userSchema.methods.findById = async function (id) {

  const User = mongoose.model("user", userSchema);

  return await User.findById(id);

};

//Añadido el metodo de update, que actualiza un usuario usando su id
userSchema.methods.update = async (id, user) => {

  const User = mongoose.model("user", userSchema);

  await User.updateOne({ _id: id }, user, err => {

    if (err) console.log(err);

  });

  console.log(id + " updated");

};

module.exports = mongoose.model('user', userSchema);
