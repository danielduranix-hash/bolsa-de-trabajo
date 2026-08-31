/* ==========================================================================
   1. FUNCIONES GLOBALES DEL PERFIL (Fuera de DOMContentLoaded)
   ========================================================================== */

// Función Global para evento inline onchange
function evaluarNuevoComienzo() {
  const selectDiscapacidad = document.getElementById('perfilDiscapacidad');
  const seccionNC = document.getElementById('seccionNuevoComienzo');
  
  if (selectDiscapacidad && seccionNC) {
    if (selectDiscapacidad.value !== 'NINGUNA' && selectDiscapacidad.value !== '') {
      seccionNC.style.display = 'block';
    } else {
      seccionNC.style.display = 'none';
    }
  }
}

// Mostrar/Ocultar Programa Nuevo Comienzo en el Perfil
function evaluarNuevoComienzoPerfil() {
  const selectDiscapacidad = document.getElementById('perfilDiscapacidad');
  const seccionNuevoComienzo = document.getElementById('seccionNuevoComienzoPerfil');
  
  if (selectDiscapacidad && seccionNuevoComienzo) {
    if (selectDiscapacidad.value !== 'NINGUNA' && selectDiscapacidad.value !== '') {
      seccionNuevoComienzo.style.display = 'block';
    } else {
      seccionNuevoComienzo.style.display = 'none';
    }
  }
}

// Cálculo dinámico de edad según la fecha seleccionada
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

// Mapea y rellena el modal de perfil con los datos recibidos del Backend / BD
function cargarDatosPerfilEnModal(usuario) {
  if (!usuario) return;

  // 1. Sidebar y Encabezados
  if (document.getElementById('perfilCurp')) document.getElementById('perfilCurp').value = usuario.curp || '';
  if (document.getElementById('perfilNombreSidebar')) document.getElementById('perfilNombreSidebar').value = usuario.nombre || '';
  if (document.getElementById('perfilPrimerApellidoSidebar')) document.getElementById('perfilPrimerApellidoSidebar').value = usuario.primer_apellido || '';
  if (document.getElementById('perfilSegundoApellidoSidebar')) document.getElementById('perfilSegundoApellidoSidebar').value = usuario.segundo_apellido || '';
  
  // Compatibilidad en caso de que tus inputs no usen el sufijo 'Sidebar'
  if (document.getElementById('perfilNombre')) document.getElementById('perfilNombre').value = usuario.nombre || '';
  if (document.getElementById('perfilPrimerApellido')) document.getElementById('perfilPrimerApellido').value = usuario.primer_apellido || '';
  if (document.getElementById('perfilSegundoApellido')) document.getElementById('perfilSegundoApellido').value = usuario.segundo_apellido || '';

  // 2. Información de Contacto y Personal
  if (document.getElementById('perfilCorreo')) document.getElementById('perfilCorreo').value = usuario.correo || '';
  if (document.getElementById('perfilTelFijo')) document.getElementById('perfilTelFijo').value = usuario.telefono_fijo || '';
  if (document.getElementById('perfilCelular')) document.getElementById('perfilCelular').value = usuario.celular || '';

  // 3. Fecha de Nacimiento y Edad
  if (usuario.fecha_nacimiento) {
    const fecha = new Date(usuario.fecha_nacimiento).toISOString().split('T')[0];
    if (document.getElementById('perfilFechaNac')) {
      document.getElementById('perfilFechaNac').value = fecha;
      calcularEdadPerfil(fecha);
    }
  }

  // 4. Sexo (Manejando Select o Radio Buttons)
  if (usuario.sexo) {
    if (document.getElementById('perfilSexo')) {
      document.getElementById('perfilSexo').value = usuario.sexo;
    }
    const radioSexo = document.querySelector(`input[name="perfilSexo"][value="${usuario.sexo}"]`);
    if (radioSexo) radioSexo.checked = true;
  }

  // 5. Dirección y Ubicación
  if (document.getElementById('perfilCalle')) document.getElementById('perfilCalle').value = usuario.calle || '';
  if (document.getElementById('perfilLetraCalle')) document.getElementById('perfilLetraCalle').value = usuario.letra_calle || '';
  if (document.getElementById('perfilNumero')) document.getElementById('perfilNumero').value = usuario.numero || usuario.numero_calle || '';
  if (document.getElementById('perfilLetraNumero')) document.getElementById('perfilLetraNumero').value = usuario.letra_numero || '';
  if (document.getElementById('perfilPoblacion')) document.getElementById('perfilPoblacion').value = usuario.poblacion || 'MÉRIDA';
  if (document.getElementById('perfilColonia')) document.getElementById('perfilColonia').value = usuario.colonia || '';
  if (document.getElementById('perfilCP')) document.getElementById('perfilCP').value = usuario.codigo_postal || usuario.cp || '';

  // 6. Estatus y Apoyos (Discapacidad / Nuevo Comienzo)
  if (document.getElementById('perfilDiscapacidad')) {
    document.getElementById('perfilDiscapacidad').value = usuario.discapacidad || 'NINGUNA';
    evaluarNuevoComienzoPerfil();
  }
  if (document.getElementById('perfilTipoApoyo')) document.getElementById('perfilTipoApoyo').value = usuario.tipo_apoyo || '';
  if (document.getElementById('perfilContactoNombre')) document.getElementById('perfilContactoNombre').value = usuario.contacto_nombre || '';
  if (document.getElementById('perfilContactoParentesco')) document.getElementById('perfilContactoParentesco').value = usuario.contacto_parentesco || '';
  if (document.getElementById('perfilCredencialFolio')) document.getElementById('perfilCredencialFolio').value = usuario.credencial_folio || '';
  if (document.getElementById('perfilCredencialVencimiento')) {
    if (usuario.credencial_vencimiento) {
      const fechaVenc = new Date(usuario.credencial_vencimiento).toISOString().split('T')[0];
      document.getElementById('perfilCredencialVencimiento').value = fechaVenc;
    }
  }
}


