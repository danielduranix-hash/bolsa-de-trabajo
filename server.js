require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const nodemailer = require('nodemailer'); //para correos

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.static(__dirname));

app.use(cors());
app.use(express.json());

// CONEXIONES A LAS DOS BASES DE DATOS

// 1. Configuración de la Base de Datos Principal
const dbConfig = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false
  }
};

// 2. Instanciar el Pool principal
const poolBolsa = new Pool(dbConfig);

// 3. Verificar conexión al arrancar
poolBolsa.connect((err, client, release) => {
  if (err) return console.error('🔴 Error conectando a la BD:', err.stack);
  console.log('✅ Conectado a Neon en la BD:', process.env.DB_NAME);
  release();
});

// =====================================================
// CONFIGURACIÓN DE CORREO (SMTP)
// =====================================================
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false, // false para puerto 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

// Verificar conexión SMTP al arrancar
transporter.verify((error, success) => {
  if (error) {
    console.error('🔴 Error en configuración de correo:', error.message);
  } else {
    console.log('📧 Servidor de correo listo para enviar');
  }
});

const pasarANull = (val) => {
  if (val === undefined || val === null) return null;
  if (typeof val === 'string' && val.trim() === '') return null;
  return val;
};

// ENDPOINTS DE USUARIO Y PERFIL (Usan poolBolsa)

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

// ENDPOINT DE REGISTRO
app.post('/api/registro', async (req, res) => {
  const { curp, correo, password, nombre, primer_apellido, segundo_apellido, fecha_nacimiento, sexo } = req.body;

  if (!curp || !correo || !password || !nombre || !primer_apellido) {
    return res.status(400).json({ exito: false, mensaje: 'Faltan campos obligatorios para el registro.' });
  }

  const curpLimpia = curp.trim().toUpperCase();
  const correoLimpio = correo.trim().toLowerCase();

  try {
    // 1. Verificar si el CURP o correo ya existen en Neon
    const verificar = await poolBolsa.query(
      'SELECT * FROM usuarios WHERE curp = $1 OR LOWER(correo) = $2',
      [curpLimpia, correoLimpio]
    );

    if (verificar.rows.length > 0) {
      return res.status(400).json({ exito: false, mensaje: 'Atención: El CURP o correo ingresado ya existe en el sistema.' });
    }

    // 2. Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Insertar el nuevo usuario en Neon
    const queryInsert = `
      INSERT INTO usuarios (
        curp, correo, password_hash, nombre, primer_apellido, segundo_apellido, 
        fecha_nacimiento, sexo, fecha_registro, lugar_registro
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, 'INTERNET')
      RETURNING curp, correo, nombre, primer_apellido;
    `;

    const valores = [
      curpLimpia,
      correoLimpio,
      passwordHash,
      nombre.trim(),
      primer_apellido.trim(),
      pasarANull(segundo_apellido),
      pasarANull(fecha_nacimiento),
      sexo ? sexo.trim().toUpperCase() : 'O'
    ];

    const nuevoUsuario = await poolBolsa.query(queryInsert, valores);

    res.status(201).json({ 
      exito: true, 
      mensaje: 'Usuario registrado exitosamente.', 
      usuario: nuevoUsuario.rows[0] 
    });

  } catch (error) {
    console.error('🔴 Error al registrar usuario:', error.message);
    res.status(500).json({ exito: false, mensaje: `Error en el servidor: ${error.message}` });
  }
});

// ENDPOINTS DE ADMINISTRACIÓN (Usan poolBolsa)
// GET: OBTENER TODOS LOS CIUDADANOS
app.get('/api/admin/ciudadanos', async (req, res) => {
  try {
    const result = await poolBolsa.query('SELECT * FROM public.usuarios ORDER BY curp DESC');

    const usuarios = result.rows.map(u => ({
      id: u.curp || u.id,
      curp: u.curp || '',
      folio: u.credencial_folio || u.folio || u.curp || 'S/N',
      correo: u.correo || 'Sin correo',
      nombre: u.nombre || '',
      primer_apellido: u.primer_apellido || u.paterno || '',
      segundo_apellido: u.segundo_apellido || u.materno || '',
      anotaciones: u.anotaciones || '',
      activo: u.activo !== false,
      disponible: u.disponible !== false
    }));

    return res.status(200).json(usuarios);
  } catch (error) {
    console.error('🔴 Error en base de datos:', error.message);
    return res.status(500).json({ 
      exito: false, 
      mensaje: `Error en la base de datos: ${error.message}` 
    });
  }
});

