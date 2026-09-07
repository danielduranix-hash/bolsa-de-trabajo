// js/admin.js

document.addEventListener('DOMContentLoaded', () => {
  const usuario = JSON.parse(localStorage.getItem('usuarioActivo'));

  // Protección de ruta: Si no inició sesión o no es rol administrador, redirige al index
  if (!usuario || (usuario.rol !== 'admin' && usuario.rol !== 'superadmin')) {
    alert('Acceso restringido a administradores.');
    window.location.href = 'index.html';
    return;
  }
  document.getElementById('btn-cerrar-sesion')?.addEventListener('click', () => {
    localStorage.removeItem('usuarioActivo');
    window.location.href = 'index.html';
  });

  // Cargar sección inicial (por ejemplo, Ciudadanía)
  cambiarSeccionAdmin('ciudadania');

  // Cargar la sección por defecto al iniciar
  cambiarSeccionAdmin('vacantes');
});

// Función para cambiar el contenido del panel administrativo
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
      renderizarSeccionCiudadania(contenedor);
      cargarTablaCiudadanos();
      break;
    case 'postulaciones':
      contenedor.innerHTML = '<h3>Historial de Postulaciones</h3><p>Postulaciones activas.</p>';
      break;
    case 'catalogos':
      contenedor.innerHTML = '<h3>Catálogos del Sistema</h3><p>Ajustes de sectores y opciones.</p>';
      break;
  }
}

/* ==========================================================================
   MÓDULO DE CIUDADANÍA (SUPERADMINISTRADOR)
   ========================================================================== */