/* ==========================================================================
   2. LÓGICA AL CARGAR EL DOM
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {

  /* ------------------------------------------------------------------------
     Navegación por Pestañas del Perfil
     ------------------------------------------------------------------------ */
  const navTabs = document.querySelectorAll('.nav-tab');
  const tabContent = document.querySelectorAll('.tab-content');

  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      navTabs.forEach(t => t.classList.remove('active'));
      tabContent.forEach(c => c.classList.remove('active'));

      tab.classList.add('active');
      const targetTab = tab.getAttribute('data-tab');
      const targetContent = document.getElementById(targetTab);
      if (targetContent) {
        targetContent.classList.add('active');
      }
    });
  });

  /* ------------------------------------------------------------------------
     0. Validación de CURP en Tiempo Real
     ------------------------------------------------------------------------ */
  const inputCurp = document.getElementById('curp');

  if (inputCurp) {
    inputCurp.addEventListener('input', (e) => {
      e.target.value = e.target.value.toUpperCase().trim();
      const regexCurp = /^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[A-Z0-9]{2}$/;
      
      if (e.target.value === '') {
        e.target.style.borderColor = '';
      } else if (regexCurp.test(e.target.value)) {
        e.target.style.borderColor = '#28a745';
      } else {
        e.target.style.borderColor = '#dc3545';
      }
    });
  }

  /* ------------------------------------------------------------------------
     0.1 Validación del Formulario de Registro (Apellidos)
     ------------------------------------------------------------------------ */
  const formReg = document.getElementById('formRegistro');

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
        curp: document.getElementById('curp')?.value,
        nombre: document.getElementById('nombre')?.value,
        primer_apellido: paterno,
        segundo_apellido: materno,
        correo: document.getElementById('correo')?.value,
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

        const resultado = await respuesta.json();

        if (respuesta.ok && resultado.exito) {
          alert('¡Registro completado con éxito!');
          formReg.reset();
          document.getElementById('modalRegistro').style.display = 'none';
          document.getElementById('modalLogin').style.display = 'flex';
        } else {
          alert(`Error al guardar: ${resultado.mensaje}`);
        }
      } catch (error) {
        console.error('Error al conectar con la API:', error);
        alert('Error de conexión con el servidor backend.');
      }
    });
  }

  /* ------------------------------------------------------------------------
     1. Navegación entre Vistas (Inicio y GeoPortal)
     ------------------------------------------------------------------------ */
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

      if (!mapa) {
        inicializarMapa();
      } else {
        setTimeout(() => mapa.invalidateSize(), 200);
      }
    }
  }

  if (btnEmpleos) btnEmpleos.addEventListener('click', mostrarGeoPortal);
  if (btnIrGeoPortal) btnIrGeoPortal.addEventListener('click', (e) => { e.preventDefault(); mostrarGeoPortal(); });
  if (btnVolverInicio) btnVolverInicio.addEventListener('click', (e) => { e.preventDefault(); mostrarInicio(); });

  /* ------------------------------------------------------------------------
     2. Inicialización del Mapa e Interacción
     ------------------------------------------------------------------------ */
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

  /* Filtros del Mapa */
  const btnToggleFiltros = document.getElementById('btnToggleFiltros');
  const filtroBox = document.getElementById('filtroBox');
  const btnBuscarMapa = document.getElementById('btnBuscarMapa');

  if (btnToggleFiltros && filtroBox) {
    btnToggleFiltros.addEventListener('click', () => {
      filtroBox.classList.toggle('colapsado');
    });
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

  /* ------------------------------------------------------------------------
     3. Controles de Accesibilidad (Sincronizados)
     ------------------------------------------------------------------------ */
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('modo-oscuro', 'dark-mode');
  }

  /* ------------------------------------------------------------------------
     4. Despliegue de Calendario Exclusivamente por Clic
     ------------------------------------------------------------------------ */
  const sectorCards = document.querySelectorAll('.sector-card');

  sectorCards.forEach(card => {
    card.addEventListener('click', (e) => {
      e.stopPropagation();
      const estaActivo = card.classList.contains('activo');
      
      sectorCards.forEach(c => c.classList.remove('activo'));

      if (!estaActivo) {
        card.classList.add('activo');
      }
    });
  });

  document.addEventListener('click', () => {
    sectorCards.forEach(c => c.classList.remove('activo'));
  });

  /* ------------------------------------------------------------------------
     5. Modales y Lógica de Sesión, Registro y Perfil
     ------------------------------------------------------------------------ */
  const btnUserAuth = document.getElementById('btnUserAuth');
  const btnCerrarLogin = document.getElementById('btnCerrarLogin');
  const btnCerrarRegistro = document.getElementById('btnCerrarRegistro');
  const btnIrARegistro = document.getElementById('btnIrARegistro');

  const modalLogin = document.getElementById('modalLogin');
  const modalRegistro = document.getElementById('modalRegistro');
  const modalPerfil = document.getElementById('modalPerfil');
  const btnCerrarPerfil = document.getElementById('btnCerrarPerfil');

  const formLogin = document.getElementById('formLogin');
  const formPerfil = document.getElementById('formPerfil');

  let usuarioActivo = JSON.parse(localStorage.getItem('usuarioActivo'));

  const btnMiPerfil = document.getElementById('btnMiPerfil');
  const btnCerrarSesion = document.getElementById('btnCerrarSesion');
  const txtNombreUsuario = document.getElementById('txtNombreUsuario');

  // Control de Estado de Sesión en el Encabezado
  function actualizarUIAutenticacion() {
    if (usuarioActivo) {
      if (btnUserAuth) btnUserAuth.style.display = 'none';
      if (btnMiPerfil) {
        btnMiPerfil.style.display = 'inline-flex';
        if (txtNombreUsuario) txtNombreUsuario.textContent = `Hola, ${usuarioActivo.nombre}`;
      }
      if (btnCerrarSesion) btnCerrarSesion.style.display = 'inline-flex';
    } else {
      if (btnUserAuth) btnUserAuth.style.display = 'inline-flex';
      if (btnMiPerfil) btnMiPerfil.style.display = 'none';
      if (btnCerrarSesion) btnCerrarSesion.style.display = 'none';
    }
  }

  // Ejecutar al cargar la página por primera vez
  actualizarUIAutenticacion();

  // Cargar Datos del Perfil desde la API (GET)
  async function cargarDatosPerfilAPI(curp) {
    try {
      const respuesta = await fetch(`http://localhost:3000/api/perfil/${curp}`);
      const datos = await respuesta.json();

      if (respuesta.ok && datos.exito) {
        cargarDatosPerfilEnModal(datos.usuario);
      } else {
        alert('No se pudo obtener la información del perfil.');
      }
    } catch (error) {
      console.error('Error al obtener el perfil:', error);
    }
  }

  // Abrir Login
  if (btnUserAuth && modalLogin) {
    btnUserAuth.addEventListener('click', () => {
      modalLogin.style.display = 'flex';
    });
  }

  // Abrir Perfil y consultar API
  if (btnMiPerfil) {
    btnMiPerfil.addEventListener('click', () => {
      if (modalPerfil) {
        modalPerfil.style.display = 'flex';
        if (usuarioActivo && usuarioActivo.curp) {
          cargarDatosPerfilAPI(usuarioActivo.curp);
        }
      } else {
        alert(`Configuración de perfil para ${usuarioActivo?.nombre || 'usuario'}`);
      }
    });
  }

  // Botones de Cierre (X)
  if (btnCerrarLogin && modalLogin) btnCerrarLogin.addEventListener('click', () => modalLogin.style.display = 'none');
  if (btnCerrarRegistro && modalRegistro) btnCerrarRegistro.addEventListener('click', () => modalRegistro.style.display = 'none');
  if (btnCerrarPerfil && modalPerfil) btnCerrarPerfil.addEventListener('click', () => modalPerfil.style.display = 'none');

  // Alternar entre Login y Registro
  if (btnIrARegistro && modalLogin && modalRegistro) {
    btnIrARegistro.addEventListener('click', () => {
      modalLogin.style.display = 'none';
      modalRegistro.style.display = 'flex';
    });
  }

  // Cerrar modales haciendo clic afuera
  window.addEventListener('click', (e) => {
    if (e.target === modalLogin) modalLogin.style.display = 'none';
    if (e.target === modalRegistro) modalRegistro.style.display = 'none';
    if (e.target === modalPerfil) modalPerfil.style.display = 'none';
  });
