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
  password: process.env.DB_PASSWORD || 'Moises#510', // Reemplaza por tu contraseña real  
  //password: process.env.DB_PASSWORD || 'gamer358', // Reemplaza por tu contraseña real
  port: process.env.DB_PORT || 5432,
});

// Endpoint de Registro de Usuarios
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

  // 1. Validación de campos obligatorios básicos
  if (!curp || !correo || !password) {
    return res.status(400).json({
      exito: false,
      mensaje: 'La CURP, el correo electrónico y la contraseña son campos obligatorios.'
    });
  }

  const curpLimpia = curp.trim().toUpperCase();
  const correoLimpio = correo.trim().toLowerCase();

  // Convertir "Hombre", "Mujer", "Otro" a un solo carácter ('H', 'M', 'O')
  let sexoFormateado = 'O';
  if (sexo && typeof sexo === 'string') {
    sexoFormateado = sexo.trim().charAt(0).toUpperCase();
  }

  try {
    // 2. Verificar si la CURP ya está registrada
    const checkCurp = await pool.query('SELECT curp FROM usuarios WHERE curp = $1', [curpLimpia]);
    if (checkCurp.rows.length > 0) {
      return res.status(409).json({
        exito: false,
        codigo: 'CURP_DUPLICADA',
        mensaje: 'Esta CURP ya se encuentra registrada en el sistema. Si ya tienes una cuenta, por favor inicia sesión o recupera tu contraseña.'
      });
    }

    // 3. Verificar si el correo ya está registrado
    const checkCorreo = await pool.query('SELECT correo FROM usuarios WHERE correo = $1', [correoLimpio]);
    if (checkCorreo.rows.length > 0) {
      return res.status(409).json({
        exito: false,
        codigo: 'CORREO_DUPLICADO',
        mensaje: 'Este correo electrónico ya está asociado a otra cuenta registrada.'
      });
    }

    // 4. Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 5. Inserción en la base de datos
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
      sexoFormateado, // <--- Aquí ya enviamos un solo carácter (H, M o O)
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose correctamente en el puerto ${PORT}`);
});