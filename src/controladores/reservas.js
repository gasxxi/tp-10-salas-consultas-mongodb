const servicio = require("../servicios/reservas-mongo");

// Rutas Generales
function mostrarInicio(req, res) {
  res.render("inicio", {
    titulo: "Sistema de Biblioteca — Reservas de salas",
  });
}

async function obtenerEstado(req, res, next) {
  try {
    const cantidad = await servicio.contar();
    res.status(200).json({
      servicio: "activo",
      reservas: cantidad,
      solicitudId: req.solicitudId || "BIB-0000",
    });
  } catch (error) {
    next(error);
  }
}

// Endpoints API REST
async function listarApi(req, res, next) {
  try {
    const { sala, orden, pagina, limite } = req.query;
    const resultado = await servicio.consultar({ sala, orden, pagina, limite });
    res.status(200).json(resultado);
  } catch (error) {
    next(error);
  }
}

async function obtenerPorIdApi(req, res, next) {
  try {
    const reserva = await servicio.obtenerPorId(req.params.id);
    if (!reserva) {
      return res.status(404).json({ error: "Reserva no encontrada." });
    }
    res.status(200).json(reserva);
  } catch (error) {
    next(error);
  }
}

async function crearApi(req, res, next) {
  try {
    const nueva = await servicio.crear(req.reservaValidada);
    res.status(201).location(`/api/reservas/${nueva.id}`).json(nueva);
  } catch (error) {
    next(error);
  }
}

async function reemplazarApi(req, res, next) {
  try {
    const actualizada = await servicio.reemplazar(
      req.params.id,
      req.reservaValidada,
    );
    if (!actualizada) {
      return res.status(404).json({ error: "Reserva no encontrada." });
    }
    res.status(200).json(actualizada);
  } catch (error) {
    next(error);
  }
}

async function actualizarParcialApi(req, res, next) {
  try {
    const actualizada = await servicio.actualizarParcial(
      req.params.id,
      req.cambiosValidados,
    );
    if (!actualizada) {
      return res.status(404).json({ error: "Reserva no encontrada." });
    }
    res.status(200).json(actualizada);
  } catch (error) {
    next(error);
  }
}

async function eliminarApi(req, res, next) {
  try {
    const eliminada = await servicio.eliminar(req.params.id);
    if (!eliminada) {
      return res.status(404).json({ error: "Reserva no encontrada." });
    }
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

// Vistas Web HTML (usan listar sin filtros ni cortes)
async function listarHtml(req, res, next) {
  try {
    const reservas = await servicio.listar();
    res.render("reservas/lista", {
      titulo: "Listado de Reservas",
      reservas,
    });
  } catch (error) {
    next(error);
  }
}

function mostrarFormularioNuevaHtml(req, res) {
  res.render("reservas/nueva", {
    titulo: "Nueva Reserva",
    error: null,
    valores: {},
    salasPermitidas: ["Sala Norte", "Sala Sur", "Sala Multimedia"],
    turnosPermitidos: ["Mañana", "Tarde", "Noche"],
  });
}

async function crearHtml(req, res, next) {
  try {
    const nueva = await servicio.crear(req.reservaValidada);
    res.redirect(302, `/reservas/${nueva.id}`);
  } catch (error) {
    next(error);
  }
}

async function mostrarDetalleHtml(req, res, next) {
  try {
    const reserva = await servicio.obtenerPorId(req.params.id);
    if (!reserva) {
      return res.status(404).render("no-encontrado", {
        titulo: "Reserva no encontrada",
        mensaje: "No existe una reserva con el ID solicitado.",
      });
    }
    res.render("reservas/detalle", {
      titulo: `Ficha de Reserva #${reserva.id}`,
      reserva,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  mostrarInicio,
  obtenerEstado,
  listarApi,
  obtenerPorIdApi,
  crearApi,
  reemplazarApi,
  actualizarParcialApi,
  eliminarApi,
  listarHtml,
  mostrarFormularioNuevaHtml,
  formularioNueva: mostrarFormularioNuevaHtml,
  crearHtml,
  crearReserva: crearHtml,
  mostrarDetalleHtml,
  detalleReserva: mostrarDetalleHtml,
};