/* ============================================================================
   FUNCIÓN AUXILIAR: CARGAR DATOS DE ESTUDIOS EN EL FORMULARIO
   ============================================================================ */
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
  if (aniosInput) aniosInput.value = usuario.experiencia_anios !== undefined && usuario.experiencia_anios !== null ? usuario.experiencia_anios : '';
  if (mesesInput) mesesInput.value = usuario.experiencia_meses !== undefined && usuario.experiencia_meses !== null ? usuario.experiencia_meses : '';

  // Manejar radios de "Estudias actualmente"
  const estudiaActualmente = usuario.estudias_actualmente === true || usuario.estudias_actualmente === 'true' || usuario.estudias_actualmente === 'Si';
  const radioSi = document.getElementById('estudiasSi');
  const radioNo = document.getElementById('estudiasNo');

  if (estudiaActualmente && radioSi) {
    radioSi.checked = true;
  } else if (radioNo) {
    radioNo.checked = true;
  }

  // 1. Empleos solicitados
  const empleoSolicitado = document.getElementById('empleoSolicitado');
  const segundaOpcion = document.getElementById('segundaOpcionSolicitada');
  if (empleoSolicitado) empleoSolicitado.value = usuario.empleo_solicitado || '';
  if (segundaOpcion) segundaOpcion.value = usuario.segunda_opcion_empleo || '';

  // 2. Radio: ¿Tienes experiencia laboral?
  const tieneExp = usuario.tiene_experiencia === true || usuario.tiene_experiencia === 'true' || usuario.tiene_experiencia === 'Si';
  const radioExpSi = document.getElementById('expSi');
  const radioExpNo = document.getElementById('expNo');
  if (tieneExp && radioExpSi) {
    radioExpSi.checked = true;
  } else if (radioExpNo) {
    radioExpNo.checked = true;
  }
}

