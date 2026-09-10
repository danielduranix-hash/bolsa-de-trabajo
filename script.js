/* ==========================================================================
   1. FUNCIONES GLOBALES DEL PERFIL (Ámbito Global)
   ========================================================================== */

// Estado global de la aplicación
let usuarioActivo = JSON.parse(localStorage.getItem('usuarioActivo')) || null;

// Mostrar/Ocultar Programa Nuevo Comienzo
function evaluarNuevoComienzo() {
  const selectDiscapacidad = document.getElementById('perfilDiscapacidad');
  const seccionNC = document.getElementById('seccionNuevoComienzo');
  
  if (selectDiscapacidad && seccionNC) {
    const tieneDiscapacidad = selectDiscapacidad.value !== 'NINGUNA' && selectDiscapacidad.value !== '';
    seccionNC.style.display = tieneDiscapacidad ? 'block' : 'none';
  }
}

function evaluarNuevoComienzoPerfil() {
  const selectDiscapacidad = document.getElementById('perfilDiscapacidad');
  const seccionNuevoComienzo = document.getElementById('seccionNuevoComienzoPerfil');
  
  if (selectDiscapacidad && seccionNuevoComienzo) {
    const tieneDiscapacidad = selectDiscapacidad.value !== 'NINGUNA' && selectDiscapacidad.value !== '';
    seccionNuevoComienzo.style.display = tieneDiscapacidad ? 'block' : 'none';
  }
}

// Cálculo dinámico de edad
function calcularEdadPerfil(fechaNacimiento) {
  if (!fechaNacimiento) return;
  const hoy = new Date();
  const nac = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nac.getFullYear();
  const mes = hoy.getMonth() - nac.getMonth();

  if (mes < 0 || (mes === 0 && hoy.getDate() < nac.getDate())) {
    edad--;
  }

  const inputEdad = document.getElementById('perfilEdad');
  if (inputEdad) inputEdad.value = edad >= 0 ? edad : 0;
}

// Mapea y rellena el modal de perfil
function cargarDatosPerfilEnModal(usuario) {
  if (!usuario) return;

  // 1. Sidebar y Encabezados
  if (document.getElementById('perfilCurp')) document.getElementById('perfilCurp').value = usuario.curp || '';
  if (document.getElementById('perfilNombreSidebar')) document.getElementById('perfilNombreSidebar').value = usuario.nombre || '';
  if (document.getElementById('perfilPrimerApellidoSidebar')) document.getElementById('perfilPrimerApellidoSidebar').value = usuario.primer_apellido || '';
  if (document.getElementById('perfilSegundoApellidoSidebar')) document.getElementById('perfilSegundoApellidoSidebar').value = usuario.segundo_apellido || '';
  
  if (document.getElementById('perfilNombre')) document.getElementById('perfilNombre').value = usuario.nombre || '';
  if (document.getElementById('perfilPrimerApellido')) document.getElementById('perfilPrimerApellido').value = usuario.primer_apellido || '';
  if (document.getElementById('perfilSegundoApellido')) document.getElementById('perfilSegundoApellido').value = usuario.segundo_apellido || '';

  // 2. Contacto
  if (document.getElementById('perfilCorreo')) document.getElementById('perfilCorreo').value = usuario.correo || '';
  if (document.getElementById('perfilTelFijo')) document.getElementById('perfilTelFijo').value = usuario.telefono_fijo || '';
  if (document.getElementById('perfilCelular')) document.getElementById('perfilCelular').value = usuario.celular || '';

  // 3. Fecha de Nacimiento
  if (usuario.fecha_nacimiento) {
    const fecha = new Date(usuario.fecha_nacimiento).toISOString().split('T')[0];
    if (document.getElementById('perfilFechaNac')) {
      document.getElementById('perfilFechaNac').value = fecha;
      calcularEdadPerfil(fecha);
    }
  }

  // 4. Sexo
  if (usuario.sexo) {
    if (document.getElementById('perfilSexo')) {
      document.getElementById('perfilSexo').value = usuario.sexo;
    }
    const radioSexo = document.querySelector(`input[name="perfilSexo"][value="${usuario.sexo}"]`);
    if (radioSexo) radioSexo.checked = true;
  }

  // 5. Dirección
  if (document.getElementById('perfilCalle')) document.getElementById('perfilCalle').value = usuario.calle || '';
  if (document.getElementById('perfilLetraCalle')) document.getElementById('perfilLetraCalle').value = usuario.letra_calle || '';
  if (document.getElementById('perfilNumero')) document.getElementById('perfilNumero').value = usuario.numero || usuario.numero_calle || '';
  if (document.getElementById('perfilLetraNumero')) document.getElementById('perfilLetraNumero').value = usuario.letra_numero || '';
  if (document.getElementById('perfilPoblacion')) document.getElementById('perfilPoblacion').value = usuario.poblacion || 'MÉRIDA';
  if (document.getElementById('perfilColonia')) document.getElementById('perfilColonia').value = usuario.colonia || '';
  if (document.getElementById('perfilCP')) document.getElementById('perfilCP').value = usuario.codigo_postal || usuario.cp || '';

  // 6. Estatus y Apoyos
  if (document.getElementById('perfilDiscapacidad')) {
    document.getElementById('perfilDiscapacidad').value = usuario.discapacidad || 'NINGUNA';
    evaluarNuevoComienzoPerfil();
  }
  if (document.getElementById('perfilTipoApoyo')) document.getElementById('perfilTipoApoyo').value = usuario.tipo_apoyo || '';
  if (document.getElementById('perfilContactoNombre')) document.getElementById('perfilContactoNombre').value = usuario.contacto_nombre || '';
  if (document.getElementById('perfilContactoParentesco')) document.getElementById('perfilContactoParentesco').value = usuario.contacto_parentesco || '';
  if (document.getElementById('perfilCredencialFolio')) document.getElementById('perfilCredencialFolio').value = usuario.credencial_folio || '';
  if (document.getElementById('perfilCredencialVencimiento') && usuario.credencial_vencimiento) {
    const fechaVenc = new Date(usuario.credencial_vencimiento).toISOString().split('T')[0];
    document.getElementById('perfilCredencialVencimiento').value = fechaVenc;
  }
}

