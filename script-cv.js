document.addEventListener('DOMContentLoaded', () => {

  // 1. DICCIONARIOS Y CONFIGURACIÓN GLOBAL
  const traducciones = {
    es: { 
      exp: "Experiencia Laboral", form: "Formación Académica", comp: "Competencias", idio: "Idiomas", act: "Actividades Extracurriculares", fecha: "Fecha de nacimiento: " 
    },
    en: { 
      exp: "Work Experience", form: "Education", comp: "Skills", idio: "Languages", act: "Extracurricular Activities", fecha: "Date of birth: " 
    },
    fr: { 
      exp: "Expérience Professionnelle", form: "Formation", comp: "Compétences", idio: "Langues", act: "Activités Extracurriculaires", fecha: "Date de naissance: " 
    },
    de: { 
      exp: "Berufserfahrung", form: "Ausbildung", comp: "Kenntnisse", idio: "Sprachen", act: "Außerschulische Aktivitäten", fecha: "Geburtsdatum: " 
    }
  };

  const listaIdiomasBase = [
    "Español", "Inglés", "Alemán", "Ruso", "Francés", "Italiano", "Portugués", "Chino Mandarín"];

  const STORAGE_KEY = 'cv_builder_draft';

  // 2. SISTEMA DE NAVEGACIÓN Y PASOS
  let pasoActual = 1;
  const totalPasos = 7;

  const btnAnterior = document.getElementById('btnAnterior');
  const btnSiguiente = document.getElementById('btnSiguiente');
  const progressBar = document.getElementById('progressBar');
  const stepCounter = document.getElementById('stepCounter');
  const stepTitle = document.getElementById('stepTitle');

  const titulosPasos = [
    "1. Datos personales",
    "2. Experiencia",
    "3. Formación",
    "4. Competencias",
    "5. Idiomas",
    "6. Actividades extracurriculares",
    "7. Elige el diseño de tu CV"
  ];

  function cambiarPaso(nuevoPaso) {
    if (nuevoPaso < 1 || nuevoPaso > totalPasos) return;
    pasoActual = nuevoPaso;

    document.querySelectorAll('.step-content').forEach(el => {
      el.classList.remove('active');
    });
    
    const seccionTarget = document.getElementById(`step-${pasoActual}`);
    if (seccionTarget) {
      seccionTarget.classList.add('active');
    }

    document.querySelectorAll('.nav-item').forEach(btn => {
      const stepNum = parseInt(btn.getAttribute('data-step'), 10);
      btn.classList.toggle('active', stepNum === pasoActual);
    });

    if (progressBar) {
      progressBar.style.width = `${(pasoActual / totalPasos) * 100}%`;
    }
    if (stepCounter) {
      stepCounter.textContent = `Paso ${pasoActual} de ${totalPasos}`;
    }
    if (stepTitle) {
      stepTitle.textContent = titulosPasos[pasoActual - 1];
    }

    if (btnAnterior) {
      btnAnterior.style.display = (pasoActual === 1) ? 'none' : 'inline-block';
    }
    if (btnSiguiente) {
      btnSiguiente.style.display = (pasoActual === totalPasos) ? 'none' : 'inline-block';
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (btnSiguiente) {
    btnSiguiente.addEventListener('click', (e) => {
      e.preventDefault();
      cambiarPaso(pasoActual + 1);
      guardarProgreso();
    });
  }

  if (btnAnterior) {
    btnAnterior.addEventListener('click', (e) => {
      e.preventDefault();
      cambiarPaso(pasoActual - 1);
      guardarProgreso();
    });
  }

  document.querySelectorAll('.nav-item').forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const step = parseInt(button.getAttribute('data-step'), 10);
      if (step) {
        cambiarPaso(step);
        guardarProgreso();
      }
    });
  });

  // 3. ACTUALIZACIÓN EN VIVO (VISTA PREVIA)
  const idiomaCvSelect = document.getElementById('idiomaCv');
  const inputFechaNac = document.getElementById('fechaNacimiento');
  const pvFechaNac = document.getElementById('pvFechaNac');

  function actualizarFechaNacimiento() {
    if (!pvFechaNac) return;
    const lang = idiomaCvSelect ? idiomaCvSelect.value : 'es';
    const prefix = traducciones[lang]?.fecha || traducciones.es.fecha;
    
    if (inputFechaNac && inputFechaNac.value) {
      const partes = inputFechaNac.value.split('-');
      pvFechaNac.textContent = (partes.length === 3) 
        ? `${prefix}${partes[2]}/${partes[1]}/${partes[0]}` 
        : `${prefix}${inputFechaNac.value}`;
    } else {
      pvFechaNac.textContent = `${prefix}N/A`;
    }
  }

  if (inputFechaNac) {
    inputFechaNac.addEventListener('input', actualizarFechaNacimiento);
    inputFechaNac.addEventListener('change', actualizarFechaNacimiento);
  }

  function vincularInput(inputId, pvId, valorPorDefecto) {
    const inp = document.getElementById(inputId);
    const pv = document.getElementById(pvId);
    if (!inp || !pv) return;

    const actualizar = () => {
      pv.textContent = inp.value.trim() !== '' ? inp.value : valorPorDefecto;
    };

    inp.addEventListener('input', actualizar);
  }

  vincularInput('profesion', 'pvProfesion', 'Tu Profesión');
  vincularInput('correo', 'pvCorreo', 'correo@ejemplo.com');
  vincularInput('telefono', 'pvTelefono', '+00 0000 0000');
  const inputTelefono = document.getElementById('telefono');
