require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ============================================================================
// CONEXIONES A LAS DOS BASES DE DATOS
// ============================================================================

// 1. Pool para la Base de Datos Principal (Usuarios y Perfil)
const poolBolsa = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: 'bolsa_trabajo',
  password: process.env.DB_PASSWORD || 'gamer358',
  port: process.env.DB_PORT || 5432,
});

// 2. Pool para la Base de Datos del CV Builder (IA)
const poolCV = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: 'cv_builder_db',
  password: process.env.DB_PASSWORD || 'gamer358',
  port: process.env.DB_PORT || 5432,
});

// Verificar conexiones al arrancar
poolBolsa.connect((err, client, release) => {
  if (err) return console.error('🔴 Error conectando a bolsa_trabajo:', err.stack);
  console.log('✅ Conectado a la BD: bolsa_trabajo');
  release();
});

poolCV.connect((err, client, release) => {
  if (err) return console.error('🔴 Error conectando a cv_builder_db:', err.stack);
  console.log('✅ Conectado a la BD: cv_builder_db');
  release();
});

const pasarANull = (val) => {
  if (val === undefined || val === null) return null;
  if (typeof val === 'string' && val.trim() === '') return null;
  return val;
};

// ============================================================================
// ENDPOINTS DE USUARIO Y PERFIL (Usan poolBolsa)
// ============================================================================

app.post('/api/login', async (req, res) => {
  const { correo, password } = req.body;

  if (!correo || !password) {
    return res.status(400).json({ exito: false, mensaje: 'Correo y contraseña requeridos.' });
  }

  try {
    const result = await poolBolsa.query(
      'SELECT * FROM usuarios WHERE LOWER(TRIM(correo)) = LOWER(TRIM($1))', 
      [correo]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ exito: false, mensaje: 'Usuario no encontrado.' });
    }

    const usuario = result.rows[0];
    const hashAlmacenado = usuario.password_hash || usuario.password;

    if (!hashAlmacenado) {
      return res.status(500).json({ exito: false, mensaje: 'Error en la estructura del usuario.' });
    }

    const passwordCorrecta = await bcrypt.compare(password, hashAlmacenado);

    if (!passwordCorrecta) {
      return res.status(401).json({ exito: false, mensaje: 'Contraseña incorrecta.' });
    }

    // 1. Eliminar datos sensibles de seguridad
    delete usuario.password_hash;
    delete usuario.password;

    // 2. Garantizar que la propiedad 'rol' exista para el Frontend
    const correoLower = usuario.correo ? usuario.correo.toLowerCase() : '';
    usuario.rol = usuario.rol || (correoLower.includes('admin') ? 'admin' : 'ciudadano');

    // 3. Responder al frontend con el objeto de usuario listo
    res.json({ exito: true, usuario });

  } catch (error) {
    console.error('🔴 Error en login:', error);
    res.status(500).json({ exito: false, mensaje: 'Error al iniciar sesión.' });
  }
});