// ENDPOINTS DE EVENTOS DEL CALENDARIO

// 1. NUEVO GET: Obtener TODOS los eventos (para pintar el calendario general completo)
app.get('/api/eventos', async (req, res) => {
  try {
    const result = await poolBolsa.query(
      'SELECT * FROM eventos_calendario ORDER BY fecha_evento ASC'
    );
    res.json({ exito: true, eventos: result.rows });
  } catch (error) {
    console.error('🔴 Error al obtener todos los eventos:', error.message);
    res.status(500).json({ exito: false, mensaje: 'Error al cargar los eventos del calendario.' });
  }
});

// 2. CONSERVAR GET: Obtener eventos por tipo (útil si filtras individualmente por categoría)
app.get('/api/eventos/:tipo', async (req, res) => {
  const tipo = req.params.tipo;
  try {
    const result = await poolBolsa.query(
      'SELECT * FROM eventos_calendario WHERE tipo_evento = $1 ORDER BY fecha_evento ASC',
      [tipo]
    );
    res.json({ exito: true, eventos: result.rows });
  } catch (error) {
    console.error('🔴 Error al obtener eventos por tipo:', error.message);
    res.status(500).json({ exito: false, mensaje: 'Error al cargar los eventos.' });
  }
});

// 3. CONSERVAR POST: Crear un evento (lo usará el Admin para insertar nuevas fechas)
app.post('/api/eventos', async (req, res) => {
  const { tipo_evento, titulo, descripcion, fecha_evento, horario, lugar } = req.body;
  try {
    const query = `
      INSERT INTO eventos_calendario (tipo_evento, titulo, descripcion, fecha_evento, horario, lugar)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const values = [tipo_evento, titulo, descripcion, fecha_evento, horario, lugar];
    const nuevoEvento = await poolBolsa.query(query, values);
    res.status(201).json({ exito: true, mensaje: 'Evento creado exitosamente', evento: nuevoEvento.rows[0] });
  } catch (error) {
    console.error('🔴 Error al crear evento:', error.message);
    res.status(500).json({ exito: false, mensaje: 'Error al guardar el evento.' });
  }
});

// =====================================================
// ENDPOINTS DE CONSULTAS CIUDADANAS ("¿Qué dudas tienes?")
// =====================================================

// POST: Guardar una nueva consulta Y enviar correo
app.post('/api/consultas', async (req, res) => {
  const {
    nombre_completo,
    correo,
    confirmacion_correo,
    telefono,
    comentarios,
    acepta_terminos
  } = req.body;

  // ============ VALIDACIONES ============
  if (!nombre_completo || !correo || !telefono || !comentarios) {
    return res.status(400).json({
      exito: false,
      mensaje: 'Todos los campos son obligatorios.'
    });
  }

  if (correo.toLowerCase() !== confirmacion_correo.toLowerCase()) {
    return res.status(400).json({
      exito: false,
      mensaje: 'Los correos no coinciden.'
    });
  }

  if (!acepta_terminos) {
    return res.status(400).json({
      exito: false,
      mensaje: 'Debes aceptar los términos y condiciones.'
    });
  }

  if (!/^\d{10}$/.test(telefono)) {
    return res.status(400).json({
      exito: false,
      mensaje: 'El teléfono debe tener 10 dígitos.'
    });
  }

  try {
    // ============ 1. GUARDAR EN LA BASE DE DATOS ============
    const query = `
      INSERT INTO consultas_ciudadanas 
        (nombre_completo, correo, telefono, comentarios)
      VALUES ($1, $2, $3, $4)
      RETURNING id, fecha_envio;
    `;

    const valores = [
      nombre_completo.trim(),
      correo.trim().toLowerCase(),
      telefono.trim(),
      comentarios.trim()
    ];

    const resultado = await poolBolsa.query(query, valores);
    const idConsulta = resultado.rows[0].id;
    const fechaEnvio = resultado.rows[0].fecha_envio;

    // ============ 2. ENVIAR CORREO ============
    const correoDestino = process.env.CORREO_DESTINO || process.env.SMTP_USER;

    const opcionesCorreo = {
      from: `"${process.env.SMTP_FROM_NAME || 'Bolsa de Trabajo'}" <${process.env.SMTP_USER}>`,
      to: correoDestino,
      replyTo: correo,
      subject: `📩 Nueva consulta ciudadana #${idConsulta}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #0d3c75, #1e3a8a); color: white; padding: 25px; border-radius: 8px 8px 0 0; }
            .header h1 { margin: 0; font-size: 22px; }
            .header p { margin: 5px 0 0 0; opacity: 0.9; font-size: 14px; }
            .content { background: #f8fafc; padding: 25px; border-radius: 0 0 8px 8px; }
            .campo { margin-bottom: 18px; }
            .etiqueta { font-weight: bold; color: #0d3c75; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px; }
            .valor { background: white; padding: 12px 16px; border-radius: 6px; border: 1px solid #e2e8f0; font-size: 14px; }
            .comentarios { background: white; padding: 16px; border-radius: 6px; border-left: 4px solid #10b981; white-space: pre-wrap; font-size: 14px; }
            .footer { text-align: center; color: #94a3b8; font-size: 11px; margin-top: 25px; padding-top: 15px; border-top: 1px solid #e2e8f0; }
            a { color: #0d3c75; text-decoration: none; }
            a:hover { text-decoration: underline; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📩 Nueva consulta ciudadana</h1>
              <p>Consulta #${idConsulta}</p>
            </div>
            <div class="content">
              <div class="campo">
                <div class="etiqueta">Nombre completo</div>
                <div class="valor">${nombre_completo}</div>
              </div>
              <div class="campo">
                <div class="etiqueta">Correo electrónico</div>
                <div class="valor"><a href="mailto:${correo}">${correo}</a></div>
              </div>
              <div class="campo">
                <div class="etiqueta">Teléfono</div>
                <div class="valor">${telefono}</div>
              </div>
              <div class="campo">
                <div class="etiqueta">Comentarios</div>
                <div class="comentarios">${comentarios}</div>
              </div>
              <div class="footer">
                Recibido el ${new Date(fechaEnvio).toLocaleString('es-MX', { 
                  dateStyle: 'long', 
                  timeStyle: 'short' 
                })}<br>
                Bolsa de Trabajo Municipal de Mérida
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Nueva consulta ciudadana #${idConsulta}

Nombre: ${nombre_completo}
Correo: ${correo}
Teléfono: ${telefono}

Comentarios:
${comentarios}

Recibido: ${new Date(fechaEnvio).toLocaleString('es-MX')}
      `
    };

    // Enviar el correo (con try/catch para que no tumbe la operación)
    try {
      await transporter.sendMail(opcionesCorreo);
      console.log(`📧 Correo enviado a ${correoDestino} (consulta #${idConsulta})`);
    } catch (emailError) {
      // Si falla el correo, la consulta YA ESTÁ guardada en la BD
      console.error('⚠️ Error al enviar correo:', emailError.message);
    }

    // ============ 3. RESPONDER AL FRONTEND ============
    res.status(201).json({
      exito: true,
      mensaje: '¡Tu consulta ha sido enviada exitosamente!',
      id_consulta: idConsulta,
      fecha_envio: fechaEnvio
    });

  } catch (error) {
    console.error('🔴 Error al guardar consulta:', error.message);
    res.status(500).json({
      exito: false,
      mensaje: 'Error al guardar la consulta. Intenta de nuevo.'
    });
  }
});

// GET: Listar todas las consultas (para el panel admin)
app.get('/api/consultas', async (req, res) => {
  try {
    const soloNoLeidas = req.query.no_leidas === 'true';

    const query = soloNoLeidas
      ? 'SELECT * FROM consultas_ciudadanas WHERE leido = FALSE ORDER BY fecha_envio DESC'
      : 'SELECT * FROM consultas_ciudadanas ORDER BY fecha_envio DESC';

    const result = await poolBolsa.query(query);

    res.json({
      exito: true,
      total: result.rows.length,
      consultas: result.rows
    });

  } catch (error) {
    console.error('🔴 Error al listar consultas:', error.message);
    res.status(500).json({
      exito: false,
      mensaje: 'Error al cargar las consultas.'
    });
  }
});

// PUT: Marcar una consulta como leída
app.put('/api/consultas/:id/leido', async (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({ exito: false, mensaje: 'ID inválido.' });
  }

  try {
    const result = await poolBolsa.query(
      'UPDATE consultas_ciudadanas SET leido = TRUE WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ exito: false, mensaje: 'Consulta no encontrada.' });
    }

    res.json({ exito: true, consulta: result.rows[0] });

  } catch (error) {
    console.error('🔴 Error al marcar como leída:', error.message);
    res.status(500).json({ exito: false, mensaje: 'Error al actualizar.' });
  }
});

// ENDPOINTS DEL GENERADOR DE CV CON IA (Usarán poolCV)

app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en el puerto ${PORT}`);
});