if (inputTelefono) {
  inputTelefono.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^0-9+ ]/g, '');
  });
}
  vincularInput('localidad', 'pvUbicacion', 'Ciudad, País');
//  vincularInput('linkedin', 'pvLinkedin', 'linkedin.com/in/usuario');
//  vincularInput('github', 'pvGithub', 'github.com/usuario');
const inputLinkedin = document.getElementById('linkedin');
  const pvLinkedin = document.getElementById('pvLinkedin');
  if (inputLinkedin && pvLinkedin) {
    inputLinkedin.addEventListener('input', () => {
      const val = inputLinkedin.value.trim();
      pvLinkedin.textContent = val !== '' ? val : '';
      pvLinkedin.style.display = val !== '' ? 'inline' : 'none';
    });
  }

  const inputGithub = document.getElementById('github');
  const pvGithub = document.getElementById('pvGithub');
  if (inputGithub && pvGithub) {
    inputGithub.addEventListener('input', () => {
      const val = inputGithub.value.trim();
      pvGithub.textContent = val !== '' ? val : '';
      pvGithub.style.display = val !== '' ? 'inline' : 'none';
    });
  }
  vincularInput('formacionTexto', 'pvFormacion', 'Tu educación aparecerá aquí...');
  vincularInput('competenciasTexto', 'pvCompetencias', 'Tus habilidades destacadas...');

  // Perfil Profesional
  const inputPerfil = document.getElementById('perfilProfesional');
  const pvPerfil = document.getElementById('pvPerfil');
  const pvSecPerfil = document.getElementById('pvSectionPerfil');

  if (inputPerfil) {
    inputPerfil.addEventListener('input', () => {
      const val = inputPerfil.value.trim();
      if (pvSecPerfil) pvSecPerfil.style.display = val !== '' ? 'block' : 'none';
      if (pvPerfil) pvPerfil.textContent = val !== '' ? val : 'Tu resumen profesional aparecerá aquí...';
    });
  }

  // Experiencia Laboral Completa
  function actualizarExperienciaCompleta() {
    const pvExp = document.getElementById('pvExperiencia');
    if (!pvExp) return;

    const emp = document.getElementById('expEmpresa')?.value.trim() || '';
    const pto = document.getElementById('expPuesto')?.value.trim() || '';
    const fec = document.getElementById('expFechas')?.value.trim() || '';
    const txt = document.getElementById('experienciaTexto')?.value.trim() || '';

    let encabezado = [pto, emp, fec].filter(Boolean).join(' | ');
    if (encabezado && txt) {
      pvExp.textContent = `${encabezado}\n${txt}`;
    } else if (encabezado) {
      pvExp.textContent = encabezado;
    } else if (txt) {
      pvExp.textContent = txt;
    } else {
      pvExp.textContent = 'Tu experiencia aparecerá aquí...';
    }
  }

  ['expEmpresa', 'expPuesto', 'expFechas', 'experienciaTexto'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', actualizarExperienciaCompleta);
  });

  const inputNombre = document.getElementById('nombre');
  const inputApellidos = document.getElementById('apellidos');
  const pvNombre = document.getElementById('pvNombreCompleto');

  function actualizarNombreCompleto() {
    if (!pvNombre) return;
    const n = inputNombre?.value.trim() || '';
    const a = inputApellidos?.value.trim() || '';
    pvNombre.textContent = (n || a) ? `${n} ${a}` : 'Tu Nombre Aquí';
  }

  if (inputNombre) inputNombre.addEventListener('input', actualizarNombreCompleto);
  if (inputApellidos) inputApellidos.addEventListener('input', actualizarNombreCompleto);

  const inputAct = document.getElementById('actividadesTexto');
  const pvAct = document.getElementById('pvActividades');
  const pvSecAct = document.getElementById('pvSectionActividades');

  if (inputAct) {
    inputAct.addEventListener('input', () => {
      const val = inputAct.value.trim();
      if (pvSecAct) pvSecAct.style.display = val !== '' ? 'block' : 'none';
      if (pvAct) pvAct.textContent = val;
    });
  }

  if (idiomaCvSelect) {
    idiomaCvSelect.addEventListener('change', (e) => {
      const lang = e.target.value;
      const t = traducciones[lang] || traducciones.es;
      const lblExp = document.getElementById('lblExperiencia');
      const lblForm = document.getElementById('lblFormacion');
      const lblComp = document.getElementById('lblCompetencias');
      const lblIdio = document.getElementById('lblIdiomas');
      const lblAct = document.getElementById('lblActividades');

      if (lblExp) lblExp.textContent = t.exp;
      if (lblForm) lblForm.textContent = t.form;
      if (lblComp) lblComp.textContent = t.comp;
      if (lblIdio) lblIdio.textContent = t.idio;
      if (lblAct) lblAct.textContent = t.act;

      actualizarFechaNacimiento();
    });
  }

  // Personalización del color del tema