/* ==========================================
   5.3 Control de Eventos de Modales y Perfil
   ========================================== */
// Abrir Login
if (btnUserAuth && modalLogin) {
  btnUserAuth.addEventListener('click', () => {
    modalLogin.style.display = 'flex';
  });
}

// Abrir Perfil y consultar API
if (btnMiPerfil) {
  btnMiPerfil.addEventListener('click', () => {
    if (modalPerfil) {
      modalPerfil.style.display = 'flex';
      if (usuarioActivo && usuarioActivo.curp) {
        cargarDatosPerfil(usuarioActivo.curp);
      }
    } else {
      alert(`Configuración de perfil para ${usuarioActivo?.nombre || 'usuario'}`);
    }
  });
}

// Botones de Cierre (X)
if (btnCerrarLogin && modalLogin) btnCerrarLogin.addEventListener('click', () => modalLogin.style.display = 'none');
if (btnCerrarRegistro && modalRegistro) btnCerrarRegistro.addEventListener('click', () => modalRegistro.style.display = 'none');
if (btnCerrarPerfil && modalPerfil) btnCerrarPerfil.addEventListener('click', () => modalPerfil.style.display = 'none');

// Alternar entre Login y Registro
if (btnIrARegistro && modalLogin && modalRegistro) {
  btnIrARegistro.addEventListener('click', () => {
    modalLogin.style.display = 'none';
    modalRegistro.style.display = 'flex';
  });
}

