const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SoftwareSchema = new Schema({

  nombre: { type: String, required: true },

  url: { type: String, required: true },

  descripcion: { type: String, required: true },

  archivos: [{ name: String, path: String }],

  asignatura: { type: mongoose.Schema.Types.ObjectId, ref: 'asignatura' }

});

SoftwareSchema.methods.findAll = async function () {

  const Software = mongoose.model("softwares", SoftwareSchema);

  return await Software.find();

};

SoftwareSchema.methods.insert = async function () {

  await this.save()

    .then(result => console.log(result))

    .catch(error => console.log(error));

};

SoftwareSchema.methods.delete = async function (id) {

  const Software = mongoose.model("softwares", SoftwareSchema);

  await Software.deleteOne({ _id: id }, err => {

    if (err) console.log(err);

  });

  console.log(id + " deleted");

};

SoftwareSchema.statics.findById = async function (id) {

  const Software = mongoose.model("softwares", SoftwareSchema);

  return await Software.findOne({ _id: id });

};

module.exports = mongoose.model('softwares', SoftwareSchema);