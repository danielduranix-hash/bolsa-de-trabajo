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
    vistaInicio.style.display = 'block';
    vistaGeoPortal.style.display = 'none';
    window.scrollTo(0, 0);
  }

  function mostrarGeoPortal() {
    vistaInicio.style.display = 'none';
    vistaGeoPortal.style.display = 'block';

    if (!mapa) {
      inicializarMapa();
    } else {
      setTimeout(() => mapa.invalidateSize(), 200);
    }
  }

  btnEmpleos.addEventListener('click', mostrarGeoPortal);
  btnIrGeoPortal.addEventListener('click', (e) => { e.preventDefault(); mostrarGeoPortal(); });
  btnVolverInicio.addEventListener('click', (e) => { e.preventDefault(); mostrarInicio(); });

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

  btnToggleFiltros.addEventListener('click', () => {
    filtroBox.classList.toggle('colapsado');
  });

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

  btnToggleDarkMode.addEventListener('click', () => {
    document.body.classList.toggle('modo-oscuro');
    document.body.classList.toggle('dark-mode');

    const isDark = document.body.classList.contains('modo-oscuro');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });

  function updateTextSize(val) {
    textSizeSlider.value = val;
    textSizeLabel.textContent = `${val}%`;
    document.body.style.fontSize = `${val}%`;
    localStorage.setItem('textSize', val);
  }

  textSizeSlider.addEventListener('input', (e) => updateTextSize(e.target.value));
  btnTextSmaller.addEventListener('click', () => {
    let current = parseInt(textSizeSlider.value, 10);
    if (current > 80) updateTextSize(current - 5);
  });
  btnTextLarger.addEventListener('click', () => {
    let current = parseInt(textSizeSlider.value, 10);
    if (current < 130) updateTextSize(current + 5);
  });

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
      
      // Cierra todos los demás paneles
      sectorCards.forEach(c => c.classList.remove('activo'));

      // Alterna únicamente el seleccionado
      if (!estaActivo) {
        card.classList.add('activo');
      }
    });
  });

  // Cerrar desplegable si el usuario hace clic fuera de las tarjetas
  document.addEventListener('click', () => {
    sectorCards.forEach(c => c.classList.remove('activo'));
  });

  /* ==========================================
     5. Asistente Virtual y Tour Interactivo
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
    assistantBox.style.display = 'block';
    tutorialOverlay.style.display = 'block';
    mostrarPaso();
  }

  function finalizarTutorial() {
    assistantBox.style.display = 'none';
    tutorialOverlay.style.display = 'none';
    quitarResaltados();
    window.speechSynthesis.cancel();
  }

  function quitarResaltados() {
    document.querySelectorAll('.highlight-step').forEach(el => el.classList.remove('highlight-step'));
  }

  function mostrarPaso() {
    quitarResaltados();
    window.speechSynthesis.cancel();

    const esGeoPortal = vistaGeoPortal.style.display !== 'none';
    const pasarela = esGeoPortal ? tutorialesPorSeccion.geoportal : tutorialesPorSeccion.inicio;

    if (pasoActual >= pasarela.length) {
      finalizarTutorial();
      return;
    }

    const paso = pasarela[pasoActual];
    assistantText.textContent = paso.text;

    const elTarget = document.getElementById(paso.elementId);
    if (elTarget) {
      elTarget.classList.add('highlight-step');
      elTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  btnHelp.addEventListener('click', iniciarTutorial);
  btnNextStep.addEventListener('click', () => {
    pasoActual++;
    mostrarPaso();
  });
  btnSkipTutorial.addEventListener('click', finalizarTutorial);

  btnVoiceRead.addEventListener('click', () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const locucion = new SpeechSynthesisUtterance(assistantText.textContent);
      locucion.lang = 'es-ES';
      window.speechSynthesis.speak(locucion);
    }
  });

});