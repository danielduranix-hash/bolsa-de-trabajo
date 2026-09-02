// js/admin.js

document.addEventListener('DOMContentLoaded', () => {
  const usuario = JSON.parse(localStorage.getItem('usuarioActivo'));

  // Protección de ruta: Si no inició sesión o es rol 'ciudadano', lo expulsa
  if (!usuario || (usuario.rol !== 'admin' && usuario.rol !== 'superadmin')) {
    alert('Acceso restringido a administradores.');
    window.location.href = 'index.html';
    return;
  }

  // Cargar sección por defecto
  cambiarSeccionAdmin('vacantes');
});

// Función para cambiar el contenido de la vista administrativa
function cambiarSeccionAdmin(seccion) {
  const contenedor = document.getElementById('admin-contenido');
  if (!contenedor) return;

  switch (seccion) {
    case 'empresas':
      contenedor.innerHTML = '<h3>Gestión de Empresas</h3><p>Lista y registro de empresas.</p>';
      break;
    case 'vacantes':
      contenedor.innerHTML = '<h3>Gestión de Vacantes</h3><p>Tabla de vacantes con filtros.</p>';
      break;
    case 'ciudadania':
      contenedor.innerHTML = '<h3>Gestión de Ciudadanía</h3><p>Control de usuarios registrados.</p>';
      break;
    case 'postulaciones':
      contenedor.innerHTML = '<h3>Historial de Postulaciones</h3><p>Postulaciones activas.</p>';
      break;
    case 'catalogos':
      contenedor.innerHTML = '<h3>Catálogos del Sistema</h3><p>Ajustes de sectores y opciones.</p>';
      break;
  }
}