function cargarSeccionEstudios(usuario) {
  if (!usuario) return;

  const gradoSelect = document.getElementById('estudiosGrado');
  const tituladoSelect = document.getElementById('estudiosTitulado');
  const profesionSelect = document.getElementById('estudiosProfesion');
  const queEstudiasInput = document.getElementById('queEstudias');
  const conocimientosTextarea = document.getElementById('conocimientosGenerales');
  const aniosInput = document.getElementById('experienciaAnios');
  const mesesInput = document.getElementById('experienciaMeses');

  if (gradoSelect) gradoSelect.value = usuario.grado_estudios || '';
  if (tituladoSelect) tituladoSelect.value = usuario.titulado || 'No';
  if (profesionSelect) profesionSelect.value = usuario.profesion || '';
  if (queEstudiasInput) queEstudiasInput.value = usuario.que_estudias || '';
  if (conocimientosTextarea) conocimientosTextarea.value = usuario.conocimientos_generales || '';
  if (aniosInput) aniosInput.value = usuario.experiencia_anios ?? '';
  if (mesesInput) mesesInput.value = usuario.experiencia_meses ?? '';

  const estudiaActualmente = usuario.estudias_actualmente === true || usuario.estudias_actualmente === 'true' || usuario.estudias_actualmente === 'Si';
  const radioSi = document.getElementById('estudiasSi');
  const radioNo = document.getElementById('estudiasNo');

  if (estudiaActualmente && radioSi) radioSi.checked = true;
  else if (radioNo) radioNo.checked = true;

  const empleoSolicitado = document.getElementById('empleoSolicitado');
  const segundaOpcion = document.getElementById('segundaOpcionSolicitada');
  if (empleoSolicitado) empleoSolicitado.value = usuario.empleo_solicitado || '';
  if (segundaOpcion) segundaOpcion.value = usuario.segunda_opcion_empleo || '';

  const tieneExp = usuario.tiene_experiencia === true || usuario.tiene_experiencia === 'true' || usuario.tiene_experiencia === 'Si';
  const radioExpSi = document.getElementById('expSi');
  const radioExpNo = document.getElementById('expNo');
  if (tieneExp && radioExpSi) radioExpSi.checked = true;
  else if (radioExpNo) radioExpNo.checked = true;
}

/* ==========================================================================
   2. LÓGICA AL CARGAR EL DOM
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  // Referencias DOM principales
  const modalLogin = document.getElementById('modalLogin');
  const modalRegistro = document.getElementById('modalRegistro');
  const modalPerfil = document.getElementById('modalPerfil');
  
  const formLogin = document.getElementById('formLogin');
  const formPerfil = document.getElementById('formPerfil');
  const formReg = document.getElementById('formRegistro');

  const btnUserAuth = document.getElementById('btnUserAuth');
  const btnCerrarLogin = document.getElementById('btnCerrarLogin');
  const btnCerrarRegistro = document.getElementById('btnCerrarRegistro');
  const btnCerrarPerfil = document.getElementById('btnCerrarPerfil');
  const btnIrARegistro = document.getElementById('btnIrARegistro');
  const btnMiPerfil = document.getElementById('btnMiPerfil');
  const btnMiPerfilMenu = document.getElementById('btnMiPerfilMenu');
  const btnCerrarSesion = document.getElementById('btnCerrarSesion');
  const btnAdmin = document.getElementById('btnVistaAdminMenu');

  // Recordar correo
  const correoGuardado = localStorage.getItem('correoRecordado');
  const inputCorreo = document.getElementById('loginCorreo');
  const checkRecordar = document.getElementById('checkRecordar');

  if (correoGuardado && inputCorreo) {
    inputCorreo.value = correoGuardado;
    if (checkRecordar) checkRecordar.checked = true;
  }

  /* --- Pestañas del Perfil --- */
  const navTabs = document.querySelectorAll('.nav-tab');
  const tabContent = document.querySelectorAll('.tab-content');

  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      navTabs.forEach(t => t.classList.remove('active'));
      tabContent.forEach(c => c.classList.remove('active'));

      tab.classList.add('active');
      const targetTab = tab.getAttribute('data-tab');
      const targetContent = document.getElementById(targetTab);
      if (targetContent) targetContent.classList.add('active');
    });
  });

  /* --- Validación CURP --- */
  const inputCurp = document.getElementById('curp');
  if (inputCurp) {
    inputCurp.addEventListener('input', (e) => {
      e.target.value = e.target.value.toUpperCase().trim();
      const regexCurp = /^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[A-Z0-9]{2}$/;
      
      if (e.target.value === '') e.target.style.borderColor = '';
      else if (regexCurp.test(e.target.value)) e.target.style.borderColor = '#28a745';
      else e.target.style.borderColor = '#dc3545';
    });
  }

 /* --- Formulario de Registro --- */
