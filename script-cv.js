document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. DICCIONARIOS Y CONFIGURACIÓN GLOBAL
  // ==========================================
  const traducciones = {
    es: { 
      exp: "Experiencia Laboral", 
      form: "Formación Académica", 
      comp: "Competencias", 
      idio: "Idiomas", 
      act: "Actividades Extracurriculares", 
      fecha: "Fecha de nacimiento: " 
    },
    en: { 
      exp: "Work Experience", 
      form: "Education", 
      comp: "Skills", 
      idio: "Languages", 
      act: "Extracurricular Activities", 
      fecha: "Date of birth: " 
    },
    fr: { 
      exp: "Expérience Professionnelle", 
      form: "Formation", 
      comp: "Compétences", 
      idio: "Langues", 
      act: "Activités Extracurriculaires", 
      fecha: "Date de naissance: " 
    },
    de: { 
      exp: "Berufserfahrung", 
      form: "Ausbildung", 
      comp: "Kenntnisse", 
      idio: "Sprachen", 
      act: "Außerschulische Aktivitäten", 
      fecha: "Geburtsdatum: " 
    }
  };

  const listaIdiomasBase = [
    "Español", "Inglés", "Alemán", "Ruso", 
    "Francés", "Italiano", "Portugués", "Chino Mandarín"
  ];

  const STORAGE_KEY = 'cv_builder_draft';

  // ==========================================
  // 2. SISTEMA DE NAVEGACIÓN Y PASOS
  // ==========================================
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

    // Activar sección actual
    document.querySelectorAll('.step-content').forEach(el => {
      el.classList.remove('active');
    });
    
    const seccionTarget = document.getElementById(`step-${pasoActual}`);
    if (seccionTarget) {
      seccionTarget.classList.add('active');
    }

    // Activar botón en Sidebar
    document.querySelectorAll('.nav-item').forEach(btn => {
      const stepNum = parseInt(btn.getAttribute('data-step'), 10);
      btn.classList.toggle('active', stepNum === pasoActual);
    });

    // Actualizar barra de progreso e indicadores
    if (progressBar) {
      progressBar.style.width = `${(pasoActual / totalPasos) * 100}%`;
    }
    if (stepCounter) {
      stepCounter.textContent = `Paso ${pasoActual} de ${totalPasos}`;
    }
    if (stepTitle) {
      stepTitle.textContent = titulosPasos[pasoActual - 1];
    }

    // Visibilidad de botones de navegación inferior
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

  // ==========================================
  // 3. ACTUALIZACIÓN EN VIVO (VISTA PREVIA)
  // ==========================================
  const idiomaCvSelect = document.getElementById('idiomaCv');
  const inputFechaNac = document.getElementById('fechaNacimiento');
  const pvFechaNac = document.getElementById('pvFechaNac');

  function actualizarFechaNacimiento() {
    if (!pvFechaNac) return;
    const lang = idiomaCvSelect ? idiomaCvSelect.value : 'es';
    const prefix = traducciones[lang]?.fecha || traducciones.es.fecha;
    pvFechaNac.textContent = (inputFechaNac && inputFechaNac.value) 
      ? `${prefix}${inputFechaNac.value}` 
      : `${prefix}N/A`;
  }

  if (inputFechaNac) {
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
  vincularInput('localidad', 'pvUbicacion', 'Ciudad, País');
  vincularInput('experienciaTexto', 'pvExperiencia', 'Tu experiencia aparecerá aquí...');
  vincularInput('formacionTexto', 'pvFormacion', 'Tu educación aparecerá aquí...');
  vincularInput('competenciasTexto', 'pvCompetencias', 'Tus habilidades destacadas...');

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

  const fotoInput = document.getElementById('fotoInput');
  if (fotoInput) {
    fotoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          const imgHTML = `<img src="${evt.target.result}" alt="Foto CV" style="width:100%; height:100%; object-fit:cover;">`;
          const prev = document.getElementById('photoPreview');
          const pvCont = document.getElementById('pvPhotoContainer');
          if (prev) prev.innerHTML = imgHTML;
          if (pvCont) pvCont.innerHTML = imgHTML;
        };
        reader.readAsDataURL(file);
      }
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

  // ==========================================
  // 4. GESTIÓN DE IDIOMAS DINÁMICOS
  // ==========================================
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
      <button type="button" class="btn-remove-idioma" style="background:none;border:none;color:var(--danger-color);cursor:pointer;font-size:1.2rem;">&times;</button>
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

  // ==========================================
  // 5. INTEGRACIÓN CON BACKEND IA (FASTAPI / GROQ)
  // ==========================================
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

      const textoBotonOriginal = button.innerText;
      button.disabled = true;
      button.innerText = "✨ Optimizando...";

      try {
        const lang = document.getElementById('idiomaCv')?.value || 'es';
        const response = await fetch("http://127.0.0.1:8000/api/mejorar-cv", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            texto: textoOriginal,
            seccion: seccion,
            idioma: lang
          })
        });

        const data = await response.json();

        if (response.ok) {
          targetTextarea.value = data.resultado;
          // Actualizar vista previa y guardar
          targetTextarea.dispatchEvent(new Event('input'));
          targetTextarea.dispatchEvent(new Event('change'));
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

  // ==========================================
  // 6. PLANTILLAS Y DESCARGA EN PDF
  // ==========================================
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
      clon.style.margin = "0";
      clon.style.width = "210mm";
      document.body.appendChild(clon);

      html2pdf().set({
        margin: 0,
        filename: 'Curriculum_Vitae.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }).from(clon).save().then(() => document.body.removeChild(clon));
    });
  }

  // ==========================================
  // 7. RECONOCIMIENTO DE VOZ (SPEECH RECOGNITION)
  // ==========================================
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

        targetTextarea.dispatchEvent(new Event('input'));
        targetTextarea.dispatchEvent(new Event('change'));
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

  // ==========================================
  // 8. PERSISTENCIA DE DATOS (LOCALSTORAGE)
  // ==========================================
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
      experienciaTexto: document.getElementById('experienciaTexto')?.value || '',
      formacionTexto: document.getElementById('formacionTexto')?.value || '',
      competenciasTexto: document.getElementById('competenciasTexto')?.value || '',
      actividadesTexto: document.getElementById('actividadesTexto')?.value || '',
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
        if (key === 'pasoActual' || key === 'disenoCv' || key === 'idiomas') return;
        const el = document.getElementById(key);
        if (el) {
          el.value = datos[key];
          el.dispatchEvent(new Event(el.tagName === 'SELECT' ? 'change' : 'input'));
        }
      });

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

  const formCV = document.getElementById('cvForm');
  if (formCV) {
    formCV.addEventListener('input', guardarProgreso);
    formCV.addEventListener('change', guardarProgreso);
  }

  // Inicialización de la app
  cargarProgresoGuardado();
});