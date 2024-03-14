//Nuevo modelo, tiene métodos adaptados de task.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SoftwareSchema = new Schema({
  nombre: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  descripcion: {
    type: String,
    required: true
  },
  archivos: [{
    name: String,
    path: String
  }],
  task:
    {type: mongoose.Schema.Types.ObjectId, ref:'task'}
});

//Henlo
SoftwareSchema.methods.findAll= async function () {
    const Software = mongoose.model("softwares", SoftwareSchema);
    return await Software.find();
  };

SoftwareSchema.methods.insert= async function () {
    await this.save()
    .then(result => console.log(result))
    .catch(error => console.log(error));
};

SoftwareSchema.methods.delete= async function (id) {
    const Software = mongoose.model("softwares", SoftwareSchema);
    await Software.deleteOne({_id: id}, err => {
      if (err) console.log(err);
    });
    console.log(id + " deleted");
};

/*Métodos nuevos*/
SoftwareSchema.statics.findById = async function (id) {
  const Software = mongoose.model("softwares", SoftwareSchema);
  return await Software.findOne({_id: id});
};  

//Revisar este export, es necesario crear otra ruta? O basta con la de tasks?
module.exports = mongoose.model('softwares', SoftwareSchema);