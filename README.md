# Trabajo práctico 10 - Consultas de reservas paso a paso

## 1. Origen del proyecto y cambios respecto al TP 09
Para este trabajo tomé como base mi entrega funcional del TP 09 (`tp-09-salas-crud-mongodb`). En aquella entrega se consolidó el ciclo CRUD persistente completo (GET, POST, PUT, PATCH y DELETE) sobre MongoDB Atlas.
En esta unidad se añadieron capacidades de lectura avanzada sobre el endpoint `GET /api/reservas`:
* **Separación de responsabilidades de lectura**: Se preservó la función `listar()` para abastecer las vistas web HTML tradicionales (`/reservas`) devolviendo todos los registros sin alterar la interfaz visual, mientras que se implementó la función `consultar()` para dar soporte a las operaciones filtradas, ordenadas y paginadas de la API JSON.
* **Filtro textual exacto**: Filtrado por `sala` aplicando recorte de espacios (`trim`). Si no hay coincidencias se responde con código HTTP 200 y conjunto vacío.
* **Criterio de orden dinámico (`orden`)**: Traducción controlada de las opciones `estudiante` (alfabético ascendente por defecto), `personas-asc` y `personas-desc` hacia objetos de ordenamiento de Mongoose, aplicando desempate determinista por `_id: 1`.
* **Paginación formal**: Incorporación de los parámetros `pagina` (default 1) y `limite` (default 2), calculando saltos (`skip`) y límites (`limit`), respondiendo un objeto con metadatos (`total`, `pagina`, `limite`, `paginas` y `datos`).
* **Validación estricta de parámetros de consulta**: Rechazo con código HTTP 400 ante parámetros desconocidos, duplicados o con tipos y rangos fuera de norma.

## 2. Tecnologías y versiones
* Node.js: v24.x (CommonJS)
* MongoDB Atlas: Clúster Free (M0)
* Mongoose: v8.x
* Express: v4.x
* EJS y express-ejs-layouts

## 3. Configuración del entorno
1. La base de datos asignada para esta unidad en MongoDB Atlas es `reservas_salas_u10` (colección `reservas`).
2. Se mantiene la resolución de DNS en `src/config/base-datos.js` mediante servidores públicos (`8.8.8.8` y `1.1.1.1`) para garantizar conectividad con Atlas.
3. Archivo `.env` local (ignorado mediante `.gitignore`):
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb+srv://USUARIO:CLAVE@HOST/reservas_salas_u10?retryWrites=true&w=majority