const mongoose = require("mongoose");
const Reserva = require("../modelos/reserva");

function transformarDoc(doc) {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : doc;
  const copia = { ...obj };
  const idTexto = copia._id.toString();
  delete copia._id;
  delete copia.__v;
  return {
    id: idTexto,
    ...copia,
  };
}

async function contar() {
  return await Reserva.countDocuments();
}

// listar alimenta las vistas HTML tradicionales
async function listar() {
  const docs = await Reserva.find({}).exec();
  return docs.map(transformarDoc);
}

// consultar gestiona el filtro por sala y el orden para la API
async function consultar({
  sala,
  orden = "estudiante",
  pagina = 1,
  limite = 2,
} = {}) {
  const filtro = {};

  if (sala !== undefined) {
    filtro.sala = sala.trim();
  }

  let criterioOrden = { estudiante: 1, _id: 1 };
  if (orden === "personas-asc") {
    criterioOrden = { personas: 1, _id: 1 };
  } else if (orden === "personas-desc") {
    criterioOrden = { personas: -1, _id: 1 };
  }

  const numPagina = Number(pagina);
  const numLimite = Number(limite);
  const salto = (numPagina - 1) * numLimite;

  const total = await Reserva.countDocuments(filtro);
  const paginas = Math.ceil(total / numLimite) || 1;

  const docs = await Reserva.find(filtro)
    .sort(criterioOrden)
    .skip(salto)
    .limit(numLimite)
    .exec();

  return {
    total,
    pagina: numPagina,
    limite: numLimite,
    paginas,
    datos: docs.map(transformarDoc),
  };
}

async function obtenerPorId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  const doc = await Reserva.findById(id).exec();
  return transformarDoc(doc);
}

async function crear(datos) {
  const nueva = new Reserva(datos);
  const guardada = await nueva.save();
  return transformarDoc(guardada);
}

async function reemplazar(id, datos) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  const actualizable = {
    estudiante: datos.estudiante,
    email: datos.email,
    sala: datos.sala,
    fecha: datos.fecha,
    turno: datos.turno,
    personas: datos.personas,
  };
  if (datos.estado !== undefined) {
    actualizable.estado = datos.estado;
  }
  const doc = await Reserva.findByIdAndUpdate(id, actualizable, {
    new: true,
    runValidators: true,
  }).exec();
  return transformarDoc(doc);
}

async function actualizarParcial(id, cambios) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  const doc = await Reserva.findByIdAndUpdate(
    id,
    { $set: cambios },
    { new: true, runValidators: true },
  ).exec();
  return transformarDoc(doc);
}

async function eliminar(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  const doc = await Reserva.findByIdAndDelete(id).exec();
  return transformarDoc(doc);
}

module.exports = {
  contar,
  listar,
  consultar,
  obtenerPorId,
  crear,
  reemplazar,
  actualizarParcial,
  eliminar,
};
