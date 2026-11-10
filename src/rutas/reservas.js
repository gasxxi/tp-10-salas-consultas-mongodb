const express = require("express");
const controlador = require("../controladores/reservas");
const {
  prepararAreaReservas,
  validarReserva,
  validarId,
} = require("../middleware/reservas");

function crearRouterReservas() {
  const router = express.Router();

  router.use(prepararAreaReservas);

  router.get("/", controlador.listarHtml);
  router.get("/nueva", controlador.mostrarFormularioNuevaHtml);
  router.post("/", validarReserva, controlador.crearHtml);
  router.get("/:id", validarId, controlador.mostrarDetalleHtml);

  return router;
}

module.exports = { crearRouterReservas };
