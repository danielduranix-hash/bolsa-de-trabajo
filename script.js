document.addEventListener('DOMContentLoaded', () => {

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
     3. Controles de Accesibilidad
     ========================================== */
  const btnToggleDarkMode = document.getElementById('btnToggleDarkMode');
  const textSizeSlider = document.getElementById('textSizeSlider');
  const textSizeLabel = document.getElementById('textSizeLabel');
  const btnTextSmaller = document.getElementById('btnTextSmaller');
  const btnTextLarger = document.getElementById('btnTextLarger');

  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('modo-oscuro', 'dark-mode');
  }

  if (btnToggleDarkMode) {
    btnToggleDarkMode.addEventListener('click', () => {
      document.body.classList.toggle('modo-oscuro');
      document.body.classList.toggle('dark-mode');

      const isDark = document.body.classList.contains('modo-oscuro');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
  }

  function updateTextSize(val) {
    if (textSizeSlider && textSizeLabel) {
      textSizeSlider.value = val;
      textSizeLabel.textContent = `${val}%`;
      document.body.style.fontSize = `${val}%`;
      localStorage.setItem('textSize', val);
    }
  }

  if (textSizeSlider) {
    textSizeSlider.addEventListener('input', (e) => updateTextSize(e.target.value));
  }
  if (btnTextSmaller) {
    btnTextSmaller.addEventListener('click', () => {
      let current = parseInt(textSizeSlider.value, 10);
      if (current > 80) updateTextSize(current - 5);
    });
  }
  if (btnTextLarger) {
    btnTextLarger.addEventListener('click', () => {
      let current = parseInt(textSizeSlider.value, 10);
      if (current < 130) updateTextSize(current + 5);
    });
  }

  const savedSize = localStorage.getItem('textSize');
  if (savedSize) updateTextSize(savedSize);

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
     5. Modales y Lógica de Registro con PostgreSQL
     ========================================== */
  const btnUserAuth = document.getElementById('btnUserAuth');
  const btnCerrarLogin = document.getElementById('btnCerrarLogin');
  const btnCerrarRegistro = document.getElementById('btnCerrarRegistro');
  const btnIrARegistro = document.getElementById('btnIrARegistro');

  const modalLogin = document.getElementById('modalLogin');
  const modalRegistro = document.getElementById('modalRegistro');

  const formLogin = document.getElementById('formLogin');
  const formRegistro = document.getElementById('formRegistro');

  // Abrir modal Login
  if (btnUserAuth && modalLogin) {
    btnUserAuth.addEventListener('click', () => {
      modalLogin.style.display = 'flex';
    });
  }

  // Cerrar modales con sus botones 'X'
  if (btnCerrarLogin && modalLogin) {
    btnCerrarLogin.addEventListener('click', () => {
      modalLogin.style.display = 'none';
    });
  }

  if (btnCerrarRegistro && modalRegistro) {
    btnCerrarRegistro.addEventListener('click', () => {
      modalRegistro.style.display = 'none';
    });
  }

  // Cambiar de Login a Registro
  if (btnIrARegistro && modalLogin && modalRegistro) {
    btnIrARegistro.addEventListener('click', () => {
      modalLogin.style.display = 'none';
      modalRegistro.style.display = 'flex';
    });
  }

  // Cerrar modales al hacer clic en el fondo oscuro
  window.addEventListener('click', (e) => {
    if (e.target === modalLogin) modalLogin.style.display = 'none';
    if (e.target === modalRegistro) modalRegistro.style.display = 'none';
  });

  // --- LÓGICA DE CAMPOS CONDICIONALES (GRUPO VULNERABLE Y DISCAPACIDAD) ---
  const vulnerableSi = document.getElementById('vulnerableSi');
  const vulnerableNo = document.getElementById('vulnerableNo');
  const boxTipoVulnerable = document.getElementById('boxTipoVulnerable');
  const selectTipoVulnerable = document.getElementById('selectTipoVulnerable');
  const boxCatalogoDiscapacidad = document.getElementById('boxCatalogoDiscapacidad');

  function toggleVulnerable() {
    if (vulnerableSi && vulnerableSi.checked) {
      boxTipoVulnerable.classList.remove('oculto');
      selectTipoVulnerable.setAttribute('required', 'true');
    } else if (boxTipoVulnerable) {
      boxTipoVulnerable.classList.add('oculto');
      selectTipoVulnerable.removeAttribute('required');
      selectTipoVulnerable.value = '';
      
      if (boxCatalogoDiscapacidad) boxCatalogoDiscapacidad.classList.add('oculto');
      limpiarCheckboxesDiscapacidad();
    }
  }

  if (vulnerableSi && vulnerableNo) {
    vulnerableSi.addEventListener('change', toggleVulnerable);
    vulnerableNo.addEventListener('change', toggleVulnerable);
  }

  if (selectTipoVulnerable) {
    selectTipoVulnerable.addEventListener('change', (e) => {
      if (e.target.value === 'discapacidad') {
        boxCatalogoDiscapacidad.classList.remove('oculto');
      } else {
        boxCatalogoDiscapacidad.classList.add('oculto');
        limpiarCheckboxesDiscapacidad();
      }
    });
  }

  function limpiarCheckboxesDiscapacidad() {
    const checkboxes = document.querySelectorAll('input[name="tipoDiscapacidad"]');
    checkboxes.forEach(cb => cb.checked = false);
  }

// Envío Formulario Login con autenticación real
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
          // Guardar el usuario activo en la memoria local del navegador
          localStorage.setItem('usuarioActivo', JSON.stringify(datos.usuario));
          
          alert(`¡Bienvenido/a, ${datos.usuario.nombre}!`);
          formLogin.reset();
          modalLogin.style.display = 'none';
          
          // Opcional: Recargar o actualizar la UI con el nombre del usuario
          location.reload(); 
        } else {
          alert(datos.mensaje || 'Error al iniciar sesión.');
        }
      } catch (error) {
        console.error('Error de conexión:', error);
        alert('No se pudo conectar con el servidor.');
      }
    });
  }
  // Envío Formulario Registro con PostgreSQL y Validaciones
  if (formRegistro) {
    formRegistro.addEventListener('submit', async (e) => {
      e.preventDefault();

      const pass = document.getElementById('password')?.value;
      const confirmPass = document.getElementById('confirmPassword')?.value;

      if (pass !== confirmPass) {
        alert("Las contraseñas no coinciden. Por favor, verifica nuevamente.");
        return;
      }

      // Validar reglas de la contraseña: Alfanumérica, sin comas, acentos ni 'ñ'
      const regexPassword = /^[a-zA-Z0-9]+$/;
      if (!regexPassword.test(pass)) {
        alert("La contraseña no cumple con el formato: no debe contener comas, acentos, la letra 'ñ' ni caracteres especiales.");
        return;
      }

      // Validar selección de discapacidad si aplica
      if (selectTipoVulnerable && selectTipoVulnerable.value === 'discapacidad') {
        const seleccionados = document.querySelectorAll('input[name="tipoDiscapacidad"]:checked');
        if (seleccionados.length === 0) {
          alert("Por favor, selecciona al menos una opción del catálogo de discapacidades.");
          return;
        }
      }

      // Recopilar selecciones múltiples de discapacidad
      const discapacidadesElegidas = Array.from(
        document.querySelectorAll('input[name="tipoDiscapacidad"]:checked')
      ).map(cb => cb.value);

      // Mapeo de datos para enviar al Backend en PostgreSQL
      const datosUsuario = {
        curp: document.getElementById('curp')?.value,
        correo: document.getElementById('correo')?.value,
        password: pass,
        nombre: document.getElementById('nombre')?.value,
        primer_apellido: document.getElementById('apellidoPaterno')?.value,
        segundo_apellido: document.getElementById('apellidoMaterno')?.value,
        fecha_nacimiento: document.getElementById('fechaNacimiento')?.value,
        sexo: document.querySelector('input[name="sexo"]:checked')?.value,
        pertenece_grupo_vulnerable: vulnerableSi ? vulnerableSi.checked : false,
        grupos_vulnerables: selectTipoVulnerable?.value ? [selectTipoVulnerable.value] : [],
        tiene_discapacidad: selectTipoVulnerable?.value === 'discapacidad',
        tipos_discapacidad: discapacidadesElegidas
      };

      try {
        // Petición al Backend en Node.js / PostgreSQL
        const respuesta = await fetch('http://localhost:3000/api/registro', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(datosUsuario)
        });

        const resultado = await respuesta.json();

        if (respuesta.ok && resultado.exito) {
          alert("¡Tu cuenta ha sido creada exitosamente en la base de datos!");
          formRegistro.reset();
          toggleVulnerable();
          modalRegistro.style.display = 'none';
        } else {
          // Si la CURP ya existe o el correo está duplicado
          if (resultado.codigo === 'CURP_DUPLICADA') {
            alert(`Atención: ${resultado.mensaje}`);
          } else {
            alert(`Error en el registro: ${resultado.mensaje}`);
          }
        }
      } catch (error) {
        console.error("Error de red o conexión:", error);
        alert("No se pudo conectar con el servidor de la base de datos. Verifica que el servidor (Node.js) esté encendido.");
      }
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
    let nuevo = accion === 'aumentar' ? Math.min(current + 10, 150) : Math.max(current - 10, 70);
    document.body.style.fontSize = nuevo + '%';
    localStorage.setItem('textSize', nuevo);
    const label = document.getElementById('tamanoTextoLabel');
    if (label) label.textContent = nuevo + '%';
    // Sincronizar con el slider existente
    const slider = document.getElementById('textSizeSlider');
    if (slider) slider.value = nuevo;
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
    // Sincronizar con el botón existente
    const btnExistente = document.getElementById('btnToggleDarkMode');
    if (btnExistente) btnExistente.textContent = isDark ? '☀️ Modo Claro' : '🌙 Modo Oscuro';
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
        const slider = document.getElementById('textSizeSlider');
        if (slider) slider.value = document.body.style.fontSize.replace('%', '') || 100;
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

    // Tamaño de texto
    const savedSize = localStorage.getItem('textSize');
    if (savedSize) {
      document.body.style.fontSize = savedSize + '%';
      const label = document.getElementById('tamanoTextoLabel');
      if (label) label.textContent = savedSize + '%';
      const slider = document.getElementById('textSizeSlider');
      if (slider) slider.value = savedSize;
    }
  }

  // Ejecutar al cargar
  restaurarAccesibilidad();
  
});