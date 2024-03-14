const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Intento de meter software como un schema nuevo, no parecía viable por el momento
// const SoftwareSchema = new Schema({
//   url: {
//     type: String,
//     required: true
//   },
//   // descripcion: {
//   //   type: String,
//   //   required: true
//   // },
//   task: {type: mongoose.Schema.Types.ObjectId, ref: 'tasks'}
// });

const TaskSchema = Schema({
  nombre: {
    type: String,
    required: true
  },
  planEstudios: {
    type: String,
    required: true
  },
  cuatrimestre: {
    type: String,
    required: true
  },
  curso: {
    type: String,
    required: true
  },
  usuario: [
    {type: mongoose.Schema.Types.ObjectId, ref:'user'}
  ]
});

//Para buscar todas las asignaturas simultáneamente en vez de las asignadas a usuarios
TaskSchema.methods.findAll= async function () {
  const Task = mongoose.model("tasks", TaskSchema);
  return await Task.find();
};

//Cambiado el nombre del método para evitar conflictos, busca tareas en función del usuario
TaskSchema.methods.findAllUser = async function (userId) {
  const Task = mongoose.model("tasks", TaskSchema);
  return await Task.find({ 'usuario': userId });
};

//Cambiado a lo que nos dijo Mario de Promises
TaskSchema.methods.insert= async function () {
  await this.save()
  .then(result => console.log(result))
  .catch(error => console.log(error));
};

//Cambiado a lo que nos dijo Mario de Promises
//Faltaba el segundo parametro del updateOne (la task con los atributos actualizados)
TaskSchema.methods.update= async (id, task) => {
  const Task = mongoose.model("tasks", TaskSchema);
  await Task.updateOne({_id: id},task)
  .then(result => console.log(result))
  .catch(error => console.log(error));
};

TaskSchema.methods.delete= async function (id) {
  const Task = mongoose.model("tasks", TaskSchema);
  await Task.deleteOne({_id: id}, err => {
    if (err) console.log(err);
  });
  console.log(id + " deleted");

};

TaskSchema.methods.findById= async function (id) {
  const Task = mongoose.model("tasks", TaskSchema);
  return await Task.findById(id);
};

TaskSchema.methods.findSearch= async function (search, usuario) {
  const Task = mongoose.model("tasks", TaskSchema);
  return await Task.find({'title' : new RegExp(search, 'i'),'usuario': usuario});
};


module.exports = mongoose.model('tasks', TaskSchema);
