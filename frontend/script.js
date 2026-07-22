/* ==========================================
   SCRIPT.JS - Escuela de Música
   Lógica principal de la aplicación
   ========================================== */

const API_URL = "http://127.0.0.1:8000/api/cursos";
let cursosCache = [];

/* ==========================================
   SECCIÓN 1: CARGA DE CURSOS DESDE API
   ========================================== */

/**
 * Carga los cursos desde la API con manejo de estados
 */
async function cargarCursos() {
    const loading = document.getElementById("api-loading");
    const errorBox = document.getElementById("api-error");
    const container = document.getElementById("cursos-container");
    const selectCurso = document.getElementById("alumno-curso");

    // Estado: ⏳ Carga
    mostrarElemento(loading);
    ocultarElemento(errorBox);
    container.innerHTML = "";

    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        cursosCache = data.cursos;

        // Estado: ✅ Éxito - Renderizar Cursos
        renderizarCursos(data.cursos);
        poblarSelectCursos(data.cursos);

    } catch (err) {
        // Estado: ❌ Error
        console.error("Error consultando API:", err);
        document.getElementById("api-error-msg").innerText = 
            "No se pudo establecer conexión con " + API_URL;
        mostrarElemento(errorBox);
        selectCurso.innerHTML = `<option value="">⚠️ Error cargando cursos</option>`;
    } finally {
        ocultarElemento(loading);
    }
}

/**
 * Renderiza las tarjetas de cursos en el grid
 */
function renderizarCursos(cursos) {
    const container = document.getElementById("cursos-container");
    container.innerHTML = cursos.map((curso, index) => `
        <div class="curso-card" style="animation-delay: ${index * 0.05}s">
            <div class="curso-image-wrapper">
                <img src="${curso.imagen}" alt="${curso.nombre}" class="curso-image">
                <span class="curso-badge ${curso.disponible ? 'disponible' : 'agotado'}">
                    ${curso.disponible ? 'Disponible' : 'Agotado'}
                </span>
            </div>
            <div class="curso-content">
                <div class="curso-header">
                    <h3 class="curso-nombre">${curso.nombre}</h3>
                    <span class="curso-categoria">${curso.categoria}</span>
                </div>
                <p class="curso-descripcion">${curso.descripcion}</p>
            </div>
            <div class="curso-footer">
                <span class="curso-precio">$${curso.precio.toLocaleString('es-CL')}</span>
                <button onclick="seleccionarCursoParaMatricula('${curso.nombre}')" 
                    ${!curso.disponible ? 'disabled' : ''} 
                    class="btn-matricular">
                    Matricular
                </button>
            </div>
        </div>
    `).join("");
}

/**
 * Llena el select de cursos con las opciones disponibles
 */
function poblarSelectCursos(cursos) {
    const selectCurso = document.getElementById("alumno-curso");
    selectCurso.innerHTML = `<option value="">-- Selecciona un Curso --</option>` + 
        cursos.map(c => `
            <option value="${c.nombre}" ${!c.disponible ? 'disabled' : ''}>
                ${c.nombre} ($${c.precio.toLocaleString('es-CL')}) 
                ${!c.disponible ? '- Agotado' : ''}
            </option>
        `).join("");
}

/**
 * Selecciona un curso y enfoca el formulario
 */
function seleccionarCursoParaMatricula(nombreCurso) {
    document.getElementById("alumno-curso").value = nombreCurso;
    document.getElementById("form-matricula").scrollIntoView({ behavior: 'smooth' });
}

/* ==========================================
   SECCIÓN 2: CRUD DE MATRÍCULAS (LOCALSTORAGE)
   ========================================== */

/**
 * Obtiene todas las matrículas del LocalStorage
 */
function obtenerMatriculasLS() {
    return JSON.parse(localStorage.getItem("matriculas_musica") || "[]");
}

/**
 * Guarda las matrículas en el LocalStorage
 */
function guardarMatriculaLS(matriculas) {
    localStorage.setItem("matriculas_musica", JSON.stringify(matriculas));
}

/**
 * Renderiza la tabla de matrículas
 */