// Cerrar modales haciendo clic afuera
window.addEventListener('click', (e) => {
  if (e.target === modalLogin) modalLogin.style.display = 'none';
  if (e.target === modalRegistro) modalRegistro.style.display = 'none';
  if (e.target === modalPerfil) modalPerfil.style.display = 'none';
});

/* ==========================================
   5.4 Peticiones HTTP (Login, Guardar Perfil, Salir)
   ========================================== */
// Login
if (formLogin) {
  formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    const correo = document.getElementById('loginCorreo').value;
    const password = document.getElementById('loginPassword').value;

    try {
      const respuesta = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, password })
      });

  // 3. Datos del último empleo
  const ultimoEmpresa = document.getElementById('ultimoEmpresa');
  const ultimoPuesto = document.getElementById('ultimoPuesto');
  const ultimoFunciones = document.getElementById('ultimoFuncionesTiempo');
  if (ultimoEmpresa) ultimoEmpresa.value = usuario.ultimo_empresa || '';
  if (ultimoPuesto) ultimoPuesto.value = usuario.ultimo_puesto || '';
  if (ultimoFunciones) ultimoFunciones.value = usuario.ultimo_funciones_tiempo || '';

  // 4. Detalle general y Habilidades
  const expDetalle = document.getElementById('experienciaDetalle');
  const habilidades = document.getElementById('habilidadesDetalle');
  if (expDetalle) expDetalle.value = usuario.experiencia_detalle || '';
  if (habilidades) habilidades.value = usuario.habilidades_detalle || '';
}
  /* Peticiones HTTP (Login, Guardar Perfil, Salir) */
  if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();
      const correo = document.getElementById('loginCorreo')?.value;
      const password = document.getElementById('loginPassword')?.value;

      try {
        const respuesta = await fetch('http://localhost:3000/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ correo, password })
        });

        const datos = await respuesta.json();

        if (respuesta.ok && datos.exito) {
          localStorage.setItem('usuarioActivo', JSON.stringify(datos.usuario));
          usuarioActivo = datos.usuario;
          
          // Llenar inmediatamente los campos del modal de perfil con los datos recibidos
          cargarDatosPerfilEnModal(datos.usuario);
          actualizarUIAutenticacion();
          
          alert(`¡Bienvenido/a, ${datos.usuario.nombre}!`);
          formLogin.reset();
          modalLogin.style.display = 'none';
        } else {
          alert(datos.mensaje || 'Error al iniciar sesión.');
        }
      } catch (error) {
        console.error('Error de conexión:', error);
        alert('No se pudo conectar con el servidor.');
      }
    });
  }

