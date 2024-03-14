const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AsignaturaSchema = Schema({

  nombre: { type: String, required: true },

  planEstudios: { type: String, required: true },

  cuatrimestre: { type: String, required: true },

  curso: { type: String, required: true },

  usuario: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }]

});

//Para buscar todas las asignaturas simultáneamente en vez de las asignadas a usuarios
AsignaturaSchema.methods.findAll = async function () {

  const Asignatura = mongoose.model("asignaturas", AsignaturaSchema);

  return await Asignatura.find();

};

//Cambiado el nombre del método para evitar conflictos, busca tareas en función del usuario
AsignaturaSchema.methods.findAllUser = async function (userId) {

  const Asignatura = mongoose.model("asignaturas", AsignaturaSchema);

  return await Asignatura.find({ 'usuario': userId });

};

//Cambiado a lo que nos dijo Mario de Promises
AsignaturaSchema.methods.insert = async function () {

  await this.save()

    .then(result => console.log(result))

    .catch(error => console.log(error));

};

//Cambiado a lo que nos dijo Mario de Promises
//Faltaba el segundo parametro del updateOne (la asignatura con los atributos actualizados)
AsignaturaSchema.methods.update = async (id, asignatura) => {

  const Asignatura = mongoose.model("asignaturas", AsignaturaSchema);

  await Asignatura.updateOne({ _id: id }, asignatura)

    .then(result => console.log(result))

    .catch(error => console.log(error));

};

AsignaturaSchema.methods.delete = async function (id) {

  const Asignatura = mongoose.model("asignaturas", AsignaturaSchema);

  await Asignatura.deleteOne({ _id: id }, err => {

    if (err) console.log(err);

  });

  console.log(id + " deleted");

};

AsignaturaSchema.methods.findById = async function (id) {

  const Asignatura = mongoose.model("asignaturas", AsignaturaSchema);

  return await Asignatura.findById(id);

};

AsignaturaSchema.methods.findSearch = async function (search, usuario) {

  const Asignatura = mongoose.model("asignaturas", AsignaturaSchema);

  return await Asignatura.find({ 'title': new RegExp(search, 'i'), 'usuario': usuario });

};

module.exports = mongoose.model('asignaturas', AsignaturaSchema);
