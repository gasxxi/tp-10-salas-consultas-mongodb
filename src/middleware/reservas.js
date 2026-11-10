const mongoose = require("mongoose");

const SALAS_VALIDAS = ["Sala Norte", "Sala Sur", "Sala Multimedia"];
const TURNOS_VALIDOS = ["Mañana", "Tarde", "Noche"];
const ESTADOS_VALIDOS = ["pendiente", "confirmada"];
const ORDENES_VALIDOS = ["estudiante", "personas-asc", "personas-desc"];
const PARAMETROS_PERMITIDOS = ["sala", "orden", "pagina", "limite"];

function prepararAreaReservas(req, res, next) {
  res.locals.seccion = "Reservas de salas";
  next();
}

function validarTextoEstricto(valor) {
  return typeof valor === "string" && valor.trim().length > 0;
}

function validarConsultaReservas(req, res, next) {
  const claves = Object.keys(req.query);

  // 1. Rechazar parámetros ajenos no permitidos
  for (const clave of claves) {
    if (!PARAMETROS_PERMITIDOS.includes(clave)) {
      return res.status(400).json({
        error: `El parámetro de consulta '${clave}' no está permitido.`,
      });
    }
  }

  // 2. Validar sala si fue enviada
  if (req.query.sala !== undefined) {
    if (typeof req.query.sala !== "string" || req.query.sala.trim() === "") {
      return res.status(400).json({
        error: "El parámetro 'sala' debe ser un texto único no vacío.",
      });
    }
  }

  // 3. Validar orden si fue enviado
  if (req.query.orden !== undefined) {
    if (
      typeof req.query.orden !== "string" ||
      !ORDENES_VALIDOS.includes(req.query.orden.trim())
    ) {
      return res.status(400).json({
        error:
          "El parámetro 'orden' debe ser 'estudiante', 'personas-asc' o 'personas-desc'.",
      });
    }
  }

  // 4. Validar pagina (rango 1 a 1000)
  if (req.query.pagina !== undefined) {
    if (typeof req.query.pagina !== "string") {
      return res
        .status(400)
        .json({ error: "El parámetro 'pagina' debe ser un único valor." });
    }
    const pagNum = Number(req.query.pagina.trim());
    if (!Number.isInteger(pagNum) || pagNum < 1 || pagNum > 1000) {
      return res.status(400).json({
        error: "El parámetro 'pagina' debe ser un entero entre 1 y 1000.",
      });
    }
  }

  // 5. Validar limite (rango 1 a 20)
  if (req.query.limite !== undefined) {
    if (typeof req.query.limite !== "string") {
      return res
        .status(400)
        .json({ error: "El parámetro 'limite' debe ser un único valor." });
    }
    const limNum = Number(req.query.limite.trim());
    if (!Number.isInteger(limNum) || limNum < 1 || limNum > 20) {
      return res.status(400).json({
        error: "El parámetro 'limite' debe ser un entero entre 1 y 20.",
      });
    }
  }

  next();
}

function validarId(req, res, next) {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      error: "El identificador proporcionado no tiene un formato válido.",
    });
  }
  next();
}

function validarCreacionReserva(req, res, next) {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    return res.status(400).json({ error: "Cuerpo de solicitud inválido." });
  }

  const esFormulario = req.is("application/x-www-form-urlencoded");
  let { estudiante, email, sala, fecha, turno, personas } = req.body;

  if (esFormulario && typeof personas === "string") {
    personas = Number(personas.trim());
  }

  const personasEntero =
    typeof personas === "number" &&
    Number.isInteger(personas) &&
    personas >= 1 &&
    personas <= 6;

  const estudianteValido = validarTextoEstricto(estudiante);
  const emailValido = validarTextoEstricto(email) && email.trim().includes("@");
  const fechaValida = validarTextoEstricto(fecha);
  const salaValida = SALAS_VALIDAS.includes(sala);
  const turnoValido = TURNOS_VALIDOS.includes(turno);

  if (
    !estudianteValido ||
    !emailValido ||
    !fechaValida ||
    !salaValida ||
    !turnoValido ||
    !personasEntero
  ) {
    if (esFormulario) {
      return res.status(400).render("reservas/nueva", {
        titulo: "Nueva Reserva",
        error:
          "Todos los campos son obligatorios y deben contener datos válidos.",
        valores: req.body,
        salasPermitidas: SALAS_VALIDAS,
        turnosPermitidos: TURNOS_VALIDOS,
      });
    }
    return res.status(400).json({
      error: "Datos de reserva incompletos o con tipos inválidos.",
    });
  }

  req.reservaValidada = {
    estudiante: estudiante.trim(),
    email: email.trim(),
    sala,
    fecha: fecha.trim(),
    turno,
    personas,
  };

  next();
}