const inputColorTema = document.getElementById('inputColorTema');
if (inputColorTema) {
  inputColorTema.addEventListener('input', (e) => {
    const nuevoColor = e.target.value;
    
    // 1. Cambiar en el :root global
    document.documentElement.style.setProperty('--cv-theme-color', nuevoColor);
    
    // 2. Cambiar directamente en la hoja del CV
    const cvPaperEl = document.getElementById('cvPaper');
    if (cvPaperEl) {
      cvPaperEl.style.setProperty('--cv-theme-color', nuevoColor, 'important');
    }
  });
}


  // 4. GESTIÓN DE IDIOMAS DINÁMICOS
  const idiomasLista = document.getElementById('idiomasLista');
  const btnAgregarIdioma = document.getElementById('btnAgregarIdioma');
  const pvIdiomas = document.getElementById('pvIdiomas');

  function renderizarIdiomas() {
    if (!pvIdiomas) return;
    pvIdiomas.innerHTML = '';
    document.querySelectorAll('.idioma-row').forEach(row => {
      const nom = row.querySelector('.select-idioma-nombre')?.value;
      const niv = row.querySelector('.select-idioma-nivel')?.value;
      if (nom && niv) {
        const li = document.createElement('li');
        li.textContent = `${nom} - ${niv}`;
        pvIdiomas.appendChild(li);
      }
    });
  }

  function agregarFilaIdioma(nombrePredeterminado = null, nivelPredeterminado = null) {
    if (!idiomasLista) return;

    const fila = document.createElement('div');
    fila.className = 'idioma-row';

    let opciones = listaIdiomasBase.map(i => `<option value="${i}">${i}</option>`).join('');

    fila.innerHTML = `
      <select class="custom-select select-idioma-nombre">${opciones}</select>
      <select class="custom-select select-idioma-nivel">
        <option value="Principiante">Principiante</option>
        <option value="Intermedio">Intermedio</option>
        <option value="Avanzado">Avanzado</option>
        <option value="Nativo">Nativo</option>
      </select>
      <button type="button" class="btn-remove-idioma" style="background:none;border:none;color:var(--danger-color, #d9381e);cursor:pointer;font-size:1.2rem;">&times;</button>
    `;

    idiomasLista.appendChild(fila);

    const selectNom = fila.querySelector('.select-idioma-nombre');
    const selectNiv = fila.querySelector('.select-idioma-nivel');

    if (nombrePredeterminado) selectNom.value = nombrePredeterminado;
    if (nivelPredeterminado) selectNiv.value = nivelPredeterminado;

    fila.querySelectorAll('select').forEach(s => s.addEventListener('change', () => {
      renderizarIdiomas();
      guardarProgreso();
    }));

    fila.querySelector('.btn-remove-idioma')?.addEventListener('click', () => {
      if (document.querySelectorAll('.idioma-row').length > 1) {
        fila.remove();
        renderizarIdiomas();
        guardarProgreso();
      }
    });

    renderizarIdiomas();
  }

  if (btnAgregarIdioma) {
    btnAgregarIdioma.addEventListener('click', (e) => {
      e.preventDefault();
      agregarFilaIdioma();
      guardarProgreso();
    });
  }

  // 5. INTEGRACIÓN CON BACKEND IA
  document.querySelectorAll('.btn-ai, .btn-ia, [data-ai="true"]').forEach(button => {
    button.addEventListener('click', async (e) => {
      e.preventDefault();
      const targetId = button.getAttribute('data-target') || 'experienciaTexto';
      const seccion = button.getAttribute('data-seccion') || 'experiencia';
      const targetTextarea = document.getElementById(targetId);
      if (!targetTextarea) return;
      const textoOriginal = targetTextarea.value.trim();

      if (!textoOriginal) {
        alert("Escribe algo en la casilla antes de optimizar con IA.");
        return;
      }

      const confirmarIA = confirm(
        "💡 Nota importante sobre el asistente IA:\n\n" +
        "La optimización generada ajustará el texto para mantener un tamaño sintético e ideal para formato de CV impreso (1 página).\n\n" +
        "Te recomendamos revisar el resultado y hacer ajustes si es necesario.\n\n" +
        "¿Deseas continuar?"
      );

      if (!confirmarIA) return;

      const textoBotonOriginal = button.innerText;
      button.disabled = true;
      button.innerText = "✨ Optimizando...";

      const reglasFormato = {
        experiencia: "Resume en máximo 5 puntos (bullet points) altamente profesionales, concisos y usando verbos de acción.",
        formacion: "Resume en máximo 2 líneas claras y sintéticas (Título, Institución, Año/Estado).",
        competencias: "Presenta una lista breve de competencias clave divididas por comas o viñetas cortas (máximo 6 habilidades).",
        actividades: "Resume en máximo 2 puntos breves y concretos las actividades o logros principales."
      };

      const promptRestringido = `${reglasFormato[seccion] || 'Se conciso, sintético y breve.'}\n\nTexto original del usuario:\n${textoOriginal}`;

      try {
        const lang = document.getElementById('idiomaCv')?.value || 'es';
        const response = await fetch("http://127.0.0.1:8000/api/mejorar-cv", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            texto: promptRestringido,
            seccion: seccion,
            idioma: lang
          })
        });

        const data = await response.json();
        if (response.ok) {
        const textoLimpio = data.resultado.replace(/\*\*/g, '');
          targetTextarea.value = textoLimpio;
          targetTextarea.dispatchEvent(new Event('input', { bubbles: true }));
          targetTextarea.dispatchEvent(new Event('change', { bubbles: true }));
          guardarProgreso();
        } else {
          alert("Error de Servidor: " + (data.detail || "No se pudo optimizar el texto."));
        }
      } catch (err) {
        console.error("Error al conectar con la API:", err);
        alert("No se pudo conectar con el servidor local (http://127.0.0.1:8000). Asegúrate de que FastAPI esté activo.");
      } finally {
        button.disabled = false;
        button.innerText = textoBotonOriginal;
      }
    });
  });

  // 6. PLANTILLAS Y DESCARGA EN PDF
  const cvPaper = document.getElementById('cvPaper');
  
  document.querySelectorAll('input[name="disenoCv"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (cvPaper) {
        cvPaper.className = `cv-paper t-${e.target.value}`;
      }
      document.querySelectorAll('.template-card').forEach(c => c.classList.remove('active'));
      e.target.closest('.template-card')?.classList.add('active');
      guardarProgreso();
    });
  });

  const btnPDF = document.getElementById('btnDescargarPDF');
  if (btnPDF) {
    btnPDF.addEventListener('click', (e) => {
      e.preventDefault();
      if (!cvPaper) return;

      if (typeof html2pdf === 'undefined') {
        alert("La librería HTML2PDF aún no ha cargado. Intenta de nuevo en unos momentos.");
        return;
      }

      const clon = cvPaper.cloneNode(true);
      clon.style.transform = "none";
      clon.style.margin = "0 auto";
      clon.style.maxHeight = "285mm";
      clon.style.overflow = "hidden";

      const opciones = {
        margin: 0,
        filename: 'Curriculum_Vitae.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 1.6,
          useCORS: true,
          scrollY: 0
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: 'avoid-all' }
      };

      html2pdf().set(opciones).from(clon).save();
    });
  }
  
  // 7. RECONOCIMIENTO DE VOZ
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;

    let targetTextarea = null;
    let activeButton = null;

    function obtenerIdiomaReconocimiento() {
      const lang = document.getElementById('idiomaCv')?.value || 'es';
      const mapaIdiomas = {
        es: 'es-ES',
        en: 'en-US',
        fr: 'fr-FR',
        de: 'de-DE'
      };
      return mapaIdiomas[lang] || 'es-ES';
    }

    document.querySelectorAll('.btn-voice').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = button.getAttribute('data-target');
        const textarea = document.getElementById(targetId);

        if (!textarea) return;

        if (activeButton === button) {
          recognition.stop();
          return;
        }

        if (activeButton) {
          recognition.stop();
        }

        targetTextarea = textarea;
        activeButton = button;

        recognition.lang = obtenerIdiomaReconocimiento();
        recognition.start();

        button.classList.add('listening');
        button.textContent = '🛑 Detener';
      });
    });

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');

      if (targetTextarea) {
        const textoPrevio = targetTextarea.value.trim();
        targetTextarea.value = textoPrevio ? `${textoPrevio} ${transcript}` : transcript;

        targetTextarea.dispatchEvent(new Event('input', { bubbles: true }));
        targetTextarea.dispatchEvent(new Event('change', { bubbles: true }));
        guardarProgreso();
      }
    };

    recognition.onerror = (event) => {
      console.error('Error en reconocimiento de voz:', event.error);
      detenerReconocimiento();
    };

    recognition.onend = () => {
      detenerReconocimiento();
    };

    function detenerReconocimiento() {
      if (activeButton) {
        activeButton.classList.remove('listening');
        activeButton.textContent = '🎤 Hablar';
        activeButton = null;
        targetTextarea = null;
      }
    }

  } else {
    document.querySelectorAll('.btn-voice').forEach(button => {
      button.disabled = true;
      button.title = "Navegador sin soporte de voz.";
      button.style.opacity = "0.5";
      button.style.cursor = "not-allowed";
    });
  }

  // 8. PERSISTENCIA DE DATOS (LOCALSTORAGE)
  function guardarProgreso() {
    const arregloIdiomas = [];
    document.querySelectorAll('.idioma-row').forEach(row => {
      const nom = row.querySelector('.select-idioma-nombre')?.value;
      const niv = row.querySelector('.select-idioma-nivel')?.value;
      if (nom && niv) arregloIdiomas.push({ nombre: nom, nivel: niv });
    });

    const datos = {
      idiomaCv: document.getElementById('idiomaCv')?.value || 'es',
      nombre: document.getElementById('nombre')?.value || '',
      apellidos: document.getElementById('apellidos')?.value || '',
      profesion: document.getElementById('profesion')?.value || '',
      correo: document.getElementById('correo')?.value || '',
      telefono: document.getElementById('telefono')?.value || '',
      localidad: document.getElementById('localidad')?.value || '',
      fechaNacimiento: document.getElementById('fechaNacimiento')?.value || '',
      linkedin: document.getElementById('linkedin')?.value || '',
      github: document.getElementById('github')?.value || '',
      perfilProfesional: document.getElementById('perfilProfesional')?.value || '',
      expEmpresa: document.getElementById('expEmpresa')?.value || '',
      expPuesto: document.getElementById('expPuesto')?.value || '',
      expFechas: document.getElementById('expFechas')?.value || '',
      experienciaTexto: document.getElementById('experienciaTexto')?.value || '',
      formacionTexto: document.getElementById('formacionTexto')?.value || '',
      competenciasTexto: document.getElementById('competenciasTexto')?.value || '',
      actividadesTexto: document.getElementById('actividadesTexto')?.value || '',
      colorTema: document.getElementById('inputColorTema')?.value || '#0b3b60',
      idiomas: arregloIdiomas,
      pasoActual: pasoActual,
      disenoCv: document.querySelector('input[name="disenoCv"]:checked')?.value || 'clasico'
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(datos));
  }

  function cargarProgresoGuardado() {
    const guardado = localStorage.getItem(STORAGE_KEY);
    if (!guardado) {
      agregarFilaIdioma("Español", "Nativo");
      cambiarPaso(1);
      return;
    }

    try {
      const datos = JSON.parse(guardado);

      Object.keys(datos).forEach(key => {
        if (key === 'pasoActual' || key === 'disenoCv' || key === 'idiomas' || key === 'colorTema') return;
        const el = document.getElementById(key);
        if (el) {
          el.value = datos[key];
          el.dispatchEvent(new Event(el.tagName === 'SELECT' ? 'change' : 'input'));
        }
      });

      if (datos.colorTema) {
        const colorInput = document.getElementById('inputColorTema');
        if (colorInput) {
          colorInput.value = datos.colorTema;
          document.documentElement.style.setProperty('--cv-theme-color', datos.colorTema);
          const cvPaperEl = document.getElementById('cvPaper');
          if (cvPaperEl) cvPaperEl.style.setProperty('--cv-theme-color', datos.colorTema);
        }
      }

      if (datos.idiomas && Array.isArray(datos.idiomas) && datos.idiomas.length > 0) {
        if (idiomasLista) idiomasLista.innerHTML = '';
        datos.idiomas.forEach(i => agregarFilaIdioma(i.nombre, i.nivel));
      } else {
        agregarFilaIdioma("Español", "Nativo");
      }

      if (datos.disenoCv) {
        const radio = document.querySelector(`input[name="disenoCv"][value="${datos.disenoCv}"]`);
        if (radio) {
          radio.checked = true;
          radio.dispatchEvent(new Event('change'));
        }
      }

      if (datos.pasoActual) {
        cambiarPaso(datos.pasoActual);
      }
    } catch (e) {
      console.error("Error al restaurar los datos del borrador:", e);
      agregarFilaIdioma("Español", "Nativo");
    }
  }
  // 1. Función para obtener la clave única del usuario activo