function renderizarTablaMatriculas() {
    const matriculas = obtenerMatriculasLS();
    const tbody = document.getElementById("tabla-matriculas");
    const emptyState = document.getElementById("empty-state");
    const badgeTotal = document.getElementById("total-matriculas");

    // Actualizar contador
    badgeTotal.innerText = `${matriculas.length} Alumno${matriculas.length !== 1 ? 's' : ''}`;

    if (matriculas.length === 0) {
        tbody.innerHTML = "";
        mostrarElemento(emptyState);
        return;
    }

    ocultarElemento(emptyState);
    tbody.innerHTML = matriculas.map(m => `
        <tr>
            <td>
                <div class="alumno-cell">
                    <span class="alumno-nombre">${m.nombre}</span>
                    <span class="alumno-email">${m.email}</span>
                </div>
            </td>
            <td>
                <span class="curso-badge-table">
                    ${m.curso}
                </span>
            </td>
            <td>${m.horario}</td>
            <td class="acciones-cell">
                <button onclick="prepararEditarMatricula(${m.id})" 
                    class="btn-action" title="Editar">
                    <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button onclick="eliminarMatricula(${m.id})" 
                    class="btn-action delete" title="Eliminar">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join("");
}

/**
 * Guarda o actualiza una matrícula
 */
function guardarMatricula(event) {
    event.preventDefault();
    
    const id = document.getElementById("matricula-id").value;
    const nombre = document.getElementById("alumno-nombre").value;
    const email = document.getElementById("alumno-email").value;
    const curso = document.getElementById("alumno-curso").value;
    const horario = document.getElementById("alumno-horario").value;

    // Validar que se seleccionó un curso
    if (!curso) {
        alert("Por favor, selecciona un curso");
        return;
    }

    let matriculas = obtenerMatriculasLS();

    if (id) {
        // EDITAR: Actualizar matrícula existente
        matriculas = matriculas.map(m => 
            m.id == id ? { id: Number(id), nombre, email, curso, horario } : m
        );
    } else {
        // CREAR: Nueva matrícula
        const nuevaMatricula = { 
            id: Date.now(), 
            nombre, 
            email, 
            curso, 
            horario 
        };
        matriculas.push(nuevaMatricula);
    }

    guardarMatriculaLS(matriculas);
    renderizarTablaMatriculas();
    cancelarEdicion();
    mostrarMensaje("Matrícula guardada exitosamente");
}

/**
 * Prepara una matrícula para edición
 */
function prepararEditarMatricula(id) {
    const matriculas = obtenerMatriculasLS();
    const item = matriculas.find(m => m.id === id);
    
    if (!item) return;

    // Llenar formulario con los datos existentes
    document.getElementById("matricula-id").value = item.id;
    document.getElementById("alumno-nombre").value = item.nombre;
    document.getElementById("alumno-email").value = item.email;
    document.getElementById("alumno-curso").value = item.curso;
    document.getElementById("alumno-horario").value = item.horario;

    // Cambiar interfaz a modo edición
    const formTitle = document.getElementById("form-title");
    formTitle.innerHTML = `<i class="fa-solid fa-user-pen"></i> Editar Matrícula`;
    
    const btnSubmit = document.getElementById("btn-submit");
    btnSubmit.innerText = "Actualizar Matrícula";
    btnSubmit.classList.add("edit");
    
    ocultarElemento(document.getElementById("btn-cancel"));
    mostrarElemento(document.getElementById("btn-cancel"));
    
    document.getElementById("form-matricula").scrollIntoView({ behavior: 'smooth' });
}

/**
 * Cancela la edición y reinicia el formulario
 */
function cancelarEdicion() {
    document.getElementById("form-matricula").reset();
    document.getElementById("matricula-id").value = "";
    
    const formTitle = document.getElementById("form-title");
    formTitle.innerHTML = `<i class="fa-solid fa-user-plus"></i> Registrar Nueva Matrícula`;
    
    const btnSubmit = document.getElementById("btn-submit");
    btnSubmit.innerText = "Guardar Matrícula";
    btnSubmit.classList.remove("edit");
    
    const btnCancel = document.getElementById("btn-cancel");
    btnCancel.classList.remove("active");
    ocultarElemento(btnCancel);
}

/**
 * Elimina una matrícula con confirmación
 */
function eliminarMatricula(id) {
    if (confirm("¿Estás seguro de que deseas eliminar esta matrícula?")) {
        let matriculas = obtenerMatriculasLS();
        matriculas = matriculas.filter(m => m.id !== id);
        guardarMatriculaLS(matriculas);
        renderizarTablaMatriculas();
        mostrarMensaje("Matrícula eliminada exitosamente");
    }
}

/* ==========================================
   FUNCIONES AUXILIARES
   ========================================== */

/**
 * Muestra un elemento
 */
function mostrarElemento(elemento) {
    elemento.classList.add("active");
}

/**
 * Oculta un elemento
 */
function ocultarElemento(elemento) {
    elemento.classList.remove("active");
}

/**
 * Muestra un mensaje temporal
 */
function mostrarMensaje(texto) {
    console.log("✓ " + texto);
    // Aquí podrías agregar un toast/notificación visual
}

/* ==========================================
   INICIALIZACIÓN AL CARGAR LA PÁGINA
   ========================================== */

window.addEventListener("DOMContentLoaded", () => {
    cargarCursos();
    renderizarTablaMatriculas();
});
