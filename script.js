const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".panel");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => {
      t.classList.remove("active");
      t.setAttribute("aria-selected", "false");
    });
    panels.forEach((p) => {
      p.classList.remove("active");
      p.hidden = true;
    });
    tab.classList.add("active");
    tab.setAttribute("aria-selected", "true");
    const panel = document.getElementById(tab.dataset.target);
    panel.classList.add("active");
    panel.hidden = false;
  });
});
const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
]

const daySel = document.getElementById("age-day");
const monthSel = document.getElementById("age-month");
const yearSel = document.getElementById("age-year");
const ageResult = document.getElementById("age-result");

function crearOpcion(valor, texto) {
  const opt = document.createElement("option");
  opt.value = valor;
  opt.textContent = texto;
  return opt;
}

function diasEnMes(mes, anio) {
  if (!mes) return 31;
  const y = anio || 2000; 
  return new Date(y, mes, 0).getDate();
}

function llenarDias() {
  const seleccionado = daySel.value;
  const total = diasEnMes(Number(monthSel.value), Number(yearSel.value));
  daySel.innerHTML = "";
  daySel.appendChild(crearOpcion("", "Día"));
  for (let d = 1; d <= total; d++) {
    daySel.appendChild(crearOpcion(String(d), String(d)));
  }
  if (seleccionado && Number(seleccionado) <= total) {
    daySel.value = seleccionado;
  }
}

function iniciarSelectorFecha() {
  monthSel.appendChild(crearOpcion("", "Mes"));
  MESES.forEach((nombre, i) => monthSel.appendChild(crearOpcion(String(i + 1), nombre)));

  yearSel.appendChild(crearOpcion("", "Año"));
  const anioActual = new Date().getFullYear();
  for (let y = anioActual; y >= anioActual - 120; y--) {
    yearSel.appendChild(crearOpcion(String(y), String(y)));
  }

  llenarDias();
  monthSel.addEventListener("change", llenarDias);
  yearSel.addEventListener("change", llenarDias);
}

function mostrarResultado(el, html, tipo) {
  el.className = "result " + tipo;
  el.innerHTML = html;
}

function plural(n, singular, pluralTxt) {
  return n === 1 ? singular : pluralTxt;
}

function calcularEdad(dia, mes, anio, hoy) {
  let anios = hoy.getFullYear() - anio;
  let meses = hoy.getMonth() + 1 - mes;
  if (hoy.getDate() < dia) meses--;
  if (meses < 0) {
    anios--;
    meses += 12;
  }
  return { anios, meses };
}

document.getElementById("age-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const dia = Number(daySel.value);
  const mes = Number(monthSel.value);
  const anio = Number(yearSel.value);
  if (!dia || !mes || !anio) {
    mostrarResultado(ageResult, "Selecciona día, mes y año.", "error");
    return;
  }

  const fecha = new Date(anio, mes - 1, dia);
  if (
    fecha.getFullYear() !== anio ||
    fecha.getMonth() !== mes - 1 ||
    fecha.getDate() !== dia
  ) {
    mostrarResultado(ageResult, "La fecha ingresada no es válida.", "error");
    return;
  }

  const hoy = new Date();
  if (fecha > hoy) {
    mostrarResultado(ageResult, "La fecha de nacimiento no puede ser futura.", "error");
    return;
  }

  const { anios, meses } = calcularEdad(dia, mes, anio, hoy);
  mostrarResultado(
    ageResult,
    `Tienes <strong>${anios} ${plural(anios, "año", "años")} ${meses} ${plural(meses, "mes", "meses")}</strong>`,
    "ok"
  );
});

iniciarSelectorFecha();

const tempValue = document.getElementById("temp-value");
const tempFrom = document.getElementById("temp-from");
const tempTo = document.getElementById("temp-to");
const tempBtn = document.getElementById("temp-btn");
const tempResult = document.getElementById("temp-result");

const NOMBRES = { C: "Celsius", F: "Fahrenheit", K: "Kelvin" };

function actualizarBoton() {
  const valorOk = tempValue.value.trim() !== "" && !isNaN(Number(tempValue.value));
  tempBtn.disabled = !(valorOk && tempFrom.value && tempTo.value);
}

[tempValue, tempFrom, tempTo].forEach((el) => {
  el.addEventListener("input", actualizarBoton);
  el.addEventListener("change", actualizarBoton);
});

function aCelsius(valor, unidad) {
  if (unidad === "F") return (valor - 32) * 5 / 9;
  if (unidad === "K") return valor - 273.15;
  return valor;
}

function desdeCelsius(c, unidad) {
  if (unidad === "F") return c * 9 / 5 + 32;
  if (unidad === "K") return c + 273.15;
  return c;
}

document.getElementById("temp-form").addEventListener("submit", (e) => {
  e.preventDefault();
  if (tempBtn.disabled) return;

  const valor = Number(tempValue.value);
  const celsius = aCelsius(valor, tempFrom.value);

  if (celsius < -273.15) {
    mostrarResultado(tempResult, "esa temperatura esta por debajo del cero absoluto.", "error");
    return;
  }

  const resultado = desdeCelsius(celsius, tempTo.value);
  const redondeado = Math.round(resultado * 100) / 100;
  mostrarResultado(
    tempResult,
    `${valor} ${NOMBRES[tempFrom.value]} es ${redondeado} ${NOMBRES[tempTo.value]}`,
    "ok"
  );
});

const tasks = []; 
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");

function renderTasks() {
  taskList.innerHTML = ""; 

  if (tasks.length === 0) {
    const vacio = document.createElement("li");
    vacio.className = "empty";
    vacio.textContent = "No hay tareas todavía.";
    taskList.appendChild(vacio);
    return;
  }

  const indices = tasks.map((_, i) => i);
  const ordenados = [
    ...indices.filter((i) => !tasks[i].completada),
    ...indices.filter((i) => tasks[i].completada),
  ];

  ordenados.forEach((i) => {
    const tarea = tasks[i];

    const li = document.createElement("li");
    li.className = "task-item" + (tarea.completada ? " done" : "");

    const check = document.createElement("input");
    check.type = "checkbox";
    check.checked = tarea.completada;
    check.setAttribute("aria-label", "Marcar como completada");
    check.addEventListener("change", () => {
      tasks[i].completada = check.checked;
      renderTasks();
    });

    const texto = document.createElement("span");
    texto.className = "task-text";
    texto.textContent = tarea.descripcion;

    const borrar = document.createElement("button");
    borrar.className = "delete-btn";
    borrar.type = "button";
    borrar.textContent = "-";
    borrar.setAttribute("aria-label", "Eliminar tarea");
    borrar.addEventListener("click", () => {
      tasks.splice(i, 1);
      renderTasks();
    });

    li.append(check, texto, borrar);
    taskList.appendChild(li);
  });
}

taskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const descripcion = taskInput.value.trim();
  if (!descripcion) return;
  tasks.push({ descripcion, completada: false });
  taskInput.value = "";
  renderTasks();
  taskInput.focus();
});

renderTasks();