const express = require("express");
const controlador = require("../controladores/reservas");
const {
  validarId,
  validarConsultaReservas,
  validarCreacionReserva,
  validarReemplazoReserva,
  validarActualizacionParcial,
} = require("../middleware/reservas");

function crearRouterReservasApi() {
  const router = express.Router();

  router.get("/", validarConsultaReservas, controlador.listarApi);
  router.post("/", validarCreacionReserva, controlador.crearApi);

  router.get("/:id", validarId, controlador.obtenerPorIdApi);
  router.put(
    "/:id",
    validarId,
    validarReemplazoReserva,
    controlador.reemplazarApi,
  );
  router.patch(
    "/:id",
    validarId,
    validarActualizacionParcial,
    controlador.actualizarParcialApi,
  );
  router.delete("/:id", validarId, controlador.eliminarApi);

  return router;
}

module.exports = { crearRouterReservasApi };