// GET: CONSULTAR PERFIL (Combina usuarios, usuarios_estudios y usuarios_experiencia)
app.get('/api/perfil/:curp', async (req, res) => {
  const curpLimpia = (req.params.curp || '').trim().toUpperCase();

  if (!curpLimpia) {
    return res.status(400).json({ exito: false, mensaje: 'CURP requerida.' });
  }

  try {
    const query = `
      SELECT 
        u.*,
        -- Campos de Estudios
        e.grado_estudios,
        e.titulado,
        e.profesion,
        e.estudias_actualmente,
        e.que_estudias,
        e.conocimientos_generales,
        -- Campos de Experiencia Laboral
        exp.empleo_solicitado,
        exp.segunda_opcion_empleo,
        exp.tiene_experiencia,
        exp.ultimo_empresa,
        exp.ultimo_puesto,
        exp.ultimo_funciones_tiempo,
        exp.experiencia_detalle,
        exp.experiencia_anios,
        exp.experiencia_meses,
        exp.habilidades_detalle
      FROM usuarios u
      LEFT JOIN usuarios_estudios e ON LOWER(TRIM(u.curp)) = LOWER(TRIM(e.usuario_curp))
      LEFT JOIN usuarios_experiencia exp ON LOWER(TRIM(u.curp)) = LOWER(TRIM(exp.usuario_curp))
      WHERE LOWER(TRIM(u.curp)) = LOWER(TRIM($1));
    `;

    const result = await poolBolsa.query(query, [curpLimpia]);

    if (result.rows.length === 0) {
      return res.status(404).json({ exito: false, mensaje: 'Usuario no encontrado.' });
    }

    const usuario = result.rows[0];
    delete usuario.password_hash;
    delete usuario.password;

    if (usuario.fecha_registro) {
      usuario.fecha_registro_formateada = new Date(usuario.fecha_registro).toLocaleDateString('es-MX', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    }

    res.json({ exito: true, usuario });
  } catch (error) {
    console.error('🔴 Error al consultar perfil:', error);
    res.status(500).json({ exito: false, mensaje: 'Error al consultar datos en el servidor.' });
  }
});

// PUT: ACTUALIZAR PERFIL (Guarda en usuarios, usuarios_estudios y usuarios_experiencia)
app.put('/api/perfil/:curp', async (req, res) => {
  const curpLimpia = (req.params.curp || '').trim().toUpperCase();

  if (!curpLimpia) {
    return res.status(400).json({ exito: false, mensaje: 'CURP requerida para actualizar.' });
  }

  const {
    nombre, primer_apellido, segundo_apellido, correo, fecha_nacimiento,
    sexo, edad, estado_civil, discapacidad, calle, letra_calle, numero,
    numero_calle, letra_numero, poblacion, colonia, codigo_postal, cp,
    telefono, telefono_fijo, celular, es_nuevo_comienzo, tipo_apoyo,
    contacto_nombre, contacto_parentesco, credencial_folio, credencial_vencimiento,
    // Sección Estudios
    grado_estudios, titulado, profesion, estudias_actualmente, que_estudias,
    conocimientos_generales,
    // Sección Experiencia Laboral
    empleo_solicitado, segunda_opcion_empleo, tiene_experiencia, ultimo_empresa,
    ultimo_puesto, ultimo_funciones_tiempo, experiencia_detalle, experiencia_anios,
    experiencia_meses, habilidades_detalle
  } = req.body;

  let sexoFormateado = 'O';
  if (sexo && typeof sexo === 'string') {
    const char = sexo.trim().toUpperCase().charAt(0);
    if (['H', 'M', 'O'].includes(char)) sexoFormateado = char;
  }

  const esNuevoComienzoBool = es_nuevo_comienzo === true || es_nuevo_comienzo === 'true';
  const estudiasActualmenteBool = estudias_actualmente === true || estudias_actualmente === 'true' || estudias_actualmente === 'Si';
  const tieneExperienciaBool = tiene_experiencia === true || tiene_experiencia === 'true' || tiene_experiencia === 'Si';
  const edadInt = edad ? parseInt(edad, 10) : null;
  const numCalleFinal = numero || numero_calle || null;
  const cpFinal = codigo_postal || cp || null;
  const telCelularFinal = celular || telefono || null;
  const aniosExp = experiencia_anios ? parseInt(experiencia_anios, 10) : 0;
  const mesesExp = experiencia_meses ? parseInt(experiencia_meses, 10) : 0;

  const client = await poolBolsa.connect();

  try {
    await client.query('BEGIN');

    // 1. UPDATE en la tabla usuarios
    const updateUsuariosQuery = `
      UPDATE usuarios SET
        nombre = $1, primer_apellido = $2, segundo_apellido = $3, correo = $4,
        fecha_nacimiento = $5, sexo = $6, edad = $7, estado_civil = $8,
        discapacidad = $9, calle = $10, letra_calle = $11, numero = $12,
        letra_numero = $13, poblacion = $14, colonia = $15, codigo_postal = $16,
        telefono_fijo = $17, celular = $18, es_nuevo_comienzo = $19, tipo_apoyo = $20,
        contacto_nombre = $21, contacto_parentesco = $22, credencial_folio = $23,
        credencial_vencimiento = $24
      WHERE LOWER(TRIM(curp)) = LOWER(TRIM($25))
      RETURNING *;
    `;

    const valoresUsuarios = [
      pasarANull(nombre), pasarANull(primer_apellido), pasarANull(segundo_apellido),
      correo ? correo.trim().toLowerCase() : null, pasarANull(fecha_nacimiento),
      sexoFormateado, isNaN(edadInt) ? null : edadInt, pasarANull(estado_civil),
      pasarANull(discapacidad) || 'NINGUNA', pasarANull(calle), pasarANull(letra_calle),
      pasarANull(numCalleFinal), pasarANull(letra_numero), pasarANull(poblacion) || 'MÉRIDA',
      pasarANull(colonia), pasarANull(cpFinal), pasarANull(telefono_fijo), pasarANull(telCelularFinal),
      esNuevoComienzoBool, pasarANull(tipo_apoyo), pasarANull(contacto_nombre),
      pasarANull(contacto_parentesco), pasarANull(credencial_folio), pasarANull(credencial_vencimiento),
      curpLimpia
    ];

    const resUsuarios = await client.query(updateUsuariosQuery, valoresUsuarios);

    if (resUsuarios.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ exito: false, mensaje: `No existe la CURP: ${curpLimpia}` });
    }

    // 2. UPSERT en la tabla usuarios_estudios
    const upsertEstudiosQuery = `
      INSERT INTO usuarios_estudios (
        usuario_curp, grado_estudios, titulado, profesion,
        estudias_actualmente, que_estudias, conocimientos_generales
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (usuario_curp)
      DO UPDATE SET
        grado_estudios = EXCLUDED.grado_estudios, titulado = EXCLUDED.titulado,
        profesion = EXCLUDED.profesion, estudias_actualmente = EXCLUDED.estudias_actualmente,
        que_estudias = EXCLUDED.que_estudias, conocimientos_generales = EXCLUDED.conocimientos_generales,
        fecha_actualizacion = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    const valoresEstudios = [
      curpLimpia, pasarANull(grado_estudios), pasarANull(titulado) || 'No',
      pasarANull(profesion), estudiasActualmenteBool, pasarANull(que_estudias),
      pasarANull(conocimientos_generales)
    ];

    const resEstudios = await client.query(upsertEstudiosQuery, valoresEstudios);

    // 3. UPSERT en la tabla usuarios_experiencia
    const upsertExperienciaQuery = `
      INSERT INTO usuarios_experiencia (
        usuario_curp, empleo_solicitado, segunda_opcion_empleo, tiene_experiencia,
        ultimo_empresa, ultimo_puesto, ultimo_funciones_tiempo, experiencia_detalle,
        experiencia_anios, experiencia_meses, habilidades_detalle
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (usuario_curp)
      DO UPDATE SET
        empleo_solicitado = EXCLUDED.empleo_solicitado,
        segunda_opcion_empleo = EXCLUDED.segunda_opcion_empleo,
        tiene_experiencia = EXCLUDED.tiene_experiencia,
        ultimo_empresa = EXCLUDED.ultimo_empresa,
        ultimo_puesto = EXCLUDED.ultimo_puesto,
        ultimo_funciones_tiempo = EXCLUDED.ultimo_funciones_tiempo,
        experiencia_detalle = EXCLUDED.experiencia_detalle,
        experiencia_anios = EXCLUDED.experiencia_anios,
        experiencia_meses = EXCLUDED.experiencia_meses,
        habilidades_detalle = EXCLUDED.habilidades_detalle,
        fecha_actualizacion = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    const valoresExperiencia = [
      curpLimpia, pasarANull(empleo_solicitado), pasarANull(segunda_opcion_empleo),
      tieneExperienciaBool, pasarANull(ultimo_empresa), pasarANull(ultimo_puesto),
      pasarANull(ultimo_funciones_tiempo), pasarANull(experiencia_detalle),
      isNaN(aniosExp) ? 0 : aniosExp, isNaN(mesesExp) ? 0 : mesesExp,
      pasarANull(habilidades_detalle)
    ];

    const resExperiencia = await client.query(upsertExperienciaQuery, valoresExperiencia);

    await client.query('COMMIT');

    const usuarioActualizado = { 
      ...resUsuarios.rows[0], 
      ...resEstudios.rows[0],
      ...resExperiencia.rows[0]
    };
    delete usuarioActualizado.password_hash;
    delete usuarioActualizado.password;

    res.json({ exito: true, mensaje: 'Perfil actualizado exitosamente.', usuario: usuarioActualizado });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('🔴 Error al actualizar:', error.message);
    res.status(500).json({ exito: false, mensaje: `Error en BD: ${error.message}` });
  } finally {
    client.release();
  }
});

// ============================================================================
// ENDPOINTS DEL GENERADOR DE CV CON IA (Usarán poolCV)
// ============================================================================

app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en el puerto ${PORT}`);
});