/* GUARDAR CAMBIOS DE PERFIL (PUT) */
if (formPerfil) {
  formPerfil.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 1. Obtener la CURP de forma segura (del input o del objeto de sesión)
    const curpInput = document.getElementById('perfilCurp')?.value;
    const curp = (curpInput || usuarioActivo?.curp || '').trim();

    if (!curp) {
      alert('Error: No se encontró la CURP del usuario.');
      return;
    }

    // Función auxiliar para obtener el primer valor real (no vacío) entre dos inputs
    const obtenerValor = (id1, id2) => {
      const val1 = document.getElementById(id1)?.value?.trim();
      const val2 = document.getElementById(id2)?.value?.trim();
      if (val1) return val1;
      if (val2) return val2;
      return null;
    };

    // 2. Construir el objeto con datos limpios
    const datosActualizados = {
      curp: curp,
      nombre: obtenerValor('perfilNombreSidebar', 'perfilNombre'),
      primer_apellido: obtenerValor('perfilPrimerApellidoSidebar', 'perfilPrimerApellido'),
      segundo_apellido: obtenerValor('perfilSegundoApellidoSidebar', 'perfilSegundoApellido'),
      correo: document.getElementById('perfilCorreo')?.value?.trim() || null,
      fecha_nacimiento: document.getElementById('perfilFechaNac')?.value || null,
      edad: document.getElementById('perfilEdad')?.value ? parseInt(document.getElementById('perfilEdad').value, 10) : null,
      sexo: document.getElementById('perfilSexo')?.value || document.querySelector('input[name="perfilSexo"]:checked')?.value || 'O',
      
      // Datos de residencia y contacto
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
      
      // Apoyos y credencial
      discapacidad: document.getElementById('perfilDiscapacidad')?.value || 'NINGUNA',
      es_nuevo_comienzo: (document.getElementById('perfilDiscapacidad')?.value || 'NINGUNA') !== 'NINGUNA',
      tipo_apoyo: document.getElementById('perfilTipoApoyo')?.value?.trim() || null,
      contacto_nombre: document.getElementById('perfilContactoNombre')?.value?.trim() || null,
      contacto_parentesco: document.getElementById('perfilContactoParentesco')?.value?.trim() || null,
      credencial_folio: document.getElementById('perfilCredencialFolio')?.value?.trim() || null,
      credencial_vencimiento: document.getElementById('perfilCredencialVencimiento')?.value || null,

      // Sección Estudios
      grado_estudios: document.getElementById('estudiosGrado')?.value || document.getElementById('gradoEstudios')?.value || null,
      titulado: document.getElementById('estudiosTitulado')?.value || document.getElementById('titulado')?.value || 'No',
      profesion: document.getElementById('estudiosProfesion')?.value || document.getElementById('profesion')?.value || null,
      estudias_actualmente: document.getElementById('estudiasSi')?.checked || false,
      que_estudias: document.getElementById('queEstudias')?.value?.trim() || null,
      conocimientos_generales: document.getElementById('conocimientosGenerales')?.value?.trim() || null,

      // Sección Experiencia Laboral
      empleo_solicitado: document.getElementById('empleoSolicitado')?.value || null,
      segunda_opcion_empleo: document.getElementById('segundaOpcionSolicitada')?.value || null,
      tiene_experiencia: document.getElementById('expSi')?.checked || false,
      ultimo_empresa: document.getElementById('ultimoEmpresa')?.value?.trim() || null,
      ultimo_puesto: document.getElementById('ultimoPuesto')?.value?.trim() || null,
      ultimo_funciones_tiempo: document.getElementById('ultimoFuncionesTiempo')?.value?.trim() || null,
      experiencia_detalle: document.getElementById('experienciaDetalle')?.value?.trim() || null,
      experiencia_anios: parseInt(document.getElementById('experienciaAnios')?.value || 0, 10),
      experiencia_meses: parseInt(document.getElementById('experienciaMeses')?.value || 0, 10),
      habilidades_detalle: document.getElementById('habilidadesDetalle')?.value?.trim() || null
    };

    console.log('Enviando datos al servidor:', datosActualizados);

    try {
      const respuesta = await fetch(`http://localhost:3000/api/perfil/${encodeURIComponent(curp)}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(datosActualizados)
      });

      const resultado = await respuesta.json();

      if (respuesta.ok && resultado.exito) {
        alert('¡Perfil actualizado con éxito en la base de datos!');
        
        // Actualizar localStorage y la variable global en memoria
        const usuarioSesion = JSON.parse(localStorage.getItem('usuarioActivo')) || {};
        const usuarioActualizado = { ...usuarioSesion, ...datosActualizados };
        
        localStorage.setItem('usuarioActivo', JSON.stringify(usuarioActualizado));
        usuarioActivo = usuarioActualizado;
        
        if (typeof actualizarUIAutenticacion === 'function') {
          actualizarUIAutenticacion();
        }
      } else {
        alert(`Error al actualizar en la base de datos: ${resultado.mensaje || 'Respuesta no exitosa'}`);
      }
    } catch (error) {
      console.error('Error al conectar con la API:', error);
      alert('No se pudo conectar con el servidor backend. Revisa la consola (F12).');
    }
  });
}

  // Cerrar Sesión
  if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener('click', () => {
      localStorage.removeItem('usuarioActivo');
      usuarioActivo = null;
      actualizarUIAutenticacion();
      alert('Sesión cerrada.');
    });
  }

  /* ------------------------------------------------------------------------
     6. Asistente Virtual y Tour Interactivo
     ------------------------------------------------------------------------ */
  const btnHelp = document.getElementById('btnHelp');
  const assistantBox = document.getElementById('assistantBox');
  const tutorialOverlay = document.getElementById('tutorialOverlay');
  const assistantText = document.getElementById('assistantText');
  const btnNextStep = document.getElementById('btnNextStep');
  const btnSkipTutorial = document.getElementById('btnSkipTutorial');
  const btnVoiceRead = document.getElementById('btnVoiceRead');

  let pasoActual = 0;

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
    if (assistantBox) assistantBox.style.display = 'block';
    if (tutorialOverlay) tutorialOverlay.style.display = 'block';
    mostrarPaso();
  }

  function finalizarTutorial() {
    if (assistantBox) assistantBox.style.display = 'none';
    if (tutorialOverlay) tutorialOverlay.style.display = 'none';
    quitarResaltados();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }

  function quitarResaltados() {
    document.querySelectorAll('.highlight-step').forEach(el => el.classList.remove('highlight-step'));
  }

  function mostrarPaso() {
    quitarResaltados();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();

    const esGeoPortal = vistaGeoPortal && vistaGeoPortal.style.display !== 'none';
    const pasarela = esGeoPortal ? tutorialesPorSeccion.geoportal : tutorialesPorSeccion.inicio;

    if (pasoActual >= pasarela.length) {
      finalizarTutorial();
      return;
    }

    const paso = pasarela[pasoActual];
    if (assistantText) assistantText.textContent = paso.text;

    const elTarget = document.getElementById(paso.elementId);
    if (elTarget) {
      elTarget.classList.add('highlight-step');
      elTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  if (btnHelp) btnHelp.addEventListener('click', iniciarTutorial);
  if (btnNextStep) {
    btnNextStep.addEventListener('click', () => {
      pasoActual++;
      mostrarPaso();
    });
  }
  if (btnSkipTutorial) btnSkipTutorial.addEventListener('click', finalizarTutorial);

  if (btnVoiceRead) {
    btnVoiceRead.addEventListener('click', () => {
      if ('speechSynthesis' in window && assistantText) {
        window.speechSynthesis.cancel();
        const locucion = new SpeechSynthesisUtterance(assistantText.textContent);
        locucion.lang = 'es-ES';
        window.speechSynthesis.speak(locucion);
      }
    });
  }
  
  /* ------------------------------------------------------------------------
     7. PANEL DE ACCESIBILIDAD (GLOBAL)
     ------------------------------------------------------------------------ */
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



  // ==========================================
  // FUNCIONES GLOBALES DE ACCESIBILIDAD
  // ==========================================

  // Tamaño de fuente (global)
  function cambiarFuente(accion) {
    let current = parseInt(localStorage.getItem('textSize') || '100', 10);
    let nuevo = accion === 'aumentar' ? Math.min(current + 10, 160) : Math.max(current - 10, 100);
    document.body.style.fontSize = nuevo + '%';
    localStorage.setItem('textSize', nuevo);
    const label = document.getElementById('tamanoTextoLabel');
    if (label) label.textContent = nuevo + '%';
  }

  // Toggle de clases
  function toggleClase(className, key) {
    document.body.classList.toggle(className);
    const isActive = document.body.classList.contains(className);
    localStorage.setItem(key, isActive ? 'true' : 'false');

    // Actualizar estado visual del botón
    document.querySelectorAll(`[data-accion="${key}"]`).forEach(btn => {
      btn.classList.toggle('active', isActive);
    });
  }

  // Funciones específicas para cada acción
  window.toggleAltoContraste = () => toggleClase('alto-contraste', 'altoContraste');
  
  window.toggleModoOscuro = () => {
    document.body.classList.toggle('modo-oscuro');
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('modo-oscuro');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    document.querySelectorAll('[data-accion="modoOscuro"]').forEach(btn => {
      btn.classList.toggle('active', isDark);
    });
  };
  
  window.toggleSubrayar = () => toggleClase('subrayar-enlaces', 'subrayarEnlaces');
  window.toggleLecturaFacil = () => toggleClase('texto-facil', 'textofacil'); 
  window.toggleBotonesGrandes = () => toggleClase('botones-grandes', 'botonesGrandes');
  window.toggleNavegacionTeclado = () => toggleClase('navegacion-teclado', 'navegacionTeclado');
  window.toggleModoLectura = () => toggleClase('modo-lectura', 'modoLectura');
  window.toggleResaltarTitulos = () => toggleClase('resaltar-titulos', 'resaltarTitulos');

  // Saltar al contenido
  window.saltarContenido = () => {
    const main = document.querySelector('main');
    if (main) {
      main.setAttribute('tabindex', '-1');
      main.focus();
      main.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // ==========================================
  // LECTOR DE PANTALLA (Web Speech API)
  // ==========================================
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

  window.leerTodo = () => {
    const bodyText = document.body.innerText;
    leerTexto(bodyText);
  };

  window.leerSeleccion = () => {
    const seleccion = window.getSelection().toString();
    if (seleccion) {
      leerTexto(seleccion);
    } else {
      alert('Selecciona un texto con el mouse o el teclado para leerlo en voz alta.');
    }
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

  // Velocidad de voz
  const velocidadInput = document.getElementById('velocidadVoz');
  const velocidadLabel = document.getElementById('velocidadLabel');
  if (velocidadInput && velocidadLabel) {
    velocidadInput.addEventListener('input', () => {
      velocidadLabel.textContent = parseFloat(velocidadInput.value).toFixed(1) + 'x';
    });
  }

  // ==========================================
  // ASIGNAR EVENTOS A LOS BOTONES DEL PANEL
  // ==========================================

  // Botones de fuente
  document.querySelectorAll('.btn-fuente').forEach(btn => {
    btn.addEventListener('click', () => {
      const accion = btn.dataset.accion;
      if (accion === 'aumentar' || accion === 'disminuir') {
        cambiarFuente(accion);
      }
    });
  });

  // Botones toggle
  document.querySelectorAll('.btn-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const accion = btn.dataset.accion;
      const funciones = {
        'altoContraste': window.toggleAltoContraste,
        'modoOscuro': window.toggleModoOscuro,
        'subrayarEnlaces': window.toggleSubrayar,
        'lecturaFacil': window.toggleLecturaFacil, // Sincronizado con el HTML
        'botonesGrandes': window.toggleBotonesGrandes,
        'navegacionTeclado': window.toggleNavegacionTeclado,
        'modoLectura': window.toggleModoLectura,
        'resaltarTitulos': window.toggleResaltarTitulos,
        'saltarContenido': window.saltarContenido
      };
      if (funciones[accion]) funciones[accion]();
    });
  });

  // Botones de lectura
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

  // ==========================================
  // RESTAURAR PREFERENCIAS GUARDADAS
  // ==========================================
  function restaurarAccesibilidad() {
    const preferencias = {
      'altoContraste': 'alto-contraste',
      'subrayarEnlaces': 'subrayar-enlaces',
      'lecturaFacil': 'texto-facil', 
      'botonesGrandes': 'botones-grandes',
      'navegacionTeclado': 'navegacion-teclado',
      'modoLectura': 'modo-lectura',
      'resaltarTitulos': 'resaltar-titulos'
};

    Object.entries(preferencias).forEach(([key, className]) => {
      if (localStorage.getItem(key) === 'true') {
        document.body.classList.add(className);
        document.querySelectorAll(`[data-accion="${key}"]`).forEach(btn => {
          btn.classList.add('active');
        });
      }
    });

    // Modo oscuro
    if (localStorage.getItem('theme') === 'dark') {
      document.body.classList.add('modo-oscuro', 'dark-mode');
      document.querySelectorAll('[data-accion="modoOscuro"]').forEach(btn => {
        btn.classList.add('active');
      });
    }
  }

  // Ejecutar al cargar
  restaurarAccesibilidad();
  
});