// 1. Inyecta la interfaz gráfica de Ciudadanía y registra sus eventos
function renderizarSeccionCiudadania(contenedor) {
  contenedor.innerHTML = `
    <div class="ciudadania-container">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <h2>Ciudadanía <button id="btnAgregarCiudadano" class="btn-action btn-blue" style="font-size: 14px; padding: 5px 12px; width: auto;">Agregar</button></h2>
      </div>

      <!-- Filtros superiores -->
      <div style="display: flex; gap: 20px; margin-bottom: 15px; align-items: center;">
        <label style="font-size: 14px;">
          Disponibles:
          <select id="filtroDisponibles" style="padding: 4px; margin-left: 5px;">
            <option value="todos">Todos</option>
            <option value="si">Disponibles</option>
            <option value="no">No Disponibles</option>
          </select>
        </label>

        <label style="font-size: 14px;">
          Suspendidos:
          <select id="filtroSuspendidos" style="padding: 4px; margin-left: 5px;">
            <option value="todos">Todos</option>
            <option value="activos">Activos</option>
            <option value="suspendidos">Suspendidos</option>
          </select>
        </label>
      </div>

      <!-- Buscador por folio/correo -->
      <div style="margin-bottom: 15px;">
        <input 
          type="text" 
          id="inputBuscarCiudadano" 
          placeholder="Buscar por Folio, Correo, Nombre o Apellidos..." 
          style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;"
        >
      </div>

      <!-- Tabla de Ciudadanos -->
      <div style="overflow-x: auto; background: #fff; border: 1px solid #ddd; border-radius: 4px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <thead>
            <tr style="background-color: #f8f9fa; border-bottom: 2px solid #dee2e6; text-align: left;">
              <th style="padding: 10px;">Folio/Correo</th>
              <th style="padding: 10px;">Nombre</th>
              <th style="padding: 10px;">A. paterno</th>
              <th style="padding: 10px;">A. materno</th>
              <th style="padding: 10px;">Anotaciones</th>
              <th style="padding: 10px;">Acciones</th>
            </tr>
          </thead>
          <tbody id="tbodyCiudadanos">
            <tr>
              <td colspan="6" style="text-align: center; padding: 15px;">Cargando registros...</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Asignar evento al botón "Agregar"
  document.getElementById('btnAgregarCiudadano')?.addEventListener('click', () => {
    alert('Abrir modal para agregar nuevo ciudadano');
  });

  // Asignar evento de búsqueda en tiempo real
  document.getElementById('inputBuscarCiudadano')?.addEventListener('input', (e) => {
    const termino = e.target.value.toLowerCase();
    const filas = document.querySelectorAll('#tbodyCiudadanos tr');

    filas.forEach(fila => {
      const texto = fila.textContent.toLowerCase();
      fila.style.display = texto.includes(termino) ? '' : 'none';
    });
  });
}

// 2. Consulta los datos al backend y llena la tabla
async function cargarTablaCiudadanos() {
  const tbody = document.getElementById('tbodyCiudadanos');
  if (!tbody) return;

  try {
    const respuesta = await fetch('http://localhost:3000/api/admin/ciudadanos');

    if (!respuesta.ok) {
      const errorJson = await respuesta.json().catch(() => null);
      throw new Error(errorJson?.mensaje || `Error en la petición (HTTP ${respuesta.status})`);
    }

    const ciudadanos = await respuesta.json();
    tbody.innerHTML = '';

    if (ciudadanos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 15px;">No hay ciudadanos registrados.</td></tr>';
      return;
    }

    ciudadanos.forEach(c => {
      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid #eee';

      tr.innerHTML = `
        <td style="padding: 10px; vertical-align: top;">
          <div style="display: flex; align-items: center; gap: 5px;">
            <span style="color: #007bff; font-weight: bold;">⊕ ${c.folio || c.id}</span>
          </div>
          <small style="color: #555;">${c.correo}</small>
        </td>
        <td style="padding: 10px; vertical-align: top;">${c.nombre || ''}</td>
        <td style="padding: 10px; vertical-align: top;">${c.primer_apellido || c.paterno || ''}</td>
        <td style="padding: 10px; vertical-align: top;">${c.segundo_apellido || c.materno || ''}</td>
        <td style="padding: 10px; vertical-align: top;">
          <span>${c.anotaciones ? c.anotaciones.substring(0, 25) + '...' : 'Sin anotaciones'}</span>
          <button class="btn-action btn-cyan" onclick="verMasAnotaciones('${c.id}')">Ver mas</button>
        </td>
        <td style="padding: 10px;">
          <div style="display: flex; flex-direction: column; gap: 3px; max-width: 170px;">
            <div style="display: flex; gap: 3px;">
              <button class="btn-action btn-blue" onclick="verCiudadano('${c.id}')">Ver</button>
              <button class="btn-action btn-blue" onclick="editarCiudadano('${c.id}')">Editar</button>
            </div>
            <button class="btn-action btn-blue" onclick="verHistorialPostulacion('${c.id}')">Historial de postulación</button>
            <button class="btn-action btn-blue" onclick="cambiarPasswordModal('${c.id}')">Cambiar contraseña</button>
            <div style="display: flex; gap: 3px;">
              <button class="btn-action btn-red" onclick="toggleActivo('${c.id}')">Activar</button>
              <button class="btn-action btn-red" onclick="toggleDisponible('${c.id}')">Marcar disponible</button>
            </div>
            <button class="btn-action btn-light" onclick="verHistorialCambios('${c.id}')">Historial de cambios</button>
            <button class="btn-action btn-orange" onclick="abrirAnotaciones('${c.id}')">Anotaciones</button>
            <button class="btn-action btn-darkred" onclick="cambiarUsuario('${c.id}')">Cambiar Usuario</button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

  } catch (error) {
    console.error('Error al cargar la tabla:', error);
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; color:red; padding:15px; font-weight:bold;">
          ⚠️ Error al conectar con la base de datos: <br>
          <small style="color:#555;">${error.message}</small>
        </td>
      </tr>`;
  }
}

/* ==========================================================================
   FUNCIONES DE ACCIÓN (MODALES Y BOTONES)
   ========================================================================== */

function verCiudadano(id) { alert(`Ver ciudadano: ${id}`); }
function editarCiudadano(id) { alert(`Editar ciudadano: ${id}`); }
function verHistorialPostulacion(id) { alert(`Historial postulación: ${id}`); }
function cambiarPasswordModal(id) { alert(`Cambiar contraseña: ${id}`); }
function toggleActivo(id) { alert(`Cambiar estado activo: ${id}`); }
function toggleDisponible(id) { alert(`Cambiar disponibilidad: ${id}`); }
function verHistorialCambios(id) { alert(`Historial cambios: ${id}`); }
function abrirAnotaciones(id) { alert(`Abrir anotaciones: ${id}`); }
function verMasAnotaciones(id) { alert(`Ver más anotaciones: ${id}`); }
function cambiarUsuario(id) { alert(`Cambiar usuario: ${id}`); }