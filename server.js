const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Configuración de conexión a PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'bolsa_trabajo',
  password: process.env.DB_PASSWORD || 'gamer358',
  port: process.env.DB_PORT || 5432,
});

// ============================================================================
// 1. ENDPOINT DE REGISTRO DE USUARIOS
// ============================================================================
app.post('/api/registro', async (req, res) => {
  const {
    curp,
    nombre,
    primer_apellido,
    segundo_apellido,
    correo,
    password,
    fecha_nacimiento,
    sexo,
    pertenece_grupo_vulnerable,
    grupos_vulnerables,
    tiene_discapacidad,
    tipos_discapacidad
  } = req.body;

  if (!curp || !correo || !password) {
    return res.status(400).json({
      exito: false,
      mensaje: 'La CURP, el correo electrónico y la contraseña son campos obligatorios.'
    });
  }

  const curpLimpia = curp.trim().toUpperCase();
  const correoLimpio = correo.trim().toLowerCase();

  const regexCurp = /^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[A-Z0-9]{2}$/;
  if (!regexCurp.test(curpLimpia)) {
    return res.status(400).json({
      exito: false,
      mensaje: 'La CURP ingresada es inválida. Debe tener el formato oficial de 18 caracteres.'
    });
  }

  let sexoFormateado = 'O';
  if (sexo && typeof sexo === 'string') {
    const char = sexo.trim().toUpperCase().charAt(0);
    if (['H', 'M', 'O'].includes(char)) {
      sexoFormateado = char;
    }
  }

  try {
    const checkCurp = await pool.query('SELECT curp FROM usuarios WHERE curp = $1', [curpLimpia]);
    if (checkCurp.rows.length > 0) {
      return res.status(409).json({
        exito: false,
        codigo: 'CURP_DUPLICADA',
        mensaje: 'Esta CURP ya se encuentra registrada en el sistema.'
      });
    }

    const checkCorreo = await pool.query('SELECT correo FROM usuarios WHERE correo = $1', [correoLimpio]);
    if (checkCorreo.rows.length > 0) {
      return res.status(409).json({
        exito: false,
        codigo: 'CORREO_DUPLICADO',
        mensaje: 'Este correo electrónico ya está asociado a otra cuenta registrada.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const insertQuery = `
      INSERT INTO usuarios (
        curp, nombre, primer_apellido, segundo_apellido, correo, 
        password_hash, fecha_nacimiento, sexo, pertenece_grupo_vulnerable, 
        grupos_vulnerables, tiene_discapacidad, tipos_discapacidad
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `;

    await pool.query(insertQuery, [
      curpLimpia,
      nombre || 'Sin Nombre',
      primer_apellido || 'Sin Apellido',
      segundo_apellido || null,
      correoLimpio,
      passwordHash,
      fecha_nacimiento || null,
      sexoFormateado,
      pertenece_grupo_vulnerable ?? false,
      Array.isArray(grupos_vulnerables) ? grupos_vulnerables : [],
      tiene_discapacidad ?? false,
      Array.isArray(tipos_discapacidad) ? tipos_discapacidad : []
    ]);

    res.status(201).json({
      exito: true,
      mensaje: 'Registro completado exitosamente.'
    });

  } catch (error) {
    console.error('Error detallado devuelto por PostgreSQL:', error);
    res.status(500).json({
      exito: false,
      mensaje: `Ocurrió un error en el servidor al procesar el registro: ${error.message}`
    });
  }
});

// ============================================================================
// 2. ENDPOINT DE LOGIN
// ============================================================================
app.post('/api/login', async (req, res) => {
  const { correo, password } = req.body;

  if (!correo || !password) {
    return res.status(400).json({ exito: false, mensaje: 'Correo y contraseña requeridos.' });
  }

  try {
    const result = await pool.query('SELECT * FROM usuarios WHERE correo = $1', [correo.trim().toLowerCase()]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ exito: false, mensaje: 'Usuario no encontrado.' });
    }

    const usuario = result.rows[0];
    const passwordCorrecta = await bcrypt.compare(password, usuario.password_hash);

    if (!passwordCorrecta) {
      return res.status(401).json({ exito: false, mensaje: 'Contraseña incorrecta.' });
    }

    delete usuario.password_hash;

    res.json({ exito: true, usuario });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ exito: false, mensaje: 'Error al iniciar sesión.' });
  }
});

// ============================================================================
// 3. ENDPOINT PARA CONSULTAR EL PERFIL (GET)
// ============================================================================
app.get('/api/perfil/:curp', async (req, res) => {
  const { curp } = req.params;

  try {
    const result = await pool.query('SELECT * FROM usuarios WHERE curp = $1', [curp.toUpperCase()]);

    if (result.rows.length === 0) {
      return res.status(404).json({ exito: false, mensaje: 'Usuario no encontrado.' });
    }

    const usuario = result.rows[0];
    delete usuario.password_hash;

    res.json({ exito: true, usuario });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ exito: false, mensaje: 'Error al consultar datos del usuario.' });
  }
});

// ============================================================================
// 4. ENDPOINT PARA ACTUALIZAR EL PERFIL (PUT)
// ============================================================================
app.put('/api/perfil/:curp', async (req, res) => {
  const { curp } = req.params;
  const {
    nombre,
    primer_apellido,
    segundo_apellido,
    correo,
    fecha_nacimiento,
    sexo,
    estado_civil,
    discapacidad,
    calle,
    letra_calle,
    numero,
    letra_numero,
    poblacion,
    colonia,
    codigo_postal,
    telefono_fijo,
    celular,
    es_nuevo_comienzo,
    tipo_apoyo,
    contacto_nombre,
    contacto_parentesco,
    credencial_folio,
    credencial_vencimiento
  } = req.body;

  let sexoFormateado = 'O';
  if (sexo && typeof sexo === 'string') {
    const char = sexo.trim().toUpperCase().charAt(0);
    if (['H', 'M', 'O'].includes(char)) {
      sexoFormateado = char;
    }
  }

  try {
    const updateQuery = `
      UPDATE usuarios SET
        nombre = $1,
        primer_apellido = $2,
        segundo_apellido = $3,
        correo = $4,
        fecha_nacimiento = $5,
        sexo = $6,
        estado_civil = $7,
        discapacidad = $8,
        calle = $9,
        letra_calle = $10,
        numero = $11,
        letra_numero = $12,
        poblacion = $13,
        colonia = $14,
        codigo_postal = $15,
        telefono_fijo = $16,
        celular = $17,
        es_nuevo_comienzo = $18,
        tipo_apoyo = $19,
        contacto_nombre = $20,
        contacto_parentesco = $21,
        credencial_folio = $22,
        credencial_vencimiento = $23
      WHERE curp = $24
    `;

    await pool.query(updateQuery, [
      nombre,
      primer_apellido,
      segundo_apellido || null,
      correo ? correo.toLowerCase() : null,
      fecha_nacimiento || null,
      sexoFormateado,
      estado_civil || null,
      discapacidad || 'NINGUNA',
      calle || null,
      letra_calle || null,
      numero || null,
      letra_numero || null,
      poblacion || 'MÉRIDA',
      colonia || null,
      codigo_postal || null,
      telefono_fijo || null,
      celular || null,
      es_nuevo_comienzo ?? false,
      tipo_apoyo || null,
      contacto_nombre || null,
      contacto_parentesco || null,
      credencial_folio || null,
      credencial_vencimiento || null,
      curp.toUpperCase()
    ]);

    res.json({ exito: true, mensaje: 'Perfil actualizado exitosamente.' });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ exito: false, mensaje: `Error al actualizar perfil: ${error.message}` });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose correctamente en el puerto ${PORT}`);
});