// =====================================================
// SERVICIO DE CORREOS - correo-e.js
// =====================================================
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// =====================================================
// CONFIGURACIÓN DEL TRANSPORTER (SMTP)
// =====================================================
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

// Verificar conexión SMTP al arrancar
function verificarConexionSMTP() {
  transporter.verify((error, success) => {
    if (error) {
      console.error('🔴 Error en configuración de correo:', error.message);
    } else {
      console.log('📧 Servidor de correo listo para enviar');
    }
  });
}

// =====================================================
// CARGAR PLANTILLA HTML DEL CORREO
// =====================================================
function cargarPlantilla(nombreArchivo) {
  const ruta = path.join(__dirname, '..', 'templates', nombreArchivo);
  return fs.readFileSync(ruta, 'utf8');
}

// Reemplazar variables en la plantilla
function renderizarPlantilla(plantilla, variables) {
  let html = plantilla;
  for (const [clave, valor] of Object.entries(variables)) {
    const regex = new RegExp(`{{${clave}}}`, 'g');
    html = html.replace(regex, valor || '');
  }
  return html;
}

// =====================================================
// FUNCIÓN: ENVIAR CORREO DE CONSULTA CIUDADANA
// =====================================================
async function enviarCorreoConsulta(datos) {
  const {
    idConsulta,
    nombre_completo,
    correo,
    telefono,
    comentarios,
    fechaEnvio
  } = datos;

  const correoDestino = process.env.CORREO_DESTINO || process.env.SMTP_USER;
  const nombreRemitente = process.env.SMTP_FROM_NAME || 'Bolsa de Trabajo';

  // Formatear fecha en zona horaria de México
  const fechaFormateada = new Date(fechaEnvio).toLocaleString('es-MX', {
    timeZone: 'America/Mexico_City',
    dateStyle: 'long',
    timeStyle: 'short'
  });

  // Cargar y renderizar la plantilla HTML
  const plantilla = cargarPlantilla('correoConsulta.html');
  const htmlRenderizado = renderizarPlantilla(plantilla, {
    idConsulta,
    nombre_completo,
    correo,
    telefono,
    comentarios,
    fechaEnvio: fechaFormateada
  });

   // Ruta de la imagen del logo
  const rutaImagen = path.join(__dirname, '..', 'public', 'images', 'logo-merida.png');

  const opcionesCorreo = {
    from: `"${nombreRemitente}" <${process.env.SMTP_USER}>`,
    to: correoDestino,
    replyTo: correo,
    subject: `📩 Nueva consulta ciudadana #${idConsulta}`,
    html: htmlRenderizado,
    text: `
consulta ciudadana #${idConsulta}

Nombre: ${nombre_completo}
Correo: ${correo}
Teléfono: ${telefono}

Comentarios:
${comentarios}

Recibido: ${fechaFormateada}
    `,
    attachments: [
      {
        filename: 'logo-merida.png',
        path: rutaImagen,
        cid: 'logoConsulta'
      }
    ]
  };

  try {
    await transporter.sendMail(opcionesCorreo);
    console.log(`📧 Correo enviado a ${correoDestino} (consulta #${idConsulta})`);
    return { exito: true };
  } catch (error) {
    console.error('⚠️ Error al enviar correo:', error.message);
    return { exito: false, error: error.message };
  }
}

// =====================================================
// EXPORTAR FUNCIONES
// =====================================================
module.exports = {
  verificarConexionSMTP,
  enviarCorreoConsulta,
  transporter
};