function obtenerClaveCVUsuario() {
  if (!usuarioActivo) return null;
  const idUnico = usuarioActivo.curp || usuarioActivo.correo || usuarioActivo.id;
  return idUnico ? `progresoCV_${idUnico.toString().toLowerCase().trim()}` : null;
}

// 2. Cargar datos del borrador del CV asociados al usuario activo
function cargarProgresoGuardado() {
  const formCV = document.getElementById('cvForm');
  
  // 1. Limpiamos la lista previa de idiomas
  if (typeof idiomasLista !== 'undefined' && idiomasLista) {
    idiomasLista.innerHTML = '';
  }

  // 2. Limpiamos el formulario para que no arrastre datos de la sesión anterior
  if (formCV) {
    formCV.reset();
  }

  const claveCV = obtenerClaveCVUsuario();

  // Si no hay un usuario activo en sesión, colocamos valores por defecto
  if (!claveCV) {
    if (typeof agregarFilaIdioma === 'function') agregarFilaIdioma("Español", "Nativo");
    if (typeof cambiarPaso === 'function') cambiarPaso(1);
    return;
  }

  const guardado = localStorage.getItem(claveCV);

  // 3. Si el usuario NO tiene un borrador previo, autocompletamos con sus datos personales
  if (!guardado) {
    if (typeof agregarFilaIdioma === 'function') agregarFilaIdioma("Español", "Nativo");
    if (typeof cambiarPaso === 'function') cambiarPaso(1);

    if (usuarioActivo) {
      const nombreCompleto = `${usuarioActivo.nombre || ''} ${usuarioActivo.primer_apellido || ''} ${usuarioActivo.segundo_apellido || ''}`.trim();
      
      const campoNombre = document.getElementById('nombre') || (formCV ? formCV.elements['nombre'] : null);
      const campoCorreo = document.getElementById('correo') || (formCV ? formCV.elements['correo'] : null);
      const campoTel = document.getElementById('telefono') || (formCV ? formCV.elements['telefono'] : null);

      if (campoNombre) campoNombre.value = nombreCompleto || usuarioActivo.nombre || '';
      if (campoCorreo) campoCorreo.value = usuarioActivo.correo || '';
      if (campoTel) campoTel.value = usuarioActivo.celular || usuarioActivo.telefono_fijo || '';
    }
    return;
  }

  // 4. Restaurar los datos guardados del usuario activo
  try {
    const datos = JSON.parse(guardado);

    Object.keys(datos).forEach(key => {
      if (key === 'pasoActual' || key === 'disenoCv' || key === 'idiomas' || key === 'colorTema') return;
      
      // Busca primero por ID global y si no por 'name' dentro del formulario
      const el = document.getElementById(key) || (formCV ? formCV.elements[key] : null);
      if (el) {
        el.value = datos[key];
        // Disparar eventos habilitando la propagación (bubbles: true) para actualizar la vista previa
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    // Restaurar Color de Tema
    if (datos.colorTema) {
      const colorInput = document.getElementById('inputColorTema');
      if (colorInput) {
        colorInput.value = datos.colorTema;
        document.documentElement.style.setProperty('--cv-theme-color', datos.colorTema);
        const cvPaperEl = document.getElementById('cvPaper');
        if (cvPaperEl) cvPaperEl.style.setProperty('--cv-theme-color', datos.colorTema);
      }
    }

    // Restaurar Idiomas
    if (datos.idiomas && Array.isArray(datos.idiomas) && datos.idiomas.length > 0) {
      datos.idiomas.forEach(i => {
        if (typeof agregarFilaIdioma === 'function') agregarFilaIdioma(i.nombre, i.nivel);
      });
    } else {
      if (typeof agregarFilaIdioma === 'function') agregarFilaIdioma("Español", "Nativo");
    }

    // Restaurar Diseño de plantilla
    if (datos.disenoCv) {
      const radio = document.querySelector(`input[name="disenoCv"][value="${datos.disenoCv}"]`);
      if (radio) {
        radio.checked = true;
        radio.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }

    // Restaurar el Paso del asistente
    if (datos.pasoActual && typeof cambiarPaso === 'function') {
      cambiarPaso(datos.pasoActual);
    }
  } catch (e) {
    console.error("Error al restaurar los datos del borrador:", e);
    if (typeof agregarFilaIdioma === 'function') agregarFilaIdioma("Español", "Nativo");
  }
}

// 3. Guardar el borrador en la clave del usuario activo
// ==========================================================================
  // 8. PERSISTENCIA DE DATOS Y GESTIÓN DE SESIÓN
  // ==========================================================================

  // A. Obtener el usuario activo garantizando persistencia al hacer F5
  function obtenerUsuarioSesion() {
    if (typeof usuarioActivo !== 'undefined' && usuarioActivo) {
      return usuarioActivo;
    }
    const usuarioGuardado = localStorage.getItem('usuarioActivo') || sessionStorage.getItem('usuarioActivo');
    if (usuarioGuardado) {
      try {
        window.usuarioActivo = JSON.parse(usuarioGuardado);
        return window.usuarioActivo;
      } catch (e) {
        console.error("Error al parsear usuario de sesión:", e);
      }
    }
    return null;
  }

  // B. Generar la clave única para guardar los datos en LocalStorage
  function obtenerClaveCVUsuario() {
    const user = obtenerUsuarioSesion();
    if (!user) return 'cv_builder_draft'; // Clave genérica por defecto si no hay login
    const idUnico = user.curp || user.correo || user.id;
    return idUnico ? `progresoCV_${idUnico.toString().toLowerCase().trim()}` : 'cv_builder_draft';
  }

  // C. Guardar el progreso del usuario
  function guardarProgreso() {
    const claveCV = obtenerClaveCVUsuario();
    const formCV = document.getElementById('cvForm');

    const datosCV = {};

    // Si existe el formulario, guardamos todos sus controles
    if (formCV) {
      const elementosForm = formCV.querySelectorAll('input, textarea, select');
      elementosForm.forEach(el => {
        if (el.type === 'radio' || el.type === 'checkbox') {
          if (el.checked) {
            if (el.id) datosCV[el.id] = el.value;
            if (el.name) datosCV[el.name] = el.value;
          }
        } else {
          if (el.id) datosCV[el.id] = el.value;
          if (el.name) datosCV[el.name] = el.value;
        }
      });
    }

    // Capturar diseño de la plantilla
    const radioDiseno = document.querySelector('input[name="disenoCv"]:checked');
    if (radioDiseno) datosCV.disenoCv = radioDiseno.value;

    // Capturar color del tema
    const colorInput = document.getElementById('inputColorTema');
    if (colorInput) datosCV.colorTema = colorInput.value;

    // Capturar paso actual del asistente
    datosCV.pasoActual = typeof pasoActual !== 'undefined' ? pasoActual : 1;

    // Capturar idiomas agregados dinámicamente
    const arregloIdiomas = [];
    document.querySelectorAll('.idioma-row').forEach(row => {
      const nom = row.querySelector('.select-idioma-nombre')?.value;
      const niv = row.querySelector('.select-idioma-nivel')?.value;
      if (nom && niv) arregloIdiomas.push({ nombre: nom, nivel: niv });
    });
    if (arregloIdiomas.length > 0) datosCV.idiomas = arregloIdiomas;

    localStorage.setItem(claveCV, JSON.stringify(datosCV));
  }

  // D. Cargar datos del borrador guardados
  function cargarProgresoGuardado() {
    const formCV = document.getElementById('cvForm');

    if (typeof idiomasLista !== 'undefined' && idiomasLista) {
      idiomasLista.innerHTML = '';
    }

    if (formCV) {
      formCV.reset();
    }

    const claveCV = obtenerClaveCVUsuario();
    const guardado = localStorage.getItem(claveCV);

    // Si NO hay borrador guardado, autocompletamos con datos del perfil del usuario
    if (!guardado) {
      if (typeof agregarFilaIdioma === 'function') agregarFilaIdioma("Español", "Nativo");
      if (typeof cambiarPaso === 'function') cambiarPaso(1);

      const user = obtenerUsuarioSesion();
      if (user) {
        const nombreCompleto = `${user.nombre || ''} ${user.primer_apellido || ''} ${user.segundo_apellido || ''}`.trim();
        const campoNombre = document.getElementById('nombre') || (formCV ? formCV.elements['nombre'] : null);
        const campoCorreo = document.getElementById('correo') || (formCV ? formCV.elements['correo'] : null);
        const campoTel = document.getElementById('telefono') || (formCV ? formCV.elements['telefono'] : null);

        if (campoNombre) {
          campoNombre.value = nombreCompleto || user.nombre || '';
          campoNombre.dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (campoCorreo) {
          campoCorreo.value = user.correo || '';
          campoCorreo.dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (campoTel) {
          campoTel.value = user.celular || user.telefono_fijo || '';
          campoTel.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
      return;
    }

    // Si SÍ existe borrador previo, lo restauramos
    try {
      const datos = JSON.parse(guardado);

      Object.keys(datos).forEach(key => {
        if (key === 'pasoActual' || key === 'disenoCv' || key === 'idiomas' || key === 'colorTema') return;

        const el = document.getElementById(key) || (formCV ? formCV.elements[key] : null);
        if (el) {
          el.value = datos[key];
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });

      // Restaurar tema de color
      if (datos.colorTema) {
        const colorInput = document.getElementById('inputColorTema');
        if (colorInput) {
          colorInput.value = datos.colorTema;
          document.documentElement.style.setProperty('--cv-theme-color', datos.colorTema);
          const cvPaperEl = document.getElementById('cvPaper');
          if (cvPaperEl) cvPaperEl.style.setProperty('--cv-theme-color', datos.colorTema);
        }
      }

      // Restaurar lista de idiomas
      if (datos.idiomas && Array.isArray(datos.idiomas) && datos.idiomas.length > 0) {
        datos.idiomas.forEach(i => {
          if (typeof agregarFilaIdioma === 'function') agregarFilaIdioma(i.nombre, i.nivel);
        });
      } else {
        if (typeof agregarFilaIdioma === 'function') agregarFilaIdioma("Español", "Nativo");
      }

      // Restaurar diseño de plantilla
      if (datos.disenoCv) {
        const radio = document.querySelector(`input[name="disenoCv"][value="${datos.disenoCv}"]`);
        if (radio) {
          radio.checked = true;
          radio.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }

      // Restaurar el paso actual
      if (datos.pasoActual && typeof cambiarPaso === 'function') {
        cambiarPaso(datos.pasoActual);
      }
    } catch (e) {
      console.error("Error al restaurar los datos del borrador:", e);
      if (typeof agregarFilaIdioma === 'function') agregarFilaIdioma("Español", "Nativo");
    }
  }

  // ==========================================================================
  // 9. ESCUCHADORES DE EVENTOS E INICIALIZACIÓN
  // ==========================================================================
  const formCV = document.getElementById('cvForm');
  if (formCV) {
    formCV.addEventListener('input', guardarProgreso);
    formCV.addEventListener('change', guardarProgreso);
  }

  window.addEventListener('beforeunload', () => {
    guardarProgreso();
  });

  // CARGAR LOS DATOS AUTOMÁTICAMENTE AL CARGAR EL DOM
  cargarProgresoGuardado();

});