if (formReg) {
  formReg.addEventListener('submit', async (e) => {
    e.preventDefault();

    const paterno = document.getElementById('apellidoPaterno')?.value.trim();
    const materno = document.getElementById('apellidoMaterno')?.value.trim();

    if (!paterno && !materno) {
      alert('Por favor, ingrese al menos un apellido.');
      return;
    }

    const datosRegistro = {
      curp: document.getElementById('curp')?.value.trim().toUpperCase(),
      nombre: document.getElementById('nombre')?.value.trim(),
      primer_apellido: paterno,
      segundo_apellido: materno,
      correo: document.getElementById('correo')?.value.trim(),
      password: document.getElementById('password')?.value,
      fecha_nacimiento: document.getElementById('fechaNacimiento')?.value,
      sexo: document.getElementById('sexo')?.value,
      pertenece_grupo_vulnerable: document.getElementById('vulnerable')?.value !== 'NINGUNO',
      grupos_vulnerables: [document.getElementById('vulnerable')?.value].filter(Boolean),
      tiene_discapacidad: false,
      tipos_discapacidad: []
    };

    try {
      const respuesta = await fetch('http://localhost:3000/api/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosRegistro)
      });

      // Intenta leer la respuesta del servidor como JSON
      let resultado = {};
      try {
        resultado = await respuesta.json();
      } catch (errJson) {
        console.warn('La respuesta del servidor no es un JSON válido:', errJson);
      }

      if (respuesta.ok && resultado.exito) {
        alert('¡Registro completado con éxito!');
        formReg.reset();
        if (modalRegistro) modalRegistro.style.display = 'none';
        if (modalLogin) modalLogin.style.display = 'flex';
      } else {
        // Muestra el mensaje del servidor o un aviso de duplicado
        const mensajeError = resultado.mensaje || 'El CURP o correo ingresado ya existe en el sistema.';
        alert(`Atención: ${mensajeError}`);
      }
    } catch (error) {
      console.error('Error de red o servidor no disponible:', error);
      alert('No se pudo conectar con el servidor backend. Revisa que Node.js esté corriendo en el puerto 3000.');
    }
  });
}
  /* --- Navegación e Integración de GeoPortal / Mapa --- */
  const vistaInicio = document.getElementById('vistaInicio');
  const vistaGeoPortal = document.getElementById('vistaGeoPortal');
  const btnEmpleos = document.getElementById('btnEmpleos');
  const btnVolverInicio = document.getElementById('btnVolverInicio');
  const btnIrGeoPortal = document.getElementById('btnIrGeoPortal');

  let mapa = null;
  let marcadores = [];

  const empleos = [
    { id: 1, titulo: 'Desarrollador Web Junior', empresa: 'TechSol', zona: 'Norte', categoria: 'Tecnología', lat: 20.9753, lng: -89.6169 },
    { id: 2, titulo: 'Auxiliar Administrativo', empresa: 'Comercial del Sur', zona: 'Sur', categoria: 'Administración', lat: 20.9380, lng: -89.6250 },
    { id: 3, titulo: 'Ejecutivo de Ventas', empresa: 'Grupo Peninsular', zona: 'Centro', categoria: 'Ventas', lat: 20.9670, lng: -89.6237 },
    { id: 4, titulo: 'Técnico en Mantenimiento', empresa: 'Logística YUC', zona: 'Poniente', categoria: 'Servicios', lat: 20.9600, lng: -89.6500 }
  ];

  function mostrarInicio() {
    if (vistaInicio && vistaGeoPortal) {
      vistaInicio.style.display = 'block';
      vistaGeoPortal.style.display = 'none';
      window.scrollTo(0, 0);
    }
  }

  function mostrarGeoPortal() {
    if (vistaInicio && vistaGeoPortal) {
      vistaInicio.style.display = 'none';
      vistaGeoPortal.style.display = 'block';

      if (!mapa) inicializarMapa();
      else setTimeout(() => mapa.invalidateSize(), 200);
    }
  }

  if (btnEmpleos) btnEmpleos.addEventListener('click', mostrarGeoPortal);
  if (btnIrGeoPortal) btnIrGeoPortal.addEventListener('click', (e) => { e.preventDefault(); mostrarGeoPortal(); });
  if (btnVolverInicio) btnVolverInicio.addEventListener('click', (e) => { e.preventDefault(); mostrarInicio(); });

  function inicializarMapa() {
    mapa = L.map('mapa').setView([20.9670, -89.6237], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(mapa);
    renderizarMarcadores(empleos);
  }

  function renderizarMarcadores(lista) {
    marcadores.forEach(m => mapa.removeLayer(m));
    marcadores = [];

    lista.forEach(e => {
      const marker = L.marker([e.lat, e.lng]).addTo(mapa);
      marker.bindPopup(`
        <div style="text-align: center;">
          <h4 style="margin-bottom: 5px; color: #0d3c75;">${e.titulo}</h4>
          <p style="margin: 0; font-size: 0.85rem;"><strong>Empresa:</strong> ${e.empresa}</p>
          <p style="margin: 0; font-size: 0.85rem;"><strong>Zona:</strong> ${e.zona}</p>
          <button style="margin-top: 8px; background: #7bc143; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Postularme</button>
        </div>
      `);
      marcadores.push(marker);
    });
  }

  const btnToggleFiltros = document.getElementById('btnToggleFiltros');
  const filtroBox = document.getElementById('filtroBox');
  const btnBuscarMapa = document.getElementById('btnBuscarMapa');

  if (btnToggleFiltros && filtroBox) {
    btnToggleFiltros.addEventListener('click', () => filtroBox.classList.toggle('colapsado'));
  }

  if (btnBuscarMapa) {
    btnBuscarMapa.addEventListener('click', () => {
      const texto = document.getElementById('filtroPalabra').value.toLowerCase();
      const zona = document.getElementById('filtroZona').value;
      const cat = document.getElementById('filtroCategoria').value;

      const filtrados = empleos.filter(e => {
        const matchTexto = e.titulo.toLowerCase().includes(texto) || e.empresa.toLowerCase().includes(texto);
        const matchZona = zona === '' || e.zona === zona;
        const matchCat = cat === '' || e.categoria === cat;
        return matchTexto && matchZona && matchCat;
      });

      renderizarMarcadores(filtrados);
    });
  }

/* --- Tarjetas de Sector / Calendario con Carga Dinámica desde Neon --- */
async function inicializarCalendarioEventos() {
  const sectorCards = document.querySelectorAll('.sector-card');
  const grid = document.getElementById('calendarioGrid');

  try {
    // 1. Cargar eventos desde Neon
    const response = await fetch('/api/eventos');
    const data = await response.json();

    if (!data.exito) return;
    const eventosGlobales = data.eventos || [];

    // 2. Rellenar contadores y próxima fecha en tarjetas superiores
    sectorCards.forEach(card => {
      const sectorTipo = card.getAttribute('data-sector');
      const evsTipo = eventosGlobales.filter(e => e.tipo_evento === sectorTipo);

      const badgeCount = card.querySelector('.badge-count');
      const proxFechaText = card.querySelector('.prox-fecha');

      if (badgeCount) {
        badgeCount.textContent = `${evsTipo.length} ${evsTipo.length === 1 ? 'Fecha' : 'Fechas'}`;
      }

      if (proxFechaText) {
        if (evsTipo.length > 0) {
          const proximo = evsTipo[0];
          const fechaFormateada = new Date(proximo.fecha_evento).toLocaleDateString('es-MX', {
            day: 'numeric',
            month: 'short',
            timeZone: 'UTC'
          });
          proxFechaText.textContent = `Próxima: ${fechaFormateada}`;
        } else {
          proxFechaText.textContent = `Próxima: Sin fechas`;
        }
      }
    });

    // 3. PINTAR EL CALENDARIO GENERAL (Ej: Días clave de Agosto y Septiembre 2026)
    if (grid) {
      grid.innerHTML = ''; // Limpiar contenedor

      const estilos = {
        dia_empleo: 'bg-blue-900 text-white font-bold shadow-md',
        modulo_movil: 'bg-amber-500 text-white font-bold shadow-md',
        feria_empleo: 'bg-purple-700 text-white font-bold shadow-md',
        capacitacion: 'bg-emerald-600 text-white font-bold shadow-md'
      };

      // Definir los días que deseas mostrar en el calendario (por ejemplo, del 17 al 30 de Agosto)
      // O puedes mapear directamente los eventos que vengan de la base de datos
      for (let dia = 17; dia <= 30; dia++) {
        // Buscar evento validando día y que pertenezca a agosto (mes 7 en JS)
        const evEncontrado = eventosGlobales.find(e => {
          const fechaObj = new Date(e.fecha_evento);
          return fechaObj.getUTCDate() === dia && fechaObj.getUTCMonth() === 7; // 7 = Agosto
        });

        const celda = document.createElement('div');
        celda.className = 'p-3 rounded-2xl flex flex-col items-center justify-center min-h-[75px] transition-all border border-slate-100';

        if (evEncontrado) {
          const claseEstilo = estilos[evEncontrado.tipo_evento] || 'bg-slate-800 text-white';
          celda.className += ` ${claseEstilo}`;
          celda.innerHTML = `
            <span class="text-base font-bold">${dia}</span>
            <span class="text-[10px] font-normal truncate max-w-[90px] mt-1">${evEncontrado.lugar || evEncontrado.titulo}</span>
          `;
        } else {
          celda.className += ' bg-slate-50 text-slate-400 hover:bg-slate-100';
          celda.innerHTML = `<span class="text-base">${dia}</span>`;
        }

        grid.appendChild(celda);
      }
    }

    // 4. Interacción al hacer clic en tarjetas y filtros de leyenda
    sectorCards.forEach(card => {
      card.addEventListener('click', (e) => {
        e.stopPropagation();
        const estaActivo = card.classList.contains('activo');
        sectorCards.forEach(c => c.classList.remove('activo'));
        if (!estaActivo) card.classList.add('activo');
      });
    });

    document.addEventListener('click', () => {
      sectorCards.forEach(c => c.classList.remove('activo'));
    });

  } catch (error) {
    console.error('Error al sincronizar los eventos con Neon:', error);
  }
}

// Ejecutar al cargar la página
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializarCalendarioEventos);
} else {
  inicializarCalendarioEventos();
}
  /* --- Estado de Autenticación y Menú Flotante --- */
  function actualizarUIAutenticacion() {
    const userMenuContainer = document.getElementById('userMenuContainer');
    const dropdownNombre = document.getElementById('dropdownNombre');
    const dropdownCorreo = document.getElementById('dropdownCorreo');
    const btnVistaAdminMenu = document.getElementById('btnVistaAdminMenu');

    if (usuarioActivo) {
      if (btnUserAuth) btnUserAuth.style.display = 'none';
      if (userMenuContainer) userMenuContainer.style.display = 'inline-flex';

      if (dropdownNombre) dropdownNombre.textContent = `${usuarioActivo.nombre || ''} ${usuarioActivo.primer_apellido || ''}`.trim();
      if (dropdownCorreo) dropdownCorreo.textContent = usuarioActivo.correo || '';

      const esAdmin = usuarioActivo.rol === 'admin' || usuarioActivo.rol === 'superadmin' || usuarioActivo.correo?.toLowerCase().includes('admin');
      if (btnVistaAdminMenu) btnVistaAdminMenu.style.display = esAdmin ? 'flex' : 'none';
    } else {
      if (btnUserAuth) btnUserAuth.style.display = 'inline-flex';
      if (userMenuContainer) userMenuContainer.style.display = 'none';
    }
  }

  actualizarUIAutenticacion();

  const btnToggleUserMenu = document.getElementById('btnToggleUserMenu');
  const userDropdownMenu = document.getElementById('userDropdownMenu');

  if (btnToggleUserMenu && userDropdownMenu) {
    btnToggleUserMenu.addEventListener('click', (e) => {
      e.stopPropagation();
      userDropdownMenu.classList.toggle('show');
    });

    document.addEventListener('click', () => userDropdownMenu.classList.remove('show'));
  }

  const btnCerrarSesionMenu = document.getElementById('btnCerrarSesionMenu');
  if (btnCerrarSesionMenu) {
    btnCerrarSesionMenu.addEventListener('click', () => {
      localStorage.removeItem('usuarioActivo');
      usuarioActivo = null;
      actualizarUIAutenticacion();
      if (userDropdownMenu) userDropdownMenu.classList.remove('show');
    });
  }

  // Eventos de Apertura/Cierre de Modales
  if (btnUserAuth && modalLogin) btnUserAuth.addEventListener('click', () => modalLogin.style.display = 'flex');

  const abrirPerfil = async () => {
    if (userDropdownMenu) userDropdownMenu.classList.remove('show');
    if (modalPerfil) modalPerfil.style.display = 'flex';

    if (usuarioActivo) cargarDatosPerfilEnModal(usuarioActivo);

    const idUsuario = usuarioActivo?.curp || usuarioActivo?.usuario_curp || usuarioActivo?.correo;
    if (idUsuario) {
      try {
        const respuesta = await fetch(`http://localhost:3000/api/perfil/${idUsuario}`);
        if (respuesta.ok) {
          const datos = await respuesta.json();
          const datosUsuario = datos.usuario || datos;

          if (datosUsuario) {
            usuarioActivo = { ...usuarioActivo, ...datosUsuario };
            localStorage.setItem('usuarioActivo', JSON.stringify(usuarioActivo));
            cargarDatosPerfilEnModal(usuarioActivo);
          }
        }
      } catch (error) {
        console.error('Error al actualizar perfil:', error);
      }
    }
  };

  if (btnMiPerfilMenu) btnMiPerfilMenu.addEventListener('click', abrirPerfil);
  if (btnMiPerfil) btnMiPerfil.addEventListener('click', abrirPerfil);

  if (btnCerrarLogin && modalLogin) btnCerrarLogin.addEventListener('click', () => modalLogin.style.display = 'none');
  if (btnCerrarRegistro && modalRegistro) btnCerrarRegistro.addEventListener('click', () => modalRegistro.style.display = 'none');
  if (btnCerrarPerfil && modalPerfil) btnCerrarPerfil.addEventListener('click', () => modalPerfil.style.display = 'none');

  if (btnIrARegistro && modalLogin && modalRegistro) {
    btnIrARegistro.addEventListener('click', () => {
      modalLogin.style.display = 'none';
      modalRegistro.style.display = 'flex';
    });
  }

  window.addEventListener('click', (e) => {
    if (e.target === modalLogin) modalLogin.style.display = 'none';
    if (e.target === modalRegistro) modalRegistro.style.display = 'none';
    if (e.target === modalPerfil) modalPerfil.style.display = 'none';
  });

  /* --- Login Async --- */
  if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();
      const inputPassword = document.getElementById('loginPassword');

      const correo = inputCorreo?.value;
      const password = inputPassword?.value;
      const recordar = checkRecordar?.checked;

      try {
        const respuesta = await fetch('http://localhost:3000/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ correo, password })
        });

        const datos = await respuesta.json();

        if (respuesta.ok && (datos.exito || datos.usuario)) {
          const usuarioObtenido = datos.usuario || datos;

          if (recordar && correo) localStorage.setItem('correoRecordado', correo);
          else localStorage.removeItem('correoRecordado');

          if (window.PasswordCredential && inputCorreo && inputPassword) {
            try {
              const credencial = new PasswordCredential({
                id: correo,
                password: password,
                name: usuarioObtenido.nombre || correo
              });
              navigator.credentials.store(credencial);
            } catch (err) {
              console.log('Autocompletado de navegador gestionado por formulario.');
            }
          }

          localStorage.setItem('usuarioActivo', JSON.stringify(usuarioObtenido));
          usuarioActivo = usuarioObtenido;

          cargarDatosPerfilEnModal(usuarioObtenido);
          actualizarUIAutenticacion();

          alert(`¡Bienvenido/a, ${usuarioObtenido.nombre || 'Usuario'}!`);

          if (inputPassword) inputPassword.value = '';
          if (!recordar && inputCorreo) inputCorreo.value = '';
          if (modalLogin) modalLogin.style.display = 'none';

        } else {
          alert(datos.mensaje || 'Error al iniciar sesión.');
        }
      } catch (error) {
        console.error('Error de conexión:', error);
        alert('No se pudo conectar con el servidor.');
      }
    });
  }

  /* --- Guardar Perfil Async --- */
  if (formPerfil) {
    formPerfil.addEventListener('submit', async (e) => {
      e.preventDefault();

      const curpInput = document.getElementById('perfilCurp')?.value;
      const curp = (curpInput || usuarioActivo?.curp || '').trim();

      if (!curp) {
        alert('Error: No se encontró la CURP del usuario.');
        return;
      }

      const obtenerValor = (id1, id2) => {
        const val1 = document.getElementById(id1)?.value?.trim();
        const val2 = document.getElementById(id2)?.value?.trim();
        return val1 || val2 || null;
      };

      const datosActualizados = {
        curp: curp,
        nombre: obtenerValor('perfilNombreSidebar', 'perfilNombre'),
        primer_apellido: obtenerValor('perfilPrimerApellidoSidebar', 'perfilPrimerApellido'),
        segundo_apellido: obtenerValor('perfilSegundoApellidoSidebar', 'perfilSegundoApellido'),
        correo: document.getElementById('perfilCorreo')?.value?.trim() || null,
        fecha_nacimiento: document.getElementById('perfilFechaNac')?.value || null,
        edad: document.getElementById('perfilEdad')?.value ? parseInt(document.getElementById('perfilEdad').value, 10) : null,
        sexo: document.getElementById('perfilSexo')?.value || document.querySelector('input[name="perfilSexo"]:checked')?.value || 'O',
        estado_civil: document.getElementById('perfilEstadoCivil')?.value || null,
        calle: document.getElementById('perfilCalle')?.value?.trim() || null,
        letra_calle: document.getElementById('perfilLetraCalle')?.value?.trim() || null,
        numero: document.getElementById('perfilNumero')?.value?.trim() || null,
        letra_numero: document.getElementById('perfilLetraNumero')?.value?.trim() || null,
        poblacion: document.getElementById('perfilPoblacion')?.value?.trim() || 'MÉRIDA',
        colonia: document.getElementById('perfilColonia')?.value?.trim() || null,
        codigo_postal: document.getElementById('perfilCP')?.value?.trim() || null,
        telefono_fijo: document.getElementById('perfilTelFijo')?.value?.trim() || null,
        celular: document.getElementById('perfilTelefono')?.value?.trim() || document.getElementById('perfilCelular')?.value?.trim() || null,
        discapacidad: document.getElementById('perfilDiscapacidad')?.value || 'NINGUNA',
        es_nuevo_comienzo: (document.getElementById('perfilDiscapacidad')?.value || 'NINGUNA') !== 'NINGUNA',
        tipo_apoyo: document.getElementById('perfilTipoApoyo')?.value?.trim() || null,
        contacto_nombre: document.getElementById('perfilContactoNombre')?.value?.trim() || null,
        contacto_parentesco: document.getElementById('perfilContactoParentesco')?.value?.trim() || null,
        credencial_folio: document.getElementById('perfilCredencialFolio')?.value?.trim() || null,
        credencial_vencimiento: document.getElementById('perfilCredencialVencimiento')?.value || null
      };

      try {
        const respuesta = await fetch(`http://localhost:3000/api/perfil/${curp}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(datosActualizados)
        });

        const resultado = await respuesta.json();

        if (respuesta.ok && (resultado.exito || resultado.actualizado)) {
          usuarioActivo = { ...usuarioActivo, ...datosActualizados };
          localStorage.setItem('usuarioActivo', JSON.stringify(usuarioActivo));
          actualizarUIAutenticacion();
          alert('¡Perfil actualizado con éxito!');
          if (modalPerfil) modalPerfil.style.display = 'none';
        } else {
          alert(`Error al actualizar perfil: ${resultado.mensaje || 'Respuesta no válida del servidor'}`);
        }
      } catch (error) {
        console.error('Error al guardar los datos del perfil:', error);
        alert('Error de conexión con el servidor backend al intentar guardar el perfil.');
      }
    });
  }

  if (btnAdmin) {
    btnAdmin.addEventListener('click', (e) => {
      e.preventDefault();
      const usuario = JSON.parse(localStorage.getItem('usuarioActivo'));
      if (usuario && (usuario.rol === 'admin' || usuario.rol === 'superadmin')) {
        window.location.href = 'admin.html';
      } else {
        alert('Acceso no autorizado: Se requieren permisos administrativos.');
      }
    });
  }

  if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener('click', () => {
      localStorage.removeItem('usuarioActivo');
      usuarioActivo = null;
      actualizarUIAutenticacion();
      alert('Sesión cerrada.');
    });
  }

  /* --- Asistente Virtual y Tour Interactivo --- */
  const btnHelp = document.getElementById('btnHelp');
  const assistantBox = document.getElementById('assistantBox');
  const tutorialOverlay = document.getElementById('tutorialOverlay');
  const assistantText = document.getElementById('assistantText');
  const btnNextStep = document.getElementById('btnNextStep');
  const btnPrevStep = document.getElementById('btnPrevStep');
  const btnSkipTutorial = document.getElementById('btnSkipTutorial');
  const btnVoiceRead = document.getElementById('btnVoiceRead');
  const iconoAsistenteVoz = document.getElementById('iconoAsistenteVoz');

  let pasoActual = 0;
  let audioAutomaticoActivo = false;

  const tutorialesPorSeccion = {
    inicio: [
      { elementId: 'btnEmpleos', text: 'Bienvenido. Desde este botón puedes acceder directamente al GeoPortal de empleos.' },
      { elementId: 'heroEmpresas', text: 'Si eres empleador, esta sección te orienta sobre cómo publicar y administrar tus ofertas laborales.' },
      { elementId: 'bannerCV', text: 'Aquí puedes usar nuestro generador inteligente para estructurar un currículum profesional en minutos.' },
      { elementId: 'gridCiudadano', text: 'En el espacio ciudadano encontrarás herramientas para buscar empleo y profesionalizar tu perfil.' },
      { elementId: 'seccionCalendario', text: 'Haz clic en cada tarjeta para abrir su calendario mensual interactivo con fechas de atención.' }
    ],
    geoportal: [
      { elementId: 'filtroBox', text: 'Usa este panel de filtros para acotar las vacantes por zona geográfica, puesto o categoría.' },
      { elementId: 'mapa', text: 'Haz clic en los marcadores interactivos dentro del mapa para ver los detalles de cada vacante y postularte.' }
    ]
  };

  function iniciarTutorial() {
    pasoActual = 0;
    audioAutomaticoActivo = false;
    actualizarIconoPantalla(false);
    if (assistantBox) assistantBox.style.display = 'block';
    if (tutorialOverlay) tutorialOverlay.style.display = 'block';
    mostrarPaso();
  }

  function finalizarTutorial() {
    if (assistantBox) assistantBox.style.display = 'none';
    if (tutorialOverlay) tutorialOverlay.style.display = 'none';
    quitarResaltados();
    audioAutomaticoActivo = false;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }

  function quitarResaltados() {
    document.querySelectorAll('.highlight-step').forEach(el => el.classList.remove('highlight-step'));
  }

  function actualizarIconoPantalla(activo) {
    if (!iconoAsistenteVoz) return;
    if (activo) {
      iconoAsistenteVoz.className = "fa-solid fa-volume-high";
      iconoAsistenteVoz.style.color = "#7bc143";
    } else {
      iconoAsistenteVoz.className = "fa-solid fa-volume-xmark";
      iconoAsistenteVoz.style.color = "#666666";
    }
  }

  function hablarTextoActual(texto) {
    if ('speechSynthesis' in window && texto) {
      window.speechSynthesis.cancel();
      const locucion = new SpeechSynthesisUtterance(texto);
      locucion.lang = 'es-ES';
      window.speechSynthesis.speak(locucion);
    }
  }

  function mostrarPaso() {
    quitarResaltados();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();

    const esGeoPortal = typeof vistaGeoPortal !== 'undefined' && vistaGeoPortal && vistaGeoPortal.style.display !== 'none';
    const pasarela = esGeoPortal ? tutorialesPorSeccion.geoportal : tutorialesPorSeccion.inicio;

    if (pasoActual >= pasarela.length) {
      finalizarTutorial();
      return;
    }

    const paso = pasarela[pasoActual];
    if (assistantText) assistantText.textContent = paso.text;

    if (btnPrevStep) {
      btnPrevStep.style.display = pasoActual > 0 ? 'inline-block' : 'none';
    }

    const elTarget = document.getElementById(paso.elementId);
    if (elTarget) {
      elTarget.classList.add('highlight-step');
      elTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    if (audioAutomaticoActivo) {
      setTimeout(() => hablarTextoActual(paso.text), 200);
    }
  }

  if (btnHelp) btnHelp.addEventListener('click', iniciarTutorial);
  if (btnNextStep) btnNextStep.addEventListener('click', () => { pasoActual++; mostrarPaso(); });
  if (btnPrevStep) btnPrevStep.addEventListener('click', () => { if (pasoActual > 0) { pasoActual--; mostrarPaso(); } });
  if (btnSkipTutorial) btnSkipTutorial.addEventListener('click', finalizarTutorial);

  if (btnVoiceRead) {
    btnVoiceRead.addEventListener('click', () => {
      if (!audioAutomaticoActivo) {
        audioAutomaticoActivo = true;
        actualizarIconoPantalla(true);
        if (assistantText) hablarTextoActual(assistantText.textContent);
      } else {
        audioAutomaticoActivo = false;
        actualizarIconoPantalla(false);
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      } 
    });
  }

  /* --- Panel de Accesibilidad --- */
  const btnAccesibilidad = document.getElementById('btnAccesibilidad');
  const panelAccesibilidad = document.getElementById('panelAccesibilidad');
  const btnCerrarAccesibilidad = document.getElementById('btnCerrarAccesibilidad');
  const tabs = document.querySelectorAll('.tab-accesibilidad');
  const tabContents = document.querySelectorAll('.tab-content-accesibilidad');

  if (btnAccesibilidad && panelAccesibilidad) {
    btnAccesibilidad.addEventListener('click', () => {
      const isOpen = panelAccesibilidad.style.display === 'block';
      panelAccesibilidad.style.display = isOpen ? 'none' : 'block';
    });
  }

  if (btnCerrarAccesibilidad && panelAccesibilidad) {
    btnCerrarAccesibilidad.addEventListener('click', () => {
      panelAccesibilidad.style.display = 'none';
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const target = tab.dataset.tab;
      tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === 'tab' + target.charAt(0).toUpperCase() + target.slice(1)) {
          content.classList.add('active');
        }
      });
    });
  });

  // Funciones de Accesibilidad (Conectadas al objeto Global `window`)
  function cambiarFuente(accion) {
    let current = parseInt(localStorage.getItem('textSize') || '100', 10);
    let nuevo = accion === 'aumentar' ? Math.min(current + 10, 160) : Math.max(current - 10, 100);
    document.body.style.fontSize = nuevo + '%';
    localStorage.setItem('textSize', nuevo);
    const label = document.getElementById('tamanoTextoLabel');
    if (label) label.textContent = nuevo + '%';
  }

  function toggleClase(className, key) {
    document.body.classList.toggle(className);
    const isActive = document.body.classList.contains(className);
    localStorage.setItem(key, isActive ? 'true' : 'false');

    document.querySelectorAll(`[data-accion="${key}"]`).forEach(btn => {
      btn.classList.toggle('active', isActive);
    });
  }

  window.toggleAltoContraste = () => toggleClase('alto-contraste', 'altoContraste');
  window.toggleModoOscuro = () => {
    document.body.classList.toggle('modo-oscuro');
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('modo-oscuro');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');

    document.querySelectorAll('[data-accion="modoOscuro"]').forEach(btn => {
      btn.classList.toggle('active', isDark);
      btn.innerHTML = isDark ? '☀️ Modo claro' : '🌙 Modo oscuro';
    });
  };

  window.toggleSubrayar = () => toggleClase('subrayar-enlaces', 'subrayarEnlaces');
  window.toggleLecturaFacil = () => toggleClase('texto-facil', 'textofacil'); 
  window.toggleBotonesGrandes = () => toggleClase('botones-grandes', 'botonesGrandes');
  window.toggleModoLectura = () => toggleClase('modo-lectura', 'modoLectura');
  window.toggleResaltarTitulos = () => toggleClase('resaltar-titulos', 'resaltarTitulos');

  let synth = window.speechSynthesis;
  let utterance = null;
  let isPaused = false;

  function leerTexto(texto) {
    if (!synth) return;
    synth.cancel();
    utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'es-ES';
    const velocidad = document.getElementById('velocidadVoz');
    utterance.rate = velocidad ? parseFloat(velocidad.value) : 1;
    utterance.onend = () => { isPaused = false; };
    synth.speak(utterance);
  }

  window.leerTodo = () => leerTexto(document.body.innerText);
  window.leerSeleccion = () => {
    const seleccion = window.getSelection().toString();
    if (seleccion) leerTexto(seleccion);
    else alert('Selecciona un texto con el mouse o el teclado para leerlo en voz alta.');
  };

  window.pausarVoz = () => {
    if (synth.speaking) {
      if (isPaused) {
        synth.resume();
        isPaused = false;
      } else {
        synth.pause();
        isPaused = true;
      }
    }
  };

  window.detenerVoz = () => {
    synth.cancel();
    isPaused = false;
  };

  const velocidadInput = document.getElementById('velocidadVoz');
  const velocidadLabel = document.getElementById('velocidadLabel');
  if (velocidadInput && velocidadLabel) {
    velocidadInput.addEventListener('input', () => {
      velocidadLabel.textContent = parseFloat(velocidadInput.value).toFixed(1) + 'x';
    });
  }

  // Listeners de Accesibilidad
  document.querySelectorAll('.btn-fuente').forEach(btn => {
    btn.addEventListener('click', () => {
      const accion = btn.dataset.accion;
      if (accion === 'aumentar' || accion === 'disminuir') cambiarFuente(accion);
    });
  });

  document.querySelectorAll('.btn-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const accion = btn.dataset.accion;
      const funciones = {
        'altoContraste': window.toggleAltoContraste,
        'modoOscuro': window.toggleModoOscuro,
        'subrayarEnlaces': window.toggleSubrayar,
        'lecturaFacil': window.toggleLecturaFacil,
        'botonesGrandes': window.toggleBotonesGrandes,
        'modoLectura': window.toggleModoLectura,
        'resaltarTitulos': window.toggleResaltarTitulos,
      };
      if (funciones[accion]) funciones[accion]();
    });
  });

  document.querySelectorAll('.btn-lectura').forEach(btn => {
    btn.addEventListener('click', () => {
      const accion = btn.dataset.accion;
      const funciones = {
        'leerTodo': window.leerTodo,
        'leerSeleccion': window.leerSeleccion,
        'pausarVoz': window.pausarVoz,
        'detenerVoz': window.detenerVoz
      };
      if (funciones[accion]) funciones[accion]();
    });
  });

  // Restaurar Preferencias Guardadas
  function restaurarAccesibilidad() {
    const preferencias = {
      'altoContraste': 'alto-contraste',
      'subrayarEnlaces': 'subrayar-enlaces',
      'lecturaFacil': 'texto-facil', 
      'botonesGrandes': 'botones-grandes',
      'modoLectura': 'modo-lectura',
      'resaltarTitulos': 'resaltar-titulos'
    };

    Object.entries(preferencias).forEach(([key, className]) => {
      if (localStorage.getItem(key) === 'true') {
        document.body.classList.add(className);
        document.querySelectorAll(`[data-accion="${key}"]`).forEach(btn => btn.classList.add('active'));
      }
    });

    if (localStorage.getItem('theme') === 'dark') {
      document.body.classList.add('modo-oscuro', 'dark-mode');
      document.querySelectorAll('[data-accion="modoOscuro"]').forEach(btn => {
        btn.classList.add('active');
        btn.innerHTML = '☀️ Modo claro';
      });
    }

    const size = localStorage.getItem('textSize');
    if (size) {
      document.body.style.fontSize = size + '%';
      const label = document.getElementById('tamanoTextoLabel');
      if (label) label.textContent = size + '%';
    }
  }

  restaurarAccesibilidad();
});