function validarReemplazoReserva(req, res, next) {
  validarCreacionReserva(req, res, () => {
    if (req.body.estado !== undefined) {
      if (!ESTADOS_VALIDOS.includes(req.body.estado)) {
        return res
          .status(400)
          .json({ error: "El estado debe ser 'pendiente' o 'confirmada'." });
      }
      req.reservaValidada.estado = req.body.estado;
    }
    next();
  });
}

function validarActualizacionParcial(req, res, next) {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    return res.status(400).json({ error: "Cuerpo de solicitud inválido." });
  }

  const claves = Object.keys(req.body);
  if (claves.length === 0) {
    return res.status(400).json({
      error: "Debe enviar al menos un campo para actualizar.",
    });
  }

  if (req.body.id !== undefined || req.body._id !== undefined) {
    return res.status(400).json({
      error: "El identificador no puede modificarse.",
    });
  }

  const datosValidados = {};

  if (req.body.estudiante !== undefined) {
    if (!validarTextoEstricto(req.body.estudiante)) {
      return res
        .status(400)
        .json({ error: "El campo 'estudiante' debe ser un texto no vacío." });
    }
    datosValidados.estudiante = req.body.estudiante.trim();
  }

  if (req.body.email !== undefined) {
    if (
      !validarTextoEstricto(req.body.email) ||
      !req.body.email.includes("@")
    ) {
      return res
        .status(400)
        .json({ error: "El campo 'email' debe ser un texto válido con '@'." });
    }
    datosValidados.email = req.body.email.trim();
  }

  if (req.body.sala !== undefined) {
    if (!SALAS_VALIDAS.includes(req.body.sala)) {
      return res.status(400).json({ error: "La sala indicada no es válida." });
    }
    datosValidados.sala = req.body.sala;
  }

  if (req.body.fecha !== undefined) {
    if (!validarTextoEstricto(req.body.fecha)) {
      return res
        .status(400)
        .json({ error: "El campo 'fecha' debe ser un texto no vacío." });
    }
    datosValidados.fecha = req.body.fecha.trim();
  }

  if (req.body.turno !== undefined) {
    if (!TURNOS_VALIDOS.includes(req.body.turno)) {
      return res.status(400).json({ error: "El turno indicado no es válido." });
    }
    datosValidados.turno = req.body.turno;
  }

  if (req.body.personas !== undefined) {
    const p = req.body.personas;
    if (typeof p !== "number" || !Number.isInteger(p) || p < 1 || p > 6) {
      return res
        .status(400)
        .json({ error: "El campo 'personas' debe ser un entero entre 1 y 6." });
    }
    datosValidados.personas = p;
  }

  if (req.body.estado !== undefined) {
    if (!ESTADOS_VALIDOS.includes(req.body.estado)) {
      return res
        .status(400)
        .json({ error: "El estado debe ser 'pendiente' o 'confirmada'." });
    }
    datosValidados.estado = req.body.estado;
  }

  req.cambiosValidados = datosValidados;
  next();
}

module.exports = {
  prepararAreaReservas,
  validarReserva: validarCreacionReserva,
  validarCreacionReserva,
  validarConsultaReservas,
  validarReemplazoReserva,
  validarActualizacionParcial,
  validarId,
  SALAS_VALIDAS,
  TURNOS_VALIDOS,
  salasPermitidas: SALAS_VALIDAS,
  turnosPermitidos: TURNOS_VALIDOS,
};
