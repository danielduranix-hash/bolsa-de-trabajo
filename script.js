/* ==========================================
   Función Global para el evento inline onchange
   ========================================== */
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

document.addEventListener('DOMContentLoaded', () => {

/* ==========================================
     0. Validación de CURP en Tiempo Real
     ========================================== */
  const inputCurp = document.getElementById('curp');

  if (inputCurp) {
    inputCurp.addEventListener('input', (e) => {
      // 1. Convertir a mayúsculas automáticamente
      e.target.value = e.target.value.toUpperCase().trim();
      
      // 2. Expresión regular oficial de la CURP (18 caracteres)
      const regexCurp = /^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[A-Z0-9]{2}$/;
      
      // 3. Cambiar color del borde según el formato
      if (e.target.value === '') {
        e.target.style.borderColor = '';
      } else if (regexCurp.test(e.target.value)) {
        e.target.style.borderColor = '#28a745'; // Borde Verde (Válida)
      } else {
        e.target.style.borderColor = '#dc3545'; // Borde Rojo (Inválida)
      }
    });
  }
  /* ==========================================
   0.1 Validación del Formulario de Registro (Apellidos)
   ========================================== */
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

    // Mapeo exacto con los nombres de variables que espera server.js
    const datosRegistro = {
      curp: document.getElementById('curp')?.value,
      nombre: document.getElementById('nombre')?.value,
      primer_apellido: paterno,
      segundo_apellido: materno,
      correo: document.getElementById('correo')?.value,
      password: document.getElementById('password')?.value,
      fecha_nacimiento: document.getElementById('fechaNacimiento')?.value,
      sexo: document.getElementById('sexo')?.value,
      
      // Ajuste de valores booleanos y arrays esperados por el Backend
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

  /* ==========================================
     1. Navegación entre Vistas (Inicio y GeoPortal)
     ========================================== */
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

  /* ==========================================
     2. Inicialización del Mapa e Interacción
     ========================================== */
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

  /* ==========================================
     3. Controles de Accesibilidad (Sincronizados)
     ========================================== */

  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('modo-oscuro', 'dark-mode');
  }

  /* ==========================================
     4. Despliegue de Calendario Exclusivamente por Clic
     ========================================== */
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

/* ==========================================
   5. Modales y Lógica de Sesión, Registro y Perfil
   ========================================== */
const btnUserAuth = document.getElementById('btnUserAuth');
const btnCerrarLogin = document.getElementById('btnCerrarLogin');
const btnCerrarRegistro = document.getElementById('btnCerrarRegistro');
const btnIrARegistro = document.getElementById('btnIrARegistro');

const modalLogin = document.getElementById('modalLogin');
const modalRegistro = document.getElementById('modalRegistro');
const modalPerfil = document.getElementById('modalPerfil');
const btnCerrarPerfil = document.getElementById('btnCerrarPerfil');

const formLogin = document.getElementById('formLogin');
const formRegistro = document.getElementById('formRegistro');
const formPerfil = document.getElementById('formPerfil');

/* ==========================================
   5.1 Control de Estado de Sesión en el Encabezado
   ========================================== */
let usuarioActivo = JSON.parse(localStorage.getItem('usuarioActivo'));

const btnMiPerfil = document.getElementById('btnMiPerfil');
const btnCerrarSesion = document.getElementById('btnCerrarSesion');
const txtNombreUsuario = document.getElementById('txtNombreUsuario');

// Función reutilizable para refrescar la interfaz al instante
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

/* ==========================================
   5.2 Cargar Datos del Perfil desde la API
   ========================================== */
async function cargarDatosPerfil(curp) {
  try {
    const respuesta = await fetch(`http://localhost:3000/api/perfil/${curp}`);
    const datos = await respuesta.json();

    if (respuesta.ok && datos.exito) {
      const u = datos.usuario;
      
      // 1. CURP y Nombre
      if (document.getElementById('perfilCurp')) document.getElementById('perfilCurp').value = u.curp || '';
      if (document.getElementById('perfilNombre')) document.getElementById('perfilNombre').value = u.nombre || '';
      
      // 2. Apellidos (Coincidiendo con los IDs de tu HTML)
      if (document.getElementById('perfilPrimerApellido')) document.getElementById('perfilPrimerApellido').value = u.primer_apellido || '';
      if (document.getElementById('perfilSegundoApellido')) document.getElementById('perfilSegundoApellido').value = u.segundo_apellido || '';
      
      // 3. Correo
      if (document.getElementById('perfilCorreo')) document.getElementById('perfilCorreo').value = u.correo || '';
      
      // 4. Fecha de Nacimiento (Parseada a YYYY-MM-DD para el input type="date")
      if (document.getElementById('perfilFechaNac') && u.fecha_nacimiento) {
        const fechaFormateada = new Date(u.fecha_nacimiento).toISOString().split('T')[0];
        document.getElementById('perfilFechaNac').value = fechaFormateada;
      }

      // 5. Sexo (Asignando el valor al elemento <select>)
      if (document.getElementById('perfilSexo') && u.sexo) {
        document.getElementById('perfilSexo').value = u.sexo;
      }
    } else {
      alert('No se pudo obtener la información del perfil.');
    }
  } catch (error) {
    console.error('Error al obtener el perfil:', error);
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

      const datos = await respuesta.json();

      if (respuesta.ok && datos.exito) {
        localStorage.setItem('usuarioActivo', JSON.stringify(datos.usuario));
        usuarioActivo = datos.usuario; // Sincronizar variable global
        actualizarUIAutenticacion();  // Refrescar UI sin recargar
        
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

// Guardar Cambios de Perfil (PUT)
if (formPerfil) {
  formPerfil.addEventListener('submit', async (e) => {
    e.preventDefault();

    const datosActualizados = {
      curp: document.getElementById('perfilCurp')?.value,
      nombre: document.getElementById('perfilNombre')?.value,
      primer_apellido: document.getElementById('perfilPrimerApellido')?.value,
      segundo_apellido: document.getElementById('perfilSegundoApellido')?.value,
      correo: document.getElementById('perfilCorreo')?.value,
      fecha_nacimiento: document.getElementById('perfilFechaNac')?.value,
      sexo: document.getElementById('perfilSexo')?.value
    };

    try {
      const respuesta = await fetch(`http://localhost:3000/api/perfil/${datosActualizados.curp}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosActualizados)
      });

      const resultado = await respuesta.json();

      if (respuesta.ok && resultado.exito) {
        alert('¡Perfil actualizado con éxito!');

        // Actualización segura de la variable y el localStorage
        const usuarioGuardado = JSON.parse(localStorage.getItem('usuarioActivo')) || {};
        const usuarioActualizado = {
          ...usuarioGuardado,
          curp: datosActualizados.curp,
          nombre: datosActualizados.nombre
        };

        localStorage.setItem('usuarioActivo', JSON.stringify(usuarioActualizado));
        usuarioActivo = usuarioActualizado;

        actualizarUIAutenticacion(); // Refrescar saludo en el header
        if (modalPerfil) modalPerfil.style.display = 'none';
      } else {
        alert(`Error al actualizar: ${resultado.mensaje}`);
      }
    } catch (error) {
      console.error('Error al guardar cambios:', error);
      alert('No se pudo conectar con el servidor.');
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

 /* ==========================================
     6. Asistente Virtual y Tour Interactivo
     ========================================== */
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
      {
        elementId: 'btnEmpleos',
        text: 'Bienvenido. Desde este botón puedes acceder directamente al GeoPortal de empleos.'
      },
      {
        elementId: 'heroEmpresas',
        text: 'Si eres empleador, esta sección te orienta sobre cómo publicar y administrar tus ofertas laborales.'
      },
      {
        elementId: 'bannerCV',
        text: 'Aquí puedes usar nuestro generador inteligente para estructurar un currículum profesional en minutos.'
      },
      {
        elementId: 'gridCiudadano',
        text: 'En el espacio ciudadano encontrarás herramientas para buscar empleo y profesionalizar tu perfil.'
      },
      {
        elementId: 'seccionCalendario',
        text: 'Haz clic en cada tarjeta para abrir su calendario mensual interactivo con fechas de atención.'
      }
    ],
    geoportal: [
      {
        elementId: 'filtroBox',
        text: 'Usa este panel de filtros para acotar las vacantes por zona geográfica, puesto o categoría.'
      },
      {
        elementId: 'mapa',
        text: 'Haz clic en los marcadores interactivos dentro del mapa para ver los detalles de cada vacante y postularte.'
      }
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
  
  /* ==========================================
     7. PANEL DE ACCESIBILIDAD (GLOBAL)
     ========================================== */

  // Elementos del panel
  const btnAccesibilidad = document.getElementById('btnAccesibilidad');
  const panelAccesibilidad = document.getElementById('panelAccesibilidad');
  const btnCerrarAccesibilidad = document.getElementById('btnCerrarAccesibilidad');
  const tabs = document.querySelectorAll('.tab-accesibilidad');
  const tabContents = document.querySelectorAll('.tab-content-accesibilidad');

  // Abrir/Cerrar panel
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

  // Cambio de pestañas
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
  window.toggleEspaciado = () => toggleClase('espaciado-legible', 'espaciado');
  window.toggleFuenteLegible = () => toggleClase('fuente-legible', 'fuenteLegible');
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
        'espaciado': window.toggleEspaciado,
        'fuenteLegible': window.toggleFuenteLegible,
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
      'espaciado': 'espaciado-legible',
      'fuenteLegible': 'fuente-legible',
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