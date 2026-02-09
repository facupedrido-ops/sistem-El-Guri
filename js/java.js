class Producto {
  constructor(id, nombre, precio, precioCompra, talles, categoria = "", subcategoria = null) {
    this.id = id;
    this.nombre = nombre;
    this.precio = Number(precio) || 0;                 // venta
    this.precioCompra = Number(precioCompra) || 0;     // compra
    this.talles = talles;
    this.categoria = categoria.toLowerCase();
  }

  mostrarInfo(contenedor) {
    const fila = document.createElement("div");
    fila.className = "producto-row";
    fila.dataset.prodId = String(this.id);

    const pc = Number(this.precioCompra);
    const precioCompraOK = Number.isFinite(pc) ? pc : 0;

    fila.innerHTML = `
      <div>${this.id}</div>
      <div>${this.nombre}</div>
      <div>$${this.precio}</div>
      <div class="small-muted privado">$${precioCompraOK}</div>
      <div>${this.categoria}</div>
      <div class="talles"></div>
            <div class="acciones">
                <button class="btn-editar"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg></button>
                <button class="btn-eliminar"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg></button>
            </div>
        `;

        contenedor.appendChild(fila);

    const contenedorTalles = fila.querySelector(".talles");
    this.mostrarTalles(contenedorTalles);

    fila.querySelector(".btn-editar").onclick = () => abrirModal(this);
    fila.querySelector(".btn-eliminar").onclick = () => {
      if (confirm(`¿Eliminar "${this.nombre}"?`)) {
        stock.productos = stock.productos.filter(p => p.id !== this.id);
        renderProductos();
      }
    };
  }

  mostrarTalles(contenedorTalles) {
    contenedorTalles.innerHTML = "";
    for (let talle in this.talles) {
      const stockT = this.talles[talle];
      const btn = document.createElement("button");
      btn.className = "btn-talle";
      btn.innerText = talle;
      btn.title = `Stock: ${stockT}`;

      if (stockT === 0) btn.classList.add("stock-out");
      else if (stockT < 10) btn.classList.add("stock-low");
      else btn.classList.add("stock-ok");

      btn.onclick = () => {
        productoStockActual = this;
        talleStockActual = talle;
        abrirModalStock();
      };

      contenedorTalles.appendChild(btn);
    }
  }
}

/* ================= CLASE STOCK ================= */
class Stock {
    constructor() {
        this.productos = [];
    }

    agregarProducto(producto) {
        if (this.productos.some(p => p.id === producto.id)) {
            alert("El ID ya existe");
            return false;
        }
        this.productos.push(producto);
        return true;
    }

    verProductos() {
        return this.productos;
    }
}

/* ================= INSTANCIA STOCK ================= */
const stock = new Stock();

/* ================= GENERADOR DE ID AUTOMÁTICO ================= */
let contadorProductos = 0;

/* ================= GENERADOR DE ID CORRELATIVO (H/1000, M/1000) ================= */

function getMaxCorrelativo(prefix) {
  let max = 0;

  (stock.productos || []).forEach(p => {
    const id = String(p.id || "").toUpperCase().trim();

    // Espera formato H/1000 o M/1000
    const m = id.match(/^([HM])\/(\d+)$/);
    if (!m) return;

    const pref = m[1];
    const num = Number(m[2]);

    if (pref === prefix && Number.isFinite(num)) {
      if (num > max) max = num;
    }
  });

  return max;
}

function generarID(pref = "H") {
  const prefix = pref.toUpperCase();
  const base = 1000;

  const maxActual = getMaxCorrelativo(prefix);
  const next = Math.max(base, maxActual + 1);

  return `${prefix}/${next}`;
}

/* ================= RENDERIZADO ================= */
function renderProductos() {
    const contenedor = document.getElementById("listaProductos");
    contenedor.innerHTML = "";
    stock.verProductos().forEach(producto => producto.mostrarInfo(contenedor));
}

function renderProductosFiltrados(productos) {
    const contenedor = document.getElementById("listaProductos");
    contenedor.innerHTML = "";
    productos.forEach(producto => producto.mostrarInfo(contenedor));
}

/* ================= MODAL PRODUCTO ================= */
const modal = document.getElementById("modalProducto");
const inputId = document.getElementById("inputId");
const inputNombre = document.getElementById("inputNombre");
const inputPrecio = document.getElementById("inputPrecio");
const inputPrecioCompraa = document.getElementById("inputPrecioCompraa");
const inputCategoria = document.getElementById("inputCategoria");
const btnGuardar = document.getElementById("btnGuardar");
const btnCancelar = document.getElementById("btnCancelar");
const tituloModal = document.getElementById("tituloModal");
const sugerenciasCategorias = document.getElementById("sugerenciasCategorias");
const inputGenero = document.getElementById("inputGenero");
const selectTipoTalles = document.getElementById("selectTipoTalles");

const errorId = document.getElementById("errorId");
const errorNombre = document.getElementById("errorNombre");
const errorPrecio = document.getElementById("errorPrecio");
const errorPrecioCompra = document.getElementById("errorPrecioCompra");
const errorCategoria = document.getElementById("errorCategoria");

let productoEditando = null;

// Mayuscula la primera letra de cada palabra
function capitalizarTexto(texto) {
    return texto
        .toLowerCase()
        .split(" ")
        .filter(p => p.trim() !== "")
        .map(p => p.charAt(0).toUpperCase() + p.slice(1))
        .join(" ");
}

inputNombre.addEventListener("blur", () => {
    inputNombre.value = capitalizarTexto(inputNombre.value);
});

inputCategoria.addEventListener("blur", () => {
    inputCategoria.value = capitalizarTexto(inputCategoria.value);
});

function obtenerCategoriasUnicas() {
  const categorias = (stock.productos || [])
    .map(p => (p.categoria || "").trim())
    .filter(Boolean);

  return Array.from(new Set(categorias.filter(c => c)));
}


inputCategoria.addEventListener("input", () => {
    const texto = inputCategoria.value.toLowerCase().trim();
    sugerenciasCategorias.innerHTML = "";

    if (!texto) {
        sugerenciasCategorias.classList.add("oculto");
        return;
    }

    const coincidencias = obtenerCategoriasUnicas().filter(cat =>
        cat.toLowerCase().includes(texto)
    );

    coincidencias.forEach(cat => {
        const li = document.createElement("li");
        li.textContent = capitalizarTexto(cat);
        li.addEventListener("click", () => {
            inputCategoria.value = capitalizarTexto(cat);
            sugerenciasCategorias.classList.add("oculto");
        });
        sugerenciasCategorias.appendChild(li);
    });

    sugerenciasCategorias.classList.toggle("oculto", coincidencias.length === 0);
});

/* ================= NAVEGACION ENTER EN MODAL ================= */
const inputsModal = [inputId, inputNombre, inputPrecio,inputPrecioCompraa, inputCategoria];
inputsModal.forEach((input, index) => {
    input.addEventListener("keydown", e => {
        if (e.key === "Enter") {
            e.preventDefault();
            const next = inputsModal[index + 1];
            next ? next.focus() : btnGuardar.click();
        }
    });
});

// ================= TALLES DINÁMICOS (MODAL PRODUCTO) =================
const stockInputsWrap = document.getElementById("stockInputs");

// 1) Esquemas de talles por “tipo”
const ESQUEMAS_TALLES = {
  letras_ropa: ["S","M","L","XL","XXL","XXXL"],
  numeros_pantalon: ["38","40","42","44","46","48","ESPECIALES"],
  numeros_1_6: ["1","2","3","4","5","6","ESPECIALES"],
  unico: ["UNICO"],
  boxer: ["M","L","XL","XXL","XXXL","XXXXL"]
};

// 2) Detectar esquema según categoría/nombre (simple pero efectivo)
function esquemaPorCategoria(cat = "", nombre = "") {
  const c = (cat || "").toLowerCase();
  const n = (nombre || "").toLowerCase();

  // accesorios
  if (c.includes("media") || n.includes("media")) return ESQUEMAS_TALLES.unico;

  // boxer
  if (c.includes("boxer") || n.includes("boxer")) return ESQUEMAS_TALLES.boxer;

  // deportivo 1..6
  if (c.includes("deportivo") || n.includes("lycra") || n.includes("microfibra") || n.includes("acetato") || n.includes("termica")) {
    return ESQUEMAS_TALLES.numeros_1_6;
  }

  // ✅ ACA PEGÁS ESTO
  if (c.includes("camisa") || n.includes("camisa") || n.includes("lino")) {
    return ESQUEMAS_TALLES.numeros_1_6;
  }

  // pantalones/jeans/bermudas (38..48 + especiales)
  if (
    c.includes("pantal") || c.includes("jean") || c.includes("berm") ||
    n.includes("pantal") || n.includes("jean") || n.includes("berm")
  ) return ESQUEMAS_TALLES.numeros_pantalon;

  // default ropa letras
  return ESQUEMAS_TALLES.letras_ropa;
}

function obtenerListaTallesPorSelector() {
  const modo = (selectTipoTalles?.value || "auto");

  if (modo === "auto") {
    return esquemaPorCategoria(inputCategoria.value, inputNombre.value);
  }
  return ESQUEMAS_TALLES[modo] || ESQUEMAS_TALLES.letras_ropa;
}

// 3) Render inputs de stock según lista de talles
function renderStockInputs(tallesList, valores = {}) {
  if (!stockInputsWrap) return;
  stockInputsWrap.innerHTML = "";

  tallesList.forEach(t => {
    const key = String(t).toUpperCase();

    const input = document.createElement("input");
    input.type = "number";
    input.min = "0";
    input.autocomplete = "off";
    input.placeholder = key;
    input.dataset.talle = key;
   const val = Number(valores?.[key] ?? "");
input.value = val > 0 ? val : "";


    input.style.width = "80px";
    input.style.padding = "8px";
    input.style.border = "1px solid #ccc";
    input.style.borderRadius = "8px";

    stockInputsWrap.appendChild(input);
  });
}


// 4) Leer inputs dinámicos y devolver objeto talles {TALLE: stock}
function leerTallesDesdeInputs() {
  const out = {};
  if (!stockInputsWrap) return out;

  stockInputsWrap.querySelectorAll("input[data-talle]").forEach(inp => {
    const t = inp.dataset.talle;
    out[t] = Number(inp.value) || 0;
  });

  return out;
}



/* ================= ABRIR / CERRAR MODAL PRODUCTO ================= */
/* ================= ABRIR / CERRAR MODAL PRODUCTO ================= */
function generoDesdeId(id) {
  const x = String(id || "").toUpperCase();
  if (x.startsWith("H/")) return "H";
  if (x.startsWith("M/")) return "M";
  return "H";
}

function abrirModal(producto = null) {
  modal.classList.remove("oculto");

  errorNombre.innerText = "";
  errorPrecio.innerText = "";
  errorCategoria.innerText = "";
  errorPrecioCompra.innerText = "";

  if (producto) {
    // EDITAR
    tituloModal.innerText = "Editar Producto";

    inputGenero.value = generoDesdeId(producto.id);
    inputId.value = producto.id;
    inputId.disabled = true;

    inputNombre.value = producto.nombre || "";
    inputPrecio.value = producto.precio ?? "";
    inputPrecioCompraa.value = producto.precioCompra ?? "";
    inputCategoria.value = producto.categoria || "";

    if (selectTipoTalles) {
  selectTipoTalles.value = "auto";
  selectTipoTalles.disabled = true; // para no romper talles existentes
}

    // ✅ SI EL PRODUCTO YA TIENE TALLES, USO ESOS (NO INVENTO OTROS)
    const tallesExistentes = Object.keys(producto.talles || {});
    const lista = tallesExistentes.length
      ? ordenarTalles(tallesExistentes)
      : esquemaPorCategoria(producto.categoria, producto.nombre);

    renderStockInputs(lista, producto.talles || {});
    productoEditando = producto;

  } else {
    // NUEVO
    tituloModal.innerText = "Agregar Producto";
inputId.value = generarID();
inputId.disabled = true;

    inputNombre.value = "";
    inputPrecio.value = "";
    inputPrecioCompraa.value = "";
    inputCategoria.value = "";

    if (selectTipoTalles) selectTipoTalles.disabled = false;

    renderStockInputs(obtenerListaTallesPorSelector(), {});
    productoEditando = null;
  }

  // Cuando elijo un tipo de talle, rearmo inputs
selectTipoTalles?.addEventListener("change", () => {
  if (productoEditando) return; // si estás editando, no tocamos
  renderStockInputs(obtenerListaTallesPorSelector(), leerTallesDesdeInputs());
});

// Si está en AUTO, al escribir nombre/categoría se adapta
function refrescarAutoTalles() {
  if (productoEditando) return;
  if (!selectTipoTalles) return;
  if (selectTipoTalles.value !== "auto") return;

  renderStockInputs(obtenerListaTallesPorSelector(), leerTallesDesdeInputs());
}

inputCategoria?.addEventListener("input", refrescarAutoTalles);
inputNombre?.addEventListener("input", refrescarAutoTalles);


// si cambiás Hombre/Mujer mientras creás producto nuevo, regenero ID
inputGenero?.addEventListener("change", () => {
  if (productoEditando) return; // si estás editando, no tocar ID
  inputId.value = generarID(inputGenero.value);
});


btnCancelar.addEventListener("click", () => {
  modal.classList.add("oculto");
  productoEditando = null;
  limpiarStockInputs();
});


    inputNombre.focus();
}


function cerrarModal() {
    modal.classList.add("oculto");
}

function ordenarTalles(arr = []) {
  const a = (arr || []).map(x => String(x).toUpperCase().trim()).filter(Boolean);

  const especiales = a.filter(x => x === "ESPECIALES");
  const unicos = a.filter(x => x === "UNICO");

  const resto = a.filter(x => x !== "ESPECIALES" && x !== "UNICO");

  const nums = resto.filter(x => /^\d+$/.test(x)).sort((x,y)=> Number(x)-Number(y));
  const otros = resto.filter(x => !/^\d+$/.test(x)).sort();

  // orden: números -> otros -> UNICO -> ESPECIALES
  return [...nums, ...otros, ...unicos, ...especiales];
}

function existeProducto(nombre, ignorarId = null) {
  return stock.productos.some(p =>
    p.id !== ignorarId &&
    p.nombre.trim().toLowerCase() === nombre.trim().toLowerCase());
}

inputCategoria.addEventListener("input", () => {
  // si estás editando, NO te rompo los talles existentes
  if (productoEditando) return;

  const esquema = esquemaPorCategoria(inputCategoria.value, inputNombre.value);
  renderStockInputs(esquema, leerTallesDesdeInputs()); // conserva lo que ya escribió
});

inputNombre.addEventListener("input", () => {
  if (productoEditando) return;
  const esquema = esquemaPorCategoria(inputCategoria.value, inputNombre.value);
  renderStockInputs(esquema, leerTallesDesdeInputs());
});

/* ================= GUARDAR PRODUCTO ================= */
btnGuardar.onclick = guardarProducto;

function guardarProducto() {
  let valid = true;

  errorNombre.innerText = "";
  errorPrecio.innerText = "";
  errorCategoria.innerText = "";
  errorPrecioCompra.innerText = "";

  const id = inputId.value.trim();
  const nombre = inputNombre.value.trim();
  const precio = Number(inputPrecio.value);
  const precioCompra = Number(inputPrecioCompraa.value);
  const categoria = inputCategoria.value.trim();
  const talles = leerTallesDesdeInputs();

  // Validaciones básicas
  if (!nombre) { errorNombre.innerText = "Nombre inválido"; valid = false; }
  if (isNaN(precio) || precio <= 0) { errorPrecio.innerText = "Precio inválido"; valid = false; }
  if (isNaN(precioCompra) || precioCompra < 0) { errorPrecioCompra.innerText = "Compra inválida"; valid = false; }
  if (!categoria) { errorCategoria.innerText = "Categoría requerida"; valid = false; }

  if (!valid) return;

  // ✅ SOLO validar nombre repetido si VOS QUERÉS bloquearlo
  // (si no querés bloquear nombres repetidos, borrá este bloque)
  const idActual = productoEditando ? productoEditando.id : null;
  if (existeProducto(nombre, idActual)) {
    alert("Ese producto ya existe");
    return;
  }

  if (productoEditando) {
    productoEditando.nombre = nombre;
    productoEditando.precio = precio;
    productoEditando.precioCompra = precioCompra;
    productoEditando.categoria = categoria.toLowerCase();
    productoEditando.talles = talles;
  } else {
    const ok = stock.agregarProducto(new Producto(id, nombre, precio, precioCompra, talles, categoria));
    if (!ok) return; // stock.agregarProducto ya alerta “El ID ya existe”
  }

  cerrarModal();
  renderProductos();
  actualizarListaCategorias();
  actualizarProductosSugerencias?.();
}

/* ================= BOTONES PRINCIPALES ================= */
btnCancelar.addEventListener("click", cerrarModal);
document.getElementById("btnAgregarProducto").addEventListener("click", () => abrirModal());

const btnVerProductos = document.getElementById("btnVerProductos");
const btnVerProductosText = btnVerProductos.querySelector("span");
const seccionProductos = document.getElementById("seccionProductos");
const btnFiltroCategorias = document.getElementById("btnFiltroCategorias");
const listaCategorias = document.getElementById("listaCategorias");

btnVerProductos.addEventListener("click", () => {
  const estabaOculto = seccionProductos.classList.contains("oculto");

  ocultarTodasLasSecciones();

  if (estabaOculto) {
    seccionProductos.classList.remove("oculto");
    btnVerProductosText.textContent = "Ocultar productos";
    renderProductos();
  } else {
    seccionProductos.classList.add("oculto");
    btnVerProductosText.textContent = "Productos";
    inputBuscar.value = "";
  }
});


/* ================= MODAL STOCK ================= */
const modalStock = document.getElementById("modalStock");
const stockInfo = document.getElementById("stockInfo");
const inputCantidadStock = document.getElementById("inputCantidadStock");
const errorStock = document.getElementById("errorStock");
const btnConfirmarStock = document.getElementById("btnConfirmarStock");
const btnCancelarStock = document.getElementById("btnCancelarStock");

let productoStockActual = null;let talleStockActual = null;

function cerrarModalStock() {
    modalStock.classList.add("oculto");
}

btnConfirmarStock.addEventListener("click", () => {
    const cantidad = Number(inputCantidadStock.value);

    if (!Number.isInteger(cantidad) || cantidad <= 0) {
        errorStock.innerText = "Cantidad inválida";
        return;
    }

    productoStockActual.talles[talleStockActual] += cantidad;
    cerrarModalStock();
    renderProductos();
});

btnCancelarStock.addEventListener("click", cerrarModalStock);

inputCantidadStock.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        btnConfirmarStock.click();
    }
});

/* ================= BUSCADOR DE PRODUCTOS SIMPLE ================= */

const inputBuscar = document.getElementById("inputBuscar");
const sugerenciasBuscar = document.getElementById("sugerenciasBuscar");
let indiceSeleccionado = -1;

inputBuscar.addEventListener("input", () => {
    const texto = inputBuscar.value.toLowerCase();
    sugerenciasBuscar.innerHTML = "";
    indiceSeleccionado = -1;

    if (!texto) {
        sugerenciasBuscar.classList.add("oculto");
        renderProductos();
        return;
    }

    const coincidencias = stock.verProductos().filter(p =>
        p.nombre.toLowerCase().includes(texto) ||
        p.id.toLowerCase().includes(texto) ||
        (p.categoria && p.categoria.toLowerCase().includes(texto))
    );

    coincidencias.forEach(p => {
        const li = document.createElement("li");
        li.textContent = `${p.id} - ${p.nombre}`; 
        li.dataset.prodId = p.id;
        li.addEventListener("click", () => {
            sugerenciasBuscar.classList.add("oculto");
            inputBuscar.value = "";
            irAProducto(p.id, () => renderProductos());
        });
        sugerenciasBuscar.appendChild(li);
    });

    sugerenciasBuscar.classList.toggle("oculto", coincidencias.length === 0);
});

function irASeccionProductos() {
  // Cerrás todo y abrís Productos (ajustá a tu sistema si ya tenés función)
  ocultarTodasLasSecciones();
  document.getElementById("seccionProductos")?.classList.remove("oculto");
}

function destacarProductoPorId(id) {
  // Limpiar resaltados anteriores
  document.querySelectorAll(".producto-row.destacado")
    .forEach(el => el.classList.remove("destacado"));

  const row = document.querySelector(`.producto-row[data-prod-id="${String(id)}"]`);
  if (!row) return;

  row.classList.add("destacado");
  row.scrollIntoView({ behavior: "smooth", block: "center" });

  // Sacar highlight después de un rato
  setTimeout(() => row.classList.remove("destacado"), 2200);
}

/**
 * Navega a productos y enfoca uno puntual
 * - renderListFn: si tu lista necesita renderizarse antes, pasás una función (opcional)
 */
function irAProducto(id, renderListFn = null) {
  irASeccionProductos();

  // Si necesitás re-render antes de buscar la fila (depende tu código)
  if (typeof renderListFn === "function") renderListFn();

  // Espera un tick por si renderiza async
  setTimeout(() => destacarProductoPorId(id), 50);
}


function seleccionarSugerencia(producto) {
    inputBuscar.value = `${producto.id} - ${producto.nombre}`;
    sugerenciasBuscar.classList.add("oculto");

    seccionProductos.classList.remove("oculto");
    btnVerProductosText.textContent = "Ocultar productos";

    renderProductosFiltrados([producto]);

    setTimeout(() => {
        document.querySelector(".producto-row")?.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }, 100);
}

/* ================= NAVEGACIÓN CON TECLADO ================= */

inputBuscar.addEventListener("keydown", e => {
    const items = sugerenciasBuscar.querySelectorAll("li");
    if (!items.length) return;

    if (e.key === "ArrowDown") {
        e.preventDefault();
        indiceSeleccionado = (indiceSeleccionado + 1) % items.length;
        actualizarSeleccion(items);
    }

    if (e.key === "ArrowUp") {
        e.preventDefault();
        indiceSeleccionado = (indiceSeleccionado - 1 + items.length) % items.length;
        actualizarSeleccion(items);
    }

    if (e.key === "Enter" && indiceSeleccionado >= 0) {
        e.preventDefault();
        if (e.key === "Enter" && indiceSeleccionado >= 0) {
            e.preventDefault();
            const id = items[indiceSeleccionado].dataset.prodId;
            if (!id) return;
            sugerenciasBuscar.classList.add("oculto");
            inputBuscar.value = "";
            irAProducto(id, () => renderProductos());
}

    }
});

function actualizarSeleccion(items) {
    items.forEach(li => li.classList.remove("activa"));
    if (items[indiceSeleccionado]) {
        items[indiceSeleccionado].classList.add("activa");
    }
}

/* ================= CERRAR SI HACE CLICK AFUERA ================= */

document.addEventListener("click", e => {
    if (!e.target.closest(".buscador-wrapper")) {
        sugerenciasBuscar.classList.add("oculto");
    }
});

/* ================= VENTAS ================= */
const seccionVentas = document.getElementById("seccionVentas");
const inputCliente = document.getElementById("inputCliente");
const inputTelefono = document.querySelectorAll("#inputTelefono")[0]; // solo el primero
const inputBuscarProducto = document.getElementById("inputBuscarVenta");
const listaSugerencias = document.getElementById("sugerenciasVenta");
const selectTalle = document.getElementById("selectTalle");
const inputCantidadProducto = document.getElementById("inputCantidadProducto");
const btnAgregarAlCarrito = document.getElementById("btnAgregarAlCarrito");
const carritoVenta = document.getElementById("carritoVenta");
const inputDescuento = document.getElementById("inputDescuento");
const subtotalSpan = document.getElementById("subtotalVenta");
const totalVentaSpan = document.getElementById("totalVenta");
const selectPago = document.getElementById("selectPago");
const contenedorBanco = document.getElementById("contenedorBanco");
const inputCuotas = document.getElementById("inputCuotas");
const btnConfirmarVenta = document.getElementById("btnConfirmarVenta");
const nombreCliente = document.getElementById("inputCliente").value.trim();
const email = document.getElementById("inputEmail").value.trim();
const telefono = document.getElementById("inputTelefono").value.trim();
const ads = document.getElementById("inputAds").value.trim();
const btnProveedores = document.getElementById("btnProveedores");
const seccionProveedores = document.getElementById("seccionProveedores");

let carrito = [];
let ventas = JSON.parse(localStorage.getItem("ventas_v1") || "[]");
let productoSeleccionado = null;
let indiceSugerenciaVenta = -1;


/* ================= Mostrar sección ================= */
document.getElementById("btnVentas").addEventListener("click", () => {
    ocultarTodasLasSecciones();
    seccionVentas.classList.remove("oculto");
    inputBuscarProducto.focus();
    if (!seccionVentas.classList.contains("oculto")) inputBuscarProducto.focus();
});




inputCliente.addEventListener("blur", () => {
    inputCliente.value = capitalizarTexto(inputCliente.value);
});

/* ================= BUSCADOR PRODUCTOS ================= */
inputBuscarProducto.addEventListener("input", () => {
    const texto = inputBuscarProducto.value.toLowerCase();
    listaSugerencias.innerHTML = "";
    indiceSugerenciaVenta = -1;
    productoSeleccionado = null;

    if (!texto) {
        listaSugerencias.classList.add("oculto");
        selectTalle.innerHTML = `<option value="">Elegir talle</option>`;
        return;
    }

    const coincidencias = stock.verProductos().filter(p =>
        p.nombre.toLowerCase().startsWith(texto) ||
        p.id.toLowerCase().startsWith(texto)
    );

    coincidencias.forEach(p => {
        const li = document.createElement("li");
        li.textContent = `${p.id} - ${p.nombre} ($${p.precio})`;
        li.addEventListener("click", () => seleccionarProductoSugerido(p));
        listaSugerencias.appendChild(li);
    });

    listaSugerencias.classList.toggle("oculto", coincidencias.length === 0);
});

function seleccionarProductoSugerido(p) {
    inputBuscarProducto.value = `${p.id} - ${p.nombre}`;
    productoSeleccionado = p;
    listaSugerencias.classList.add("oculto");

    selectTalle.innerHTML = `<option value="">Elegir talle</option>`;
    Object.keys(p.talles).forEach(talle => {
        if (p.talles[talle] > 0) {
            const option = document.createElement("option");
            option.value = talle;
            option.textContent = `${talle} (Stock: ${p.talles[talle]})`;
            selectTalle.appendChild(option);
        }
    });
}

/* ================= TECLADO ↑ ↓ ENTER ================= */
inputBuscarProducto.addEventListener("keydown", e => {
    const items = listaSugerencias.querySelectorAll("li");
    if (!items.length) return;

    if (e.key === "ArrowDown") {
        e.preventDefault();
        indiceSugerenciaVenta = (indiceSugerenciaVenta + 1) % items.length;
        actualizarSeleccionVenta(items);
    }

    if (e.key === "ArrowUp") {
        e.preventDefault();
        indiceSugerenciaVenta = (indiceSugerenciaVenta - 1 + items.length) % items.length;
        actualizarSeleccionVenta(items);
    }

    if (e.key === "Enter" && indiceSugerenciaVenta >= 0) {
        e.preventDefault();
        items[indiceSugerenciaVenta].click();
    }
});

function actualizarSeleccionVenta(items) {
    items.forEach(li => li.classList.remove("activa"));
    if (items[indiceSugerenciaVenta]) items[indiceSugerenciaVenta].classList.add("activa");
}

// Cerrar sugerencias clic afuera
document.addEventListener("click", e => {
    if (!e.target.closest(".producto-buscador")) {
        listaSugerencias.classList.add("oculto");
    }
});

/* ================= AGREGAR AL CARRITO ================= */
btnAgregarAlCarrito.addEventListener("click", () => {
    if (!productoSeleccionado) return alert("Seleccioná un producto");
    const talle = selectTalle.value;
    if (!talle) return alert("Elegí un talle");

    const cantidad = Number(inputCantidadProducto.value);
    if (cantidad <= 0) return alert("Cantidad inválida");
    if (cantidad > productoSeleccionado.talles[talle]) return alert("No hay suficiente stock");

    const existente = carrito.find(item => item.producto.id === productoSeleccionado.id && item.talle === talle);
    if (existente) existente.cantidad += cantidad;
    else carrito.push({ producto: productoSeleccionado, talle, cantidad });

    renderCarrito();

    // limpiar inputs
    inputBuscarProducto.value = "";
    productoSeleccionado = null;
    selectTalle.innerHTML = `<option value="">Elegir talle</option>`;
    inputCantidadProducto.value = 1;
});

/* ================= RENDER CARRITO ================= */
function renderCarrito() {
    carritoVenta.innerHTML = "";
    if (!carrito.length) {
        subtotalSpan.innerText = "0";
        totalVentaSpan.innerText = "0";
        return;
    }

    const header = document.createElement("div");
    header.className = "productos-header";
    header.innerHTML = `
        <div>ID</div>
        <div>Nombre</div>
        <div>Talle</div>
        <div>Precio</div>
        <div>Cantidad</div>
        <div>Acción</div>
    `;
    carritoVenta.appendChild(header);

    let subtotal = 0;
    carrito.forEach((item, index) => {
        const fila = document.createElement("div");
        fila.className = "producto-row";
        fila.innerHTML = `
            <div>${item.producto.id}</div>
            <div>${item.producto.nombre}</div>
            <div>${item.talle}</div>
            <div>$${item.producto.precio.toLocaleString('es-AR', {maximumFractionDigits:0})}</div>
            <div>${item.cantidad}</div>
            <div><button onclick="eliminarDelCarrito(${index})"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg></button></div>
        `;
        carritoVenta.appendChild(fila);
        subtotal += item.producto.precio * item.cantidad;
    });

    // Formatear subtotal
    subtotalSpan.innerText = subtotal.toLocaleString('es-AR', {maximumFractionDigits:0});

    let total = subtotal * (1 - (Number(inputDescuento.value) || 0)/100);
    if (selectPago.value === "tarjeta-credito") total *= 1.15;

    // Formatear total
    totalVentaSpan.innerText = total.toLocaleString('es-AR', {maximumFractionDigits:0});
}


function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    renderCarrito();
}

inputDescuento.addEventListener("keydown", e => { if(e.key==="Enter") renderCarrito(); });

/* ================= FORMA DE PAGO ================= */
selectPago.addEventListener("change", () => {
  contenedorBanco.innerHTML = "";

  // por defecto oculto cuotas
  inputCuotas.classList.add("oculto");

  // cuotas SOLO crédito
  if (selectPago.value === "tarjeta-credito") {
    inputCuotas.classList.remove("oculto");
  } else {
    // si cambian a débito/efectivo/transferencia, reset
    inputCuotas.value = 1;
  }

  // transferencia -> banco
  if (selectPago.value === "transferencia") {
    const select = document.createElement("select");
    select.id = "selectBanco";
    select.innerHTML = `
      <option value="">Elegí un banco</option>
      <option value="BBVA">BBVA</option>
      <option value="Santander">Santander</option>
      <option value="Galicia">Galicia</option>
      <option value="Macro">Macro</option>
      <option value="Banco Nación">Banco Nación</option>
      <option value="Mercado Pago">Mercado Pago</option>
    `;
    contenedorBanco.appendChild(select);
  }

  renderCarrito();
});

// Confirmar venta
btnConfirmarVenta.addEventListener("click", () => {
    const nombre = inputCliente.value.trim();
    const email = document.getElementById("inputEmail").value.trim();
    const telefono = document.getElementById("inputTelefono").value.trim();
    const ads = document.getElementById("inputAds").value.trim();

    if (!nombre) return alert("El nombre del cliente es obligatorio");
    if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return alert("Ingrese un email válido");
  }
     const telDigits = telefono.replace(/\D/g, "");
  if (telDigits.length > 0 && telDigits.length < 8) {
    alert("Teléfono muy corto (mínimo 8 dígitos).");
    return;
  }
    const dniDigits = ads.replace(/\D/g, "");
  if (dniDigits.length > 0 && (dniDigits.length < 7 || dniDigits.length > 10)) {
    return alert("DNI inválido (7 a 10 dígitos).");
  }

    if (carrito.length === 0) return alert("Debe agregar productos al carrito");

    // → Aquí sigue tu lógica de registrar venta
    const venta = {
        id: ventas.length + 1,
        cliente: nombre,
        email,
        telefono,
        ads,
        productos: carrito.map(item => ({
            id: item.producto.id,
            nombre: item.producto.nombre,
            talle: item.talle,
            precio: item.producto.precio,
            cantidad: item.cantidad
        })),
        pagoMixto: window.__ventaPagoMixto || null,
        subtotal: parseMoneyAR(subtotalSpan.innerText),
        total: parseMoneyAR(totalVentaSpan.innerText),
        formaPago: selectPago.value,
        banco: document.getElementById("selectBanco")?.value || null,
        cuotas: selectPago.value === "tarjeta-credito" ? Number(inputCuotas.value) || 1 : 1,
        descuento: Number(inputDescuento.value) || 0,
        fecha: new Date()
    };
    
    if (selectPago.value === "cuenta-corriente") {
  const clienteId = cc_upsertCliente({
    nombre,
    tel: telefono,
    email
  });

  cc_addCargo(
    clienteId,
    venta.total,
    `Venta #${venta.id}`,
    venta.id
  );
}

    ventas.push(venta);
    localStorage.setItem("ventas_v1", JSON.stringify(ventas));

    if (selectPago.value !== "cuenta-corriente") {
      registrarVentaEnCaja(venta);
      renderCaja();
    }

    // Reducir stock
    carrito.forEach(item => {
        const prod = stock.productos.find(p => p.id === item.producto.id);
        if (prod && prod.talles[item.talle] !== undefined) {
            prod.talles[item.talle] -= item.cantidad;
            if (prod.talles[item.talle] < 0) prod.talles[item.talle] = 0;
        }
    });

    // Limpiar formulario
    carrito = [];
    inputCliente.value = "";
    document.getElementById("inputEmail").value = "";
    inputTelefono.value = "";
    inputAds.value = "";
    inputDescuento.value = 0;
    selectPago.value = "efectivo";
    contenedorBanco.innerHTML = "";
    inputCuotas.value = 1;
    inputCuotas.style.display = "none";
    selectTalle.innerHTML = `<option value="">Elegir talle</option>`;
    
    renderCarrito();

    alert("Venta registrada correctamente");
});

const btnCalculadora = document.getElementById("btnCalculadora");
const calculadora = document.getElementById("calculadora");
const calcDisplay = document.getElementById("calcDisplay");
let currentInput = "";

// Mostrar/ocultar calculadora
btnCalculadora.addEventListener("click", () => {
    calculadora.classList.toggle("oculto");
});

// Funcionalidad botones
calculadora.querySelectorAll(".calc-buttons button").forEach(btn => {
    btn.addEventListener("click", () => {
        const val = btn.textContent;
        if (val === "=") {
            try {
                currentInput = eval(currentInput).toString();
            } catch {
                currentInput = "Error";
            }
        } else if (val === "C") {
            currentInput = "";
        } else {
            currentInput += val;
        }
        calcDisplay.value = currentInput;
    });
});

// Draggable
let offsetX, offsetY, isDragging = false;
const header = document.getElementById("calcHeader");

header.addEventListener("mousedown", e => {
    isDragging = true;
    offsetX = e.clientX - calculadora.offsetLeft;
    offsetY = e.clientY - calculadora.offsetTop;
    header.style.cursor = "grabbing";
});

document.addEventListener("mousemove", e => {
    if (isDragging) {
        calculadora.style.left = `${e.clientX - offsetX}px`;
        calculadora.style.top = `${e.clientY - offsetY}px`;
    }
});

document.addEventListener("mouseup", () => {
    isDragging = false;
    header.style.cursor = "grab";
});

document.addEventListener("keydown", (e) => {
    if (calculadora.classList.contains("oculto")) return;

    const numeros = "0123456789";
    const operadores = "+-*/.";

    if (numeros.includes(e.key) || operadores.includes(e.key)) {
        e.preventDefault();
        currentInput += e.key;
        calcDisplay.value = currentInput;
    } 
    else if (e.key === "Enter" || e.key === "=") {
        e.preventDefault();
        try {
            currentInput = eval(currentInput).toString();
        } catch {
            currentInput = "Error";
        }
        calcDisplay.value = currentInput;
    } 
    else if (e.key.toUpperCase() === "C") {
        e.preventDefault();
        currentInput = "";
        calcDisplay.value = "";
    }
    else if (e.key === "Backspace") {
        e.preventDefault();
        currentInput = currentInput.slice(0, -1);
        calcDisplay.value = currentInput;
    }
});

// Cerrar con ESC
document.addEventListener("keydown", e => {
    if (e.key === "Escape") calculadora.classList.add("oculto");
});

// ================= FILTRO: HOMBRE/MUJER -> CATEGORÍA =================
// 2) Helper: sacar género desde el ID tipo "H/1000" o "M/2000"
function getGeneroDesdeId(id) {
  const s = String(id || "").trim().toUpperCase();
  const m = s.match(/^([HM])\s*\//); // H/ o M/
  return m ? m[1] : null;
}

// 3) Categorías únicas por género (H o M)
function obtenerCategoriasPorGenero(genero) {
  const cats = stock.productos
    .filter(p => getGeneroDesdeId(p.id) === genero)
    .map(p => (p.categoria || "").trim().toLowerCase())
    .filter(c => c);

  return Array.from(new Set(cats)).sort((a, b) => a.localeCompare(b));
}

let filtroGenero = null; // "H" | "M" | null

function productoEsDeGenero(p, gen) {
  if (!gen) return true;
  const id = String(p.id || "").toUpperCase();
  return id.startsWith(gen + "/");
}

function actualizarListaCategorias() {
  listaCategorias.innerHTML = "";

  // 1) Si todavía NO elegiste género -> mostrar Hombre/Mujer/Todos
  if (!filtroGenero) {
    const opciones = [
      { key: "H", label: "Hombre" },
      { key: "M", label: "Mujer" },
      { key: "ALL", label: "Todos" },
    ];

    opciones.forEach(op => {
      const li = document.createElement("li");
      li.textContent = op.label;
      li.addEventListener("click", () => {
        filtroGenero = (op.key === "ALL") ? "ALL" : op.key;
        actualizarListaCategorias();
      });
      listaCategorias.appendChild(li);
    });

    return;
  }

  // 2) Botón volver
  const liBack = document.createElement("li");
  liBack.textContent = "← Volver (Hombre/Mujer)";
  liBack.style.fontWeight = "bold";
  liBack.addEventListener("click", () => {
    filtroGenero = null;
    actualizarListaCategorias();
  });
  listaCategorias.appendChild(liBack);

  // 3) Categorías según género
  const gen = (filtroGenero === "ALL") ? null : filtroGenero;

  const cats = Array.from(
    new Set(
      (stock.productos || [])
        .filter(p => productoEsDeGenero(p, gen))
        .map(p => (p.categoria || "").trim())
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b));

  cats.forEach(cat => {
    const li = document.createElement("li");
    li.textContent = capitalizarTexto(cat);

    li.addEventListener("click", () => {
      const filtrados = (stock.productos || []).filter(p =>
        productoEsDeGenero(p, gen) && String(p.categoria || "").trim() === cat
      );

      renderProductosFiltrados(filtrados);

      seccionProductos.classList.remove("oculto");
      btnVerProductosText.textContent = "Ocultar productos";
      listaCategorias.classList.add("oculto");
    });

    listaCategorias.appendChild(li);
  });
}


// Abrir/cerrar dropdown
btnFiltroCategorias.addEventListener("click", (e) => {
  e.stopPropagation();
  actualizarListaCategorias();
  listaCategorias.classList.toggle("oculto");
});

// Cerrar si clickeás afuera
document.addEventListener("click", (e) => {
  if (!e.target.closest(".filtro-categorias-wrapper")) {
    listaCategorias.classList.add("oculto");
  }
});



document.addEventListener("click", e => {
    if (!e.target.closest(".filtro-categorias-wrapper")) {
        listaCategorias.classList.add("oculto");
    }
});

document.getElementById("listaCategorias")?.addEventListener("click", (e) => {
  const li = e.target.closest("li");
  if (!li) return;

  // ignoro el "volver"
  const txt = li.textContent.trim();
  if (!txt || txt.startsWith("←")) return;

  // si todavía estás en Hombre/Mujer/Todos, no filtro acá
  if (txt === "Hombre" || txt === "Mujer" || txt === "Todos") return;

  // filtro por categoría elegida
  const cat = txt.toLowerCase();
  const filtrados = (stock.productos || []).filter(p =>
    String(p.categoria || "").toLowerCase().trim() === cat
  );

  renderProductosFiltrados(filtrados);

  seccionProductos.classList.remove("oculto");
  btnVerProductosText.textContent = "Ocultar productos";
  listaCategorias.classList.add("oculto");
});

// Mostrar sección de productos y hacer scroll
function mostrarSeccionProductos() {
    const seccion = document.getElementById("seccionProductos");
    seccion.classList.remove("oculto");
    setTimeout(() => {
        document.querySelector(".producto-row")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
}

const btnNuevo = document.getElementById("btnAbrirModalProducto");
if (btnNuevo) {
    btnNuevo.addEventListener("click", () => abrirModal());
}

/* ================= COMPRAS ================= */

// Botón y sección
const btnCompras = document.getElementById("btnCompras");
const seccionCompras = document.getElementById("seccionCompras");

// Productos
const inputProductoCompra = document.getElementById("inputProductoCompra");
const sugerenciasProductosCompra = document.getElementById("sugerenciasProductosCompra");
const btnAgregarProductoCompra = document.getElementById("btnAgregarProductoCompra");

// Cantidades por talle y precio
const inputCompraS = document.getElementById("compraS");
const inputCompraM = document.getElementById("compraM");
const inputCompraL = document.getElementById("compraL");
const inputCompraXL = document.getElementById("compraXL");
const inputPrecioCompra = document.getElementById("precioCompra");

btnAgregarCompra.addEventListener("click", agregarProductoCompra);

// Datos globales
let productosCompra = []
let productos = stock.productos.map(p => p.nombre); // trae productos del stock
let compras = [];
function actualizarProductosSugerencias() {
    productos = stock.productos.map(p => p.nombre);
}


// Llamar a la función cada vez que escribís
inputProductoCompra.addEventListener("input", cargarSugerenciasProductosCompra);

// Cerrar sugerencias si hace click afuera
document.addEventListener("click", (e) => {
    if (!e.target.closest("#inputProductoCompra") && !e.target.closest("#sugerenciasProductosCompra")) {
        sugerenciasProductosCompra.classList.add("oculto");
    }
});


/* ====== MOSTRAR/OCULTAR SECCIÓN COMPRAS ====== */
btnCompras.addEventListener("click", () => {
    ocultarTodasLasSecciones();
    seccionCompras.classList.remove("oculto");
    inputProveedorCompra.focus();
});

/* ====== BUSCADOR DE PRODUCTOS ====== */
function cargarSugerenciasProductosCompra() {
    const valor = inputProductoCompra.value.toLowerCase().trim();
    sugerenciasProductosCompra.innerHTML = "";

    if (!valor) {
        sugerenciasProductosCompra.classList.add("oculto");
        return;
    }

    const filtrados = stock.productos.filter(p => {
        const palabras = p.nombre.toLowerCase().split(" ");
        return palabras.some(word => word.startsWith(valor));
    });

    filtrados.forEach(p => {
        const li = document.createElement("li");
        li.textContent = `${p.id} - ${p.nombre}`;
        li.addEventListener("click", () => {
            inputProductoCompra.value = `${p.id} - ${p.nombre}`;
            sugerenciasProductosCompra.classList.add("oculto");
             compraSel = p;               
             renderCompraTallesInputs(p); 
        });
        sugerenciasProductosCompra.appendChild(li);
    });

    sugerenciasProductosCompra.classList.toggle("oculto", filtrados.length === 0);
}


// Llamar a la función al escribir
inputProductoCompra.addEventListener("input", cargarSugerenciasProductosCompra);


inputProductoCompra.addEventListener("input", cargarSugerenciasProductosCompra);

/* ====== PRODUCTO NUEVO ====== */
btnAgregarProductoCompra.addEventListener("click", () => {
    abrirModal(); // abrir modal de productos si es necesario
});

function agregarProductoCompra() {
  const valor = inputProductoCompra.value.trim();
  if (!valor) return alert("Seleccioná un producto");

  const idProducto = valor.split(" - ")[0];
  const producto = stock.productos.find(p => p.id === idProducto);
  if (!producto) return alert("Producto no encontrado");

  // ✅ LEER PRIMERO lo que el usuario escribió (sin re-render)
  const talles = leerTallesCompraDesdeUI();

  if (Object.values(talles).every(c => Number(c || 0) === 0)) {
    return alert("Ingresá al menos una cantidad");
  }

  const totalUnidades = Object.values(talles).reduce((a, b) => a + Number(b || 0), 0);

  productosCompra.push({
    id: producto.id,
    nombre: producto.nombre,
    talles,
    totalUnidades
  });

  mostrarResumenCompra();

  // limpiar para el próximo producto
  inputProductoCompra.value = "";
  limpiarTallesCompraUI();
  sugerenciasProductosCompra.classList.add("oculto");
}

function mostrarResumenCompra() {
    const tbody = document.getElementById("resumenCompra");
    tbody.innerHTML = "";

    productosCompra.forEach((item, index) => {
        Object.entries(item.talles).forEach(([talle, cantidad]) => {
            if (cantidad > 0) {
                const tr = document.createElement("tr");

                tr.innerHTML = `
                    <td>${item.id}</td>
                    <td>${item.nombre}</td>
                    <td>${talle}</td>
                    <td>${cantidad}</td>
                    <td><button class="btn-eliminar" onclick="eliminarProductoCompra(${index}, '${talle}')"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg></button></td>
                `;

                tbody.appendChild(tr);
            }
        });
    });}

function limpiarInputsProductoCompra() {
    inputProductoCompra.value = "";
    limpiarTallesCompraUI();
    sugerenciasProductosCompra.innerHTML = "";
}

let compraSel = null;

function renderCompraTallesInputs(producto) {
  const cont = document.getElementById("compraTallesInputs");
  if (!cont) return;

  cont.innerHTML = "";

  const talles = producto?.talles ? Object.keys(producto.talles) : [];
  const ordenados = ordenarTalles(talles);

  if (ordenados.length === 0) {
    cont.innerHTML = `<div class="small-muted">Este producto no tiene talles cargados.</div>`;
    return;
  }

  ordenados.forEach(t => {
    const inp = document.createElement("input");
    inp.type = "number";
    inp.min = "0";
    inp.placeholder = t;
    inp.dataset.talle = t;
    inp.style.width = "70px";
    inp.style.padding = "8px";
    inp.style.border = "1px solid #ccc";
    inp.style.borderRadius = "8px";
    cont.appendChild(inp);
  });
}

function leerTallesCompraDesdeUI() {
  const cont = document.getElementById("compraTallesInputs");
  if (!cont) return {};

  const out = {};
  cont.querySelectorAll("input[data-talle]").forEach(inp => {
    const t = inp.dataset.talle;
    const n = Number(inp.value || 0);
    out[t] = Number.isFinite(n) ? n : 0;
  });
  return out;
}

function limpiarTallesCompraUI() {
  const cont = document.getElementById("compraTallesInputs");
  if (!cont) return;
  cont.querySelectorAll("input[data-talle]").forEach(inp => (inp.value = ""));
}

/* ====== GUARDAR COMPRA ====== */
const btnGuardarCompra = document.getElementById("btnGuardarCompra");

if (btnGuardarCompra) {  btnGuardarCompra.addEventListener("click", () => {
    if (productosCompra.length === 0) {
      alert("No agregaste productos a la compra");
      return;    }
    productosCompra.forEach(item => {
      const producto = stock.productos.find(p => p.id === item.id);
      if (!producto) return;

      Object.keys(item.talles).forEach(talle => {
  if (producto.talles[talle] == null) producto.talles[talle] = 0;
  producto.talles[talle] += item.talles[talle];
});    });
   compras.push({
  total: Number(document.getElementById("precioCompra").value) || 0,
  fecha: new Date(),
  productos: productosCompra
});

    alert("Compra registrada y stock actualizado");
    productosCompra = [];
    mostrarResumenCompra();

    const precioCompra = document.getElementById("precioCompra");
    if (precioCompra) precioCompra.value = "";

    renderProductos(); // refrescar stock visual
  });
}


function actualizarProductosSugerencias() {
    productos = stock.productos.map(p => `${p.id} - ${p.nombre}`);
}



function ocultarTodasLasSecciones() {
    document.querySelectorAll(".main-content section").forEach(sec => {
        sec.classList.add("oculto");
    });

    // 🔧 FIX BOTÓN PRODUCTOS
  const btnVerProductos = document.getElementById("btnVerProductos");
  const btnVerProductosText = btnVerProductos?.querySelector("span");
  const seccionProductos = document.getElementById("seccionProductos");

  if (seccionProductos?.classList.contains("oculto") && btnVerProductosText) {
    btnVerProductosText.textContent = "Productos";
  }
}

// ================= CAJA (LOCALSTORAGE) =================
const LS_CAJA = "app_caja_v1";

function normalizarVentas() {
  let ventas = JSON.parse(localStorage.getItem("ventas_v1") || "[]");

  ventas = ventas.map(v => ({
    ...v,
    total: parseMoneyAR(v.total),
    subtotal: parseMoneyAR(v.subtotal),
    fecha: (v.fecha instanceof Date) ? v.fecha : new Date(v.fecha)
  }));

  localStorage.setItem("ventas_v1", JSON.stringify(ventas));
  
}

normalizarVentas();



function moneyAR(n){
  const num = Number(n || 0);
  return num.toLocaleString("es-AR", { maximumFractionDigits: 2, minimumFractionDigits: 2 });
}

function nowStr(){
  const d = new Date();
  const pad = (x)=> String(x).padStart(2,"0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function loadCaja(){
  const raw = localStorage.getItem(LS_CAJA);
  if (!raw) {
    return {
      abierta: false,
      caja: null,
      movimientos: [],
      ultimaDiferencia: null
    };
  }
  try { return JSON.parse(raw); } catch { return { abierta:false, caja:null, movimientos:[], ultimaDiferencia:null }; }
}

function saveCaja(state){
  localStorage.setItem(LS_CAJA, JSON.stringify(state));
}

function calcSaldoEsperado(state){
  if (!state.abierta) return 0;
  return state.movimientos
    .filter(m => m.caja_id === state.caja.id)
    .reduce((acc, m) => acc + Number(m.monto), 0);
}

function badgeHTML(tipo){
  if (tipo === "VENTA") return `<span class="badge badge-success">VENTA</span>`;
  if (tipo === "INGRESO") return `<span class="badge badge-primary">INGRESO</span>`;
  return `<span class="badge badge-warning">EGRESO</span>`;
}

function renderCaja(){
  const state = loadCaja();

  const cajaAbiertaUI = document.getElementById("cajaAbiertaUI");
  const cajaCerradaUI = document.getElementById("cajaCerradaUI");
  const alertDif = document.getElementById("alertDiferencia");

  if (!cajaAbiertaUI || !cajaCerradaUI) return;

  if (state.abierta && state.caja) {
    cajaCerradaUI.classList.add("oculto");
    cajaAbiertaUI.classList.remove("oculto");

    document.getElementById("cajaIdTxt").textContent = state.caja.id;
    document.getElementById("cajaAbiertaEnTxt").textContent = state.caja.abierta_en;

    const saldo = calcSaldoEsperado(state);
    document.getElementById("saldoEsperadoTxt").textContent = moneyAR(saldo);

    // tabla movimientos (máx 50)
    const body = document.getElementById("tablaMovimientosBody");
    const movs = state.movimientos
      .filter(m => m.caja_id === state.caja.id)
      .slice()
      .sort((a,b)=> b.id - a.id)
      .slice(0, 50);

    body.innerHTML = "";
    if (!movs.length){
      body.innerHTML = `
        <tr>
          <td colspan="5" class="text-center small-muted" style="padding:18px;">Sin movimientos todavía.</td>
        </tr>`;
      return;
    }

    movs.forEach(m=>{
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="small-muted">${m.fecha}</td>
        <td>${badgeHTML(m.tipo)}</td>
        <td>${m.descripcion || ""}</td>
        <td class="text-end fw-600">$${moneyAR(m.monto)}</td>
        <td class="small-muted">${m.medio_pago || "-"}</td>
      `;
      body.appendChild(tr);
    });

  } else {
    cajaAbiertaUI.classList.add("oculto");
    cajaCerradaUI.classList.remove("oculto");

    if (state.ultimaDiferencia !== null && alertDif) {
      alertDif.classList.remove("oculto");
      alertDif.innerHTML = `Diferencia del último cierre: <b>$${moneyAR(state.ultimaDiferencia)}</b> (contado - esperado)`;
    } else if (alertDif) {
      alertDif.classList.add("oculto");
      alertDif.innerHTML = "";
    }
  }
}

// Abrir caja
const formAbrirCaja = document.getElementById("formAbrirCaja");
if (formAbrirCaja){
  formAbrirCaja.addEventListener("submit", (e)=>{
    e.preventDefault();
    const state = loadCaja();
    if (state.abierta) return alert("La caja ya está abierta.");

    const montoInicial = Number(document.getElementById("montoInicial").value || 0);

    const cajaId = Date.now(); // id simple
    state.abierta = true;
    state.caja = { id: cajaId, abierta_en: nowStr(), monto_inicial: montoInicial };
    state.movimientos = state.movimientos || [];

    // movimiento apertura
    state.movimientos.push({
      id: Date.now(),
      caja_id: cajaId,
      fecha: nowStr(),
      tipo: "INGRESO",
      descripcion: "Apertura de caja",
      monto: montoInicial,
      medio_pago: "EFECTIVO",
    });

    saveCaja(state);
    renderCaja();
  });
}

// Movimiento manual
const formMovCaja = document.getElementById("formMovCaja");
if (formMovCaja){
  formMovCaja.addEventListener("submit", (e)=>{
    e.preventDefault();
    const state = loadCaja();
    if (!state.abierta || !state.caja) return alert("Primero abrí la caja.");

    const tipo = document.getElementById("movTipo").value; // INGRESO | EGRESO
    const medio = document.getElementById("movMedioPago").value;
    const desc = document.getElementById("movDesc").value.trim();
    const montoRaw = Number(document.getElementById("movMonto").value || 0);

    // 👉 Pago de Cuenta Corriente
if (tipo === "INGRESO" && chkPagoCC?.checked) {
  if (!clienteIdSeleccionado) {
    alert("Seleccioná un cliente de Cuenta Corriente");
    return;
  }

  cc_addPago(
    clienteIdSeleccionado,
    montoRaw,
    medio,
    desc || "Pago cuenta corriente"
  );
}

    if (montoRaw <= 0) return alert("Monto inválido.");

    const signed = (tipo === "INGRESO") ? montoRaw : -montoRaw;

    state.movimientos.push({
      id: Date.now(),
      caja_id: state.caja.id,
      fecha: nowStr(),
      tipo,
      descripcion: desc,
      monto: signed,
      medio_pago: medio
    });

    // 👉 Si es un INGRESO y corresponde a Cuenta Corriente
if (tipo === "INGRESO" && window.esPagoCuentaCorriente === true) {
  cc_addPago(
    window.clienteIdSeleccionado,
    montoRaw,
    medio,
    desc || "Pago cuenta corriente"
  );
}
    saveCaja(state);

    // limpiar
    document.getElementById("movDesc").value = "";
    document.getElementById("movMonto").value = "";
    renderCaja();
  });
}

// Cerrar caja
const formCerrarCaja = document.getElementById("formCerrarCaja");
if (formCerrarCaja){
  formCerrarCaja.addEventListener("submit", (e)=>{
    e.preventDefault();
    if (!confirm("Cerrar caja?")) return;

    const state = loadCaja();
    if (!state.abierta || !state.caja) return alert("La caja ya está cerrada.");

    const contado = Number(document.getElementById("cierreContado").value || 0);
    const obs = document.getElementById("cierreObs").value.trim();

    const saldo = calcSaldoEsperado(state);
    state.ultimaDiferencia = contado - saldo;

    // marcamos caja cerrada (solo info)
    state.caja.cerrada_en = nowStr();
    state.caja.monto_contado_cierre = contado;
    state.caja.observacion = obs;

    // cerramos
    state.abierta = false;
    state.caja = null;

    saveCaja(state);

    // limpiar form
    document.getElementById("cierreContado").value = "";
    document.getElementById("cierreObs").value = "";

    renderCaja();
  });
}

// Mostrar sección caja desde el menú
const btnCaja = document.getElementById("btnCaja");
const seccionCaja = document.getElementById("seccionCaja");
if (btnCaja && seccionCaja){
  btnCaja.addEventListener("click", ()=>{
    ocultarTodasLasSecciones();
    seccionCaja.classList.remove("oculto");
    renderCaja();
  });
}

// Render al cargar (por si quedó abierta)
document.addEventListener("DOMContentLoaded", () => {
  // no muestro la sección automáticamente, pero dejo el render listo
  renderCaja();
});

const btnReportes = document.getElementById("btnReportes");
const seccionReportes = document.getElementById("seccionReportes");
const selectModoReporte = document.getElementById("selectModoReporte");
const btnVerReporte = document.getElementById("btnVerReporte");


btnReportes?.addEventListener("click", () => {
  ocultarTodasLasSecciones();
  seccionReportes.classList.remove("oculto");
  cargarReporte(selectModoReporte.value);
});

btnVerReporte?.addEventListener("click", () => {
  cargarReporte(selectModoReporte.value);
});


const API_BASE = "http://127.0.0.1:3000";

function pad2(n){ return String(n).padStart(2,"0"); }
function ymd(d){ return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`; }

function startOfDay(d){
  const x = new Date(d); x.setHours(0,0,0,0); return x;
}
function startOfWeek(d){
  const x = startOfDay(d);
  const day = (x.getDay() + 6) % 7; // lunes=0
  x.setDate(x.getDate() - day);
  return x;
}
function startOfMonth(d){
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function addDays(d, n){
  const x = new Date(d); x.setDate(x.getDate()+n); return x;
}

function inRange(dateObj, inicio, fin){
  const d = (dateObj instanceof Date) ? dateObj : new Date(dateObj);
  if (isNaN(d.getTime())) return false; // si viene mal, no rompe
  return d >= inicio && d < fin;
}


function parseMoneyAR(valor) {
  if (typeof valor === "number") return valor;
  return Number(
    valor
      .toString()
      .replace(/\./g, "") // quita separador de miles
      .replace(",", ".")  // coma decimal
  );
}

function cargarReporte(modo){
  // 1) rango
  const hoy = new Date();
  let inicio, fin, titulo;

  if (modo === "semana"){
    inicio = startOfWeek(hoy);
    fin = addDays(inicio, 7);
    titulo = `Semana (${ymd(inicio)} a ${ymd(addDays(fin,-1))})`;
  } else if (modo === "mes"){
    inicio = startOfMonth(hoy);
    fin = new Date(inicio.getFullYear(), inicio.getMonth()+1, 1);
    titulo = `Mes (${ymd(inicio).slice(0,7)})`;
  } else {
    inicio = startOfDay(hoy);
    fin = addDays(inicio, 1);
    titulo = `Día (${ymd(inicio)})`;
  }

  // 2) filtrar ventas/compras dentro del rango
  const ventasRango  = (ventas  || []).filter(v => inRange(v.fecha, inicio, fin));
  const comprasRango = (compras || []).filter(c => inRange(c.fecha, inicio, fin));

  // 3) resumen ventas
  const cant_ventas = ventasRango.length;
  const total_vendido = ventasRango.reduce(
    (acc, v) => acc + parseMoneyAR(v.total || 0),
    0
  );

  // 3.b) resumen compras
  const cant_compras = comprasRango.length;
  const total_comprado = comprasRango.reduce(
    (acc, c) => acc + parseMoneyAR(c.total || 0),
    0
  );

  // 3.c) resultado
  const resultado = total_vendido - total_comprado;

  // 4) top variantes (nombre + talle) por unidades
  const map = new Map();
  ventasRango.forEach(v=>{
    (v.productos || []).forEach(p=>{
      const key = `${p.nombre}__${p.talle}`;
      const prev = map.get(key) || { nombre: p.nombre, talle: p.talle, unidades: 0 };
      prev.unidades += Number(p.cantidad || 0);
      map.set(key, prev);
    });
  });

  const top = Array.from(map.values())
    .sort((a,b)=> b.unidades - a.unidades)
    .slice(0,10);

  // 5) pintar UI
  document.getElementById("reporteTitulo").innerText = titulo;

  document.getElementById("repCantVentas").innerText = cant_ventas;
  document.getElementById("repTotalVendido").innerText =
    `$${total_vendido.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`;

  document.getElementById("repCantCompras").innerText = cant_compras;
  document.getElementById("repTotalComprado").innerText =
    `$${total_comprado.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`;

  document.getElementById("repGanancia").innerText =
    `${resultado >= 0 ? "$" : "-$"}${Math.abs(resultado).toLocaleString("es-AR", { maximumFractionDigits: 0 })}`;

  const tbody = document.getElementById("repTopBody");
  tbody.innerHTML = "";

  if(!top.length){
    tbody.innerHTML = `<tr><td colspan="3" class="text-center small-muted" style="padding:18px;">Sin datos todavía.</td></tr>`;
    return;
  }

  top.forEach(t=>{
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><b>${t.nombre}</b></td>
      <td class="small-muted">${t.talle}</td>
      <td class="text-end"><b>${t.unidades}</b></td>
    `;
    tbody.appendChild(tr);
  });
}
document.getElementById("btnResetReportes")?.addEventListener("click", resetearReportes);
document.getElementById("btnResetCaja")
  ?.addEventListener("click", resetearCaja);

// ================= REPORTES: VENDIDO vs COMPRADO =================

function parseMoney(value) {
  // acepta number o string con miles: "12.345" o "$12.345"
  if (typeof value === "number") return value;
  if (!value) return 0;
  const limpio = String(value).replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
  const n = Number(limpio);
  return Number.isFinite(n) ? n : 0;
}

function formatMoney(n) {
  return n.toLocaleString("es-AR", { maximumFractionDigits: 0 });
}

function inicioSemana(date) {
  // semana lunes->domingo (Argentina)
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // lunes=0 ... domingo=6
  d.setHours(0,0,0,0);
  d.setDate(d.getDate() - day);
  return d;
}

function mismaSemana(a, b) {
  const ia = inicioSemana(a).getTime();
  const ib = inicioSemana(b).getTime();
  return ia === ib;
}

function mismoDia(a, b) {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth() === b.getMonth() &&
         a.getDate() === b.getDate();
}

function mismoMes(a, b) {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth() === b.getMonth();
}

function filtrarPorModo(arr, modo, refDate) {
  return arr.filter(x => {
    const f = x?.fecha ? new Date(x.fecha) : null;
    if (!f || isNaN(f)) return false;

    if (modo === "dia") return mismoDia(f, refDate);
    if (modo === "semana") return mismaSemana(f, refDate);
    if (modo === "mes") return mismoMes(f, refDate);
    return true;
  });
}
  
function resetearReportes() {
  const ok = confirm(
    "¿Borrar TODAS las ventas y compras y reiniciar reportes?\n\n" +
    "- Ventas (ventas_v1)\n" +
    "- Compras (compras_v1)\n"
  );
  if (!ok) return;

  localStorage.removeItem("ventas_v1");
  localStorage.removeItem("compras_v1"); 

  ventas = [];
  compras = []; 

  if (typeof cargarReporte === "function") {
    cargarReporte(document.getElementById("selectModoReporte")?.value || "dia");
  }
}


function resetearCaja() {
  if (!confirm("¿Borrar TODA la información de la caja y empezar de cero?")) return;

  localStorage.removeItem("app_caja_v1");

  // volver a estado inicial en memoria
  const estadoInicial = {
    abierta: false,
    caja: null,
    movimientos: [],
    ultimaDiferencia: null
  };

  localStorage.setItem("app_caja_v1", JSON.stringify(estadoInicial));

  renderCaja();
}

function registrarVentaEnCaja(venta) {
  const state = loadCaja();

  // Si no hay caja abierta, no impacta
  if (!state.abierta || !state.caja) return;

  state.movimientos.push({
    id: Date.now(),
    caja_id: state.caja.id,
    fecha: nowStr(),
    tipo: "VENTA",
    descripcion: `Venta #${venta.id} - ${venta.cliente}`,
    monto: Number(venta.total),
    medio_pago: venta.formaPago.toUpperCase()
  });

  saveCaja(state);
}

/* ================= DASHBOARD ================= */

function formatARSinDec(n){
  return `$${Number(n||0).toLocaleString("es-AR", { maximumFractionDigits: 0 })}`;
}
function safeDate(d){
  const x = (d instanceof Date) ? d : new Date(d);
  return isNaN(x.getTime()) ? new Date() : x;
}

function loadVentasSafe(){
  let ventas = JSON.parse(localStorage.getItem("ventas_v1") || "[]");
  return ventas.map(v => ({
    ...v,
    total: parseMoneyAR(v.total || 0),
    subtotal: parseMoneyAR(v.subtotal || 0),
    fecha: safeDate(v.fecha)
  }));
}

function loadCajaSafe(){
  const state = loadCaja();
  state.movimientos = (state.movimientos || []).map(m => ({
    ...m,
    monto: Number(m.monto || 0),
    fecha: m.fecha || ""
  }));
  return state;
}

function rangoPorPeriodo(periodo){
  const hoy = new Date();
  let inicio, fin, label;

  if (periodo === "dia"){
    inicio = startOfDay(hoy);
    fin = addDays(inicio, 1);
    label = `Día (${ymd(inicio)})`;
  } else if (periodo === "semana"){
    inicio = startOfWeek(hoy);
    fin = addDays(inicio, 7);
    label = `Semana (${ymd(inicio)} a ${ymd(addDays(fin,-1))})`;
  } else {
    inicio = startOfMonth(hoy);
    fin = new Date(inicio.getFullYear(), inicio.getMonth()+1, 1);
    label = `Mes (${ymd(inicio).slice(0,7)})`;
  }
  return {inicio, fin, label};
}

const DASH_LIMIT = 5;
const dashExpand = { mix:false, top:false, stock:false, act:false };

function setToggleState(btnId, expanded, total) {
  const btn = document.getElementById(btnId);
  if (!btn) return;

  if ((total || 0) <= DASH_LIMIT) {
    btn.classList.add("oculto");
    return;
  }
  btn.classList.remove("oculto");
  btn.textContent = expanded ? "Menos" : "Más";
}

function wireDashboardToggles() {
  const bMix = document.getElementById("dashToggleMix");
  const bTop = document.getElementById("dashToggleTop");
  const bSto = document.getElementById("dashToggleStock");
  const bAct = document.getElementById("dashToggleAct");

  bMix?.addEventListener("click", () => { dashExpand.mix = !dashExpand.mix; renderDashboard(); });
  bTop?.addEventListener("click", () => { dashExpand.top = !dashExpand.top; renderDashboard(); });
  bSto?.addEventListener("click", () => { dashExpand.stock = !dashExpand.stock; renderDashboard(); });
  bAct?.addEventListener("click", () => { dashExpand.act = !dashExpand.act; renderDashboard(); });
}

// llamalo una vez al cargar
document.addEventListener("DOMContentLoaded", wireDashboardToggles);

function renderDashboard(){
  const periodo = document.getElementById("dashPeriodo")?.value || "mes";
  const {inicio, fin, label} = rangoPorPeriodo(periodo);

  const ventas = loadVentasSafe();
  const cajaState = loadCajaSafe();

  // ---- ventas en rango
  const ventasRango = ventas.filter(v => inRange(v.fecha, inicio, fin));
  const ingresos = ventasRango.reduce((acc, v)=> acc + Number(v.total||0), 0);
  const cantVentas = ventasRango.length;
  const ticket = cantVentas ? (ingresos / cantVentas) : 0;

  // ---- egresos en rango desde caja (movimientos negativos o tipo EGRESO)
  // (tomamos TODOS los movimientos guardados, no solo la caja abierta actual)
  const movs = (cajaState.movimientos || []).slice();
  const movsRango = movs.filter(m => {
    // m.fecha es string "YYYY-MM-DD HH:mm:ss" en tu sistema
    const f = m.fecha ? new Date(m.fecha.replace(" ", "T")) : null;
    if (!f || isNaN(f.getTime())) return false;
    return inRange(f, inicio, fin);
  });

  const egresosAbs = movsRango
    .filter(m => (m.tipo === "EGRESO") || (Number(m.monto) < 0))
    .reduce((acc, m)=> acc + Math.abs(Number(m.monto||0)), 0);

  const resultado = ingresos - egresosAbs;

  // ---- estado caja actual
  const cajaAbierta = (cajaState.abierta && cajaState.caja) ? "SI" : "NO";
  const saldoEsperado = calcSaldoEsperado(cajaState);

  // ---- MIX pagos (desde ventas en rango)
  const mapPago = new Map(); // medio -> total
  ventasRango.forEach(v=>{
    const medio = (v.formaPago || "OTRO").toString().toUpperCase();
    mapPago.set(medio, (mapPago.get(medio)||0) + Number(v.total||0));
  });

  const mixArr = Array.from(mapPago.entries())
    .map(([medio, total])=>({medio, total}))
    .sort((a,b)=> b.total - a.total);

  // ---- Top productos (por ingresos y unidades)
  const prodMap = new Map(); // nombre -> {nombre, unidades, ingresos}
  ventasRango.forEach(v=>{
    (v.productos || []).forEach(p=>{
      const nombre = (p.nombre || "Sin nombre").toString();
      const unidades = Number(p.cantidad || 0);
      const ingresosP = Number(p.precio || 0) * unidades;
      const prev = prodMap.get(nombre) || {nombre, unidades:0, ingresos:0};
      prev.unidades += unidades;
      prev.ingresos += ingresosP;
      prodMap.set(nombre, prev);
    });
  });

  const topProductos = Array.from(prodMap.values())
    .sort((a,b)=> b.ingresos - a.ingresos)
    .slice(0, 10);

  // ---- Stock crítico (0 o <=2 por talle)
  const criticos = [];
  try{
    (stock?.productos || []).forEach(p=>{
      if (!p?.talles) return;
      Object.entries(p.talles).forEach(([talle, st])=>{
        const val = Number(st||0);
        if (val <= 2){
          criticos.push({nombre: p.nombre, talle, stock: val});
        }
      });
    });
  }catch(e){ /* si stock no existe, no rompe */ }

  criticos.sort((a,b)=> a.stock - b.stock);
  const alertasStock = criticos.length;

  // ---- Actividad reciente (últimos 12 movs globales)
  const movsOrdenados = movs.slice().sort((a,b)=> (b.id||0) - (a.id||0)).slice(0, 12);

  // ===== Pintar UI =====
  // KPIs
  document.getElementById("kpiIngresos").textContent = formatARSinDec(ingresos);
  document.getElementById("kpiIngresosSub").textContent = label;

  document.getElementById("kpiEgresos").textContent = formatARSinDec(egresosAbs);
  document.getElementById("kpiEgresosSub").textContent = label;

  const elRes = document.getElementById("kpiResultado");
  elRes.textContent = formatARSinDec(resultado);
  elRes.style.color = (resultado >= 0) ? "#198754" : "#dc3545";

  document.getElementById("kpiCajaEstado").textContent = cajaAbierta;
  document.getElementById("kpiCajaSaldo").textContent = formatARSinDec(saldoEsperado);

  document.getElementById("kpiCantVentas").textContent = String(cantVentas);
  document.getElementById("kpiTicket").textContent = formatARSinDec(ticket);

  document.getElementById("kpiStockAlertas").textContent = String(alertasStock);

  // MIX barras
  const totalMix = mixArr.reduce((acc, x)=> acc + x.total, 0);
  document.getElementById("mixPagoTotal").textContent = `Total: ${formatARSinDec(totalMix)}`;

  const bars = document.getElementById("mixPagoBars");
  const tbMix = document.getElementById("mixPagoTable");
  bars.innerHTML = "";
  tbMix.innerHTML = "";

  if (!mixArr.length){
    bars.innerHTML = `<div class="small-muted">Sin ventas en el período.</div>`;
    tbMix.innerHTML = `<tr><td colspan="3" class="small-muted">Sin datos</td></tr>`;
  } else {
    const mixVisible = dashExpand.mix ? mixArr : mixArr.slice(0, DASH_LIMIT);
setToggleState("dashToggleMix", dashExpand.mix, mixArr.length);
    const max = Math.max(...mixArr.map(x=> x.total));
    mixVisible.forEach(x=>{
      const pct = totalMix ? (x.total/totalMix*100) : 0;
      const w = max ? (x.total/max*100) : 0;

      const row = document.createElement("div");
      row.className = "bar-row";
      row.innerHTML = `
        <div class="bar-label">${x.medio}</div>
        <div class="bar-track"><div class="bar-fill" style="width:${w}%;"></div></div>
        <div class="bar-val">${formatARSinDec(x.total)}</div>
      `;
      bars.appendChild(row);

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${x.medio}</td>
        <td class="text-end fw-600">${formatARSinDec(x.total)}</td>
        <td class="text-end small-muted">${pct.toFixed(1)}%</td>
      `;
      tbMix.appendChild(tr);
    });
  }

  // Top productos
  const topBody = document.getElementById("topProductosBody");
  topBody.innerHTML = "";
  if (!topProductos.length){
    topBody.innerHTML = `<tr><td colspan="3" class="text-center small-muted" style="padding:18px;">Sin ventas en el período.</td></tr>`;
  } else {
    setToggleState("dashToggleTop", dashExpand.top, topProductos.length);
    const topVisible = dashExpand.top ? topProductos : topProductos.slice(0, DASH_LIMIT);

    topVisible.forEach(p=>{
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><b>${p.nombre}</b></td>
        <td class="text-end">${Number(p.unidades||0)}</td>
        <td class="text-end"><b>${formatARSinDec(p.ingresos)}</b></td>
      `;
      topBody.appendChild(tr);
    });
  }

  // Stock crítico
  const stockBody = document.getElementById("stockCriticoBody");
  stockBody.innerHTML = "";
  if (!criticos.length){
    stockBody.innerHTML = `<tr><td colspan="3" class="text-center small-muted" style="padding:18px;">Sin alertas (o no hay stock cargado).</td></tr>`;
  } else {
    setToggleState("dashToggleStock", dashExpand.stock, criticos.length);
    const critVisible = dashExpand.stock ? criticos : criticos.slice(0, DASH_LIMIT);

    critVisible.slice(0, 12).forEach(c=>{
      const badge = (c.stock === 0)
        ? `<span class="badge badge-warning">SIN</span>`
        : `<span class="badge badge-primary">BAJO</span>`;
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><b>${c.nombre}</b></td>
        <td>${badge} <span class="small-muted">${c.talle}</span></td>
        <td class="text-end fw-600">${c.stock}</td>
      `;
      stockBody.appendChild(tr);
    });
  }

  // Actividad reciente
  const actBody = document.getElementById("actividadRecienteBody");
  actBody.innerHTML = "";
  if (!movsOrdenados.length){
    actBody.innerHTML = `<tr><td colspan="5" class="text-center small-muted" style="padding:18px;">Sin movimientos todavía.</td></tr>`;
  } else {
    setToggleState("dashToggleAct", dashExpand.act, movsOrdenados.length);
    const actVisible = dashExpand.act ? movsOrdenados : movsOrdenados.slice(0, DASH_LIMIT);

    actVisible.forEach(m=>{
      const tipo = m.tipo || (m.monto >= 0 ? "INGRESO" : "EGRESO");
      const badge = (tipo==="VENTA") ? `<span class="badge badge-success">VENTA</span>`
                  : (tipo==="INGRESO") ? `<span class="badge badge-primary">INGRESO</span>`
                  : `<span class="badge badge-warning">EGRESO</span>`;
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="small-muted">${m.fecha || "-"}</td>
        <td>${badge}</td>
        <td>${m.descripcion || ""}</td>
        <td class="text-end fw-600">${formatARSinDec(m.monto)}</td>
        <td class="small-muted">${m.medio_pago || "-"}</td>
      `;
      actBody.appendChild(tr);
    });
  }
}

// Navegación Dashboard
const btnDashboard = document.getElementById("btnDashboard");
const seccionDashboard = document.getElementById("seccionDashboard");
const btnRefrescarDashboard = document.getElementById("btnRefrescarDashboard");

btnDashboard?.addEventListener("click", () => {
  ocultarTodasLasSecciones();
  seccionDashboard?.classList.remove("oculto");
  renderDashboard();
});

btnRefrescarDashboard?.addEventListener("click", () => renderDashboard());

document.getElementById("dashPeriodo")?.addEventListener("change", () => renderDashboard());

const btnResetDashboard = document.getElementById("btnResetDashboard");

function resetDashboardData() {
  const ok = confirm(
    "Esto va a borrar:\n\n- Todas las ventas (ventas_v1)\n- Toda la caja y movimientos (app_caja_v1)\n\nNO borra productos/stock.\n\n¿Confirmás?"
  );
  if (!ok) return;

  // borra datos que alimentan el dashboard
  localStorage.removeItem("ventas_v1");
  localStorage.removeItem("app_caja_v1");

  // variables en memoria (por si están cargadas)
  try { ventas = []; } catch {}
  try { carrito = []; } catch {}

  // refrescar pantallas relacionadas
  try { renderCarrito(); } catch {}
  try { renderCaja(); } catch {}
  try { renderDashboard(); } catch {}
}

btnResetDashboard?.addEventListener("click", resetDashboardData);


// Formato genérico: 3-3-4 (y si es más largo, sigue agrupando de a 3)
function formatearTelefono(digits) {
  // digits = solo números
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return digits.replace(/(\d{3})(\d+)/, "$1 $2");
  if (digits.length <= 10) return digits.replace(/(\d{3})(\d{3})(\d+)/, "$1 $2 $3");

  // si pasa de 10, queda: 3 3 4 y el resto de a 3
  const base = digits.slice(0, 10).replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3");
  const rest = digits.slice(10).match(/\d{1,3}/g)?.join(" ") || "";
  return rest ? `${base} ${rest}` : base;
}

inputTelefono.addEventListener("input", () => {
  // 1) guardar cursor (opcional, simple)
  const start = inputTelefono.selectionStart;

  // 2) limpiar a solo números
  let digits = inputTelefono.value.replace(/\D/g, "");

  // 3) limitar (opcional) a 15 dígitos
  digits = digits.slice(0, 15);

  // 4) aplicar formato
  const formatted = formatearTelefono(digits);
  inputTelefono.value = formatted;

  // 5) reacomodar cursor (simple)
  if (start !== null) inputTelefono.setSelectionRange(inputTelefono.value.length, inputTelefono.value.length);
});

function telefonoMinimoOk(min = 8) {
  const digits = inputTelefono.value.replace(/\D/g, "");
  return digits.length >= min;
}

/* ================= LOGIN GATE (FRONT ONLY) =================*/
(() => {
  const LS_AUTH = "auth_ok_v1";           
  const LS_LOCK = "auth_lock_v1";        
  const MAX_ATTEMPTS = 5;
  const LOCK_MINUTES = 10;

 
  const ADMIN_USER = "admin123";

  const SALT_B64 = "bmV3ZWxsczE5NzQ=";

  const STORED_HASH_B64 = "eMjNMWQ/MkHUv9u/bLsBZ0WHOgITcDTWL5iR3WuYQ/8=";

  const gate = document.getElementById("loginGate");
  const appRoot = document.getElementById("appRoot");
  const userEl = document.getElementById("loginUser");
  const passEl = document.getElementById("loginPass");
  const errEl = document.getElementById("loginError");
  const infoEl = document.getElementById("loginInfo");
  const btnLogin = document.getElementById("btnLogin");
  const btnLogout = document.getElementById("btnLogout");
  const user = loginUser.value.trim();
  const pass = loginPass.value.trim();
  const togglePass = document.getElementById("togglePass");

if (togglePass && passEl) {
  togglePass.addEventListener("click", () => {
    const isVisible = togglePass.dataset.visible === "true";

    passEl.type = isVisible ? "password" : "text";
    togglePass.dataset.visible = String(!isVisible);

    togglePass.setAttribute(
      "aria-label",
      isVisible ? "Mostrar contraseña" : "Ocultar contraseña"
    );
  });
}


  if (!gate || !appRoot || !userEl || !passEl || !btnLogin) return;

  function setLockedUI(locked){
    if (locked){
      gate.style.display = "grid";
      appRoot.classList.add("app-locked");
    } else {
      gate.style.display = "none";
      appRoot.classList.remove("app-locked");
    }
  }

  const role = sessionStorage.getItem("auth_role_v1");

if (role === "empleado") {
  document.body.classList.add("modo-empleado");
} else {
  document.body.classList.remove("modo-empleado");
}

  function getLockState(){
    try { return JSON.parse(localStorage.getItem(LS_LOCK) || "null"); }
    catch { return null; }
  }

  function setLockState(state){
    localStorage.setItem(LS_LOCK, JSON.stringify(state));
  }

  function clearError(){ errEl.textContent = ""; }
  function setError(msg){ errEl.textContent = msg; }

  function remainingLockMs(){
    const st = getLockState();
    if (!st || !st.lockUntil) return 0;
    const ms = st.lockUntil - Date.now();
    return ms > 0 ? ms : 0;
  }

  function renderLockInfo(){
    const ms = remainingLockMs();
    if (ms <= 0){
      infoEl.textContent = "";
      btnLogin.disabled = false;
      return;
    }
    const sec = Math.ceil(ms / 1000);
    const min = Math.floor(sec / 60);
    const rem = sec % 60;
    infoEl.textContent = `Bloqueado: ${min}:${String(rem).padStart(2,"0")}`;
    btnLogin.disabled = true;
  }

  async function pbkdf2HashB64(message, saltB64, iterations = 210000){
    const enc = new TextEncoder();
    const salt = Uint8Array.from(atob(saltB64), c => c.charCodeAt(0));

    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      enc.encode(message),
      { name: "PBKDF2" },
      false,
      ["deriveBits"]
    );

    const bits = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt,
        iterations,
        hash: "SHA-256",
      },
      keyMaterial,
      256
    );

    const bytes = new Uint8Array(bits);
    let bin = "";
    bytes.forEach(b => bin += String.fromCharCode(b));
    return btoa(bin);
  }

  // 🔧 Usalo 1 vez para generar el hash real y pegarlo en STORED_HASH_B64
  // En consola: generateHashForAdmin("admin", "TuClaveSuperFuerte")
  window.generateHashForAdmin = async (user = ADMIN_USER, pass = "cambiar_esto") => {
    const msg = `${user}:${pass}`;
    const hash = await pbkdf2HashB64(msg, SALT_B64);
    console.log("SALT_B64:", SALT_B64);
    console.log("HASH_BASE64:", hash);
    return hash;
  };

  async function verifyLogin(){
    if (togglePass) {
        passEl.type = "password";
        togglePass.dataset.visible = "false";
    }

    clearError();

    // lock?
    renderLockInfo();
    if (remainingLockMs() > 0){
      setError("Demasiados intentos. Esperá y probá de nuevo.");
      return false;
    }

    const user = userEl.value.trim();
    const pass = passEl.value;

    if (!user || !pass){
      setError("Completá usuario y contraseña.");
      return false;
    }

    // hash compare
    const msg = `${user}:${pass}`;
    const got = await pbkdf2HashB64(msg, SALT_B64);

    if (user === ADMIN_USER && got === STORED_HASH_B64){
      // ok
      sessionStorage.setItem(LS_AUTH, "1");
      localStorage.removeItem(LS_LOCK);
      btnLogout.classList.remove("oculto");
      return true;
    }

    // fail -> attempts
    const st = getLockState() || { attempts: 0, lockUntil: 0 };
    st.attempts = (st.attempts || 0) + 1;

    if (st.attempts >= MAX_ATTEMPTS){
      st.lockUntil = Date.now() + LOCK_MINUTES * 60 * 1000;
      setError(`Bloqueado ${LOCK_MINUTES} minutos por seguridad.`);
    } else {
      setError(`Datos incorrectos. Intentos: ${st.attempts}/${MAX_ATTEMPTS}`);
    }

    setLockState(st);
    renderLockInfo();
    return false;
  }

  function logout(){
    sessionStorage.removeItem(LS_AUTH);
    setLockedUI(true);
    userEl.value = "";
    passEl.value = "";
    btnLogout.classList.add("oculto");
    userEl.focus();
  }

  btnLogin.addEventListener("click", () => {
  const user = loginUser.value.trim();
  const pass = loginPass.value.trim();

  // ADMIN
  if (user === "admin" && pass === "admin123") {
    sessionStorage.setItem("auth_ok_v1", "1");
    sessionStorage.setItem("auth_role_v1", "admin");
    location.reload();
    return;
  }

  // EMPLEADO
  if (user === "empleado" && pass === "1234") {
    sessionStorage.setItem("auth_ok_v1", "1");
    sessionStorage.setItem("auth_role_v1", "empleado");
    location.reload();
    return;
  }

  loginError.textContent = "Usuario o contraseña incorrectos";
});

  // Enter para entrar
  [userEl, passEl].forEach(el => {
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter") btnLogin.click();
    });
  });

  btnLogout?.addEventListener("click", logout);

  // init
  const ok = sessionStorage.getItem(LS_AUTH) === "1";
  setLockedUI(!ok);
  if (!ok) userEl.focus();

  // refrescar lock timer
  setInterval(renderLockInfo, 500);
  renderLockInfo();
})();

/* =========================================================
   CAMBIOS / DEVOLUCIONES PRO (DEVUELVE + SE LLEVA + DIFERENCIA)
   ========================================================= */

const LS_CDEV = "cambios_devoluciones_v2";
const LS_GC   = "giftcards_v1"; // si ya lo tenías, dejalo igual

function loadArr(key){ try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; } }
function saveArr(key, arr){ localStorage.setItem(key, JSON.stringify(arr)); }

function toUpperSafe(x){ return (x||"").toString().trim().toUpperCase(); }
function randCode(len=8){
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let out = "";
  for(let i=0;i<len;i++) out += chars[Math.floor(Math.random()*chars.length)];
  return out;
}

function getPrecioVentaProducto(p){
  const n = Number(p?.precio);
  return Number.isFinite(n) ? n : 0;
}

function calcTotal(precioUnit, cantidad){
  const p = Number(precioUnit || 0);
  const c = Number(cantidad || 0);
  return (Number.isFinite(p) ? p : 0) * (Number.isFinite(c) ? c : 0);
}

function cerrarSugerenciasSiClickAfuera(inputId, listId){
  document.addEventListener("click", (e)=>{
    const input = document.getElementById(inputId);
    const list  = document.getElementById(listId);
    if (!input || !list) return;
    if (!e.target.closest("#"+inputId) && !e.target.closest("#"+listId)){
      list.classList.add("oculto");
    }
  });
}

function setupBuscadorProductos(inputId, listId, onSelect){
  const input = document.getElementById(inputId);
  const list  = document.getElementById(listId);
  if (!input || !list) return;

  input.addEventListener("input", ()=>{
    const txt = input.value.toLowerCase().trim();
    list.innerHTML = "";
    if (!txt){ list.classList.add("oculto"); return; }

    const coincidencias = (stock?.productos || [])
      .filter(p => (p.nombre||"").toLowerCase().includes(txt) || String(p.id||"").toLowerCase().includes(txt))
      .slice(0, 12);

    coincidencias.forEach(p=>{
      const li = document.createElement("li");
      li.textContent = `${p.id} - ${p.nombre}`;
      li.addEventListener("click", ()=>{
        input.value = `${p.id} - ${p.nombre}`;
        list.classList.add("oculto");
        onSelect(p);
      });
      list.appendChild(li);
    });

    list.classList.toggle("oculto", coincidencias.length === 0);
  });

  cerrarSugerenciasSiClickAfuera(inputId, listId);
}

/* ========= refs ========= */
let devSel = null;
let newSel = null;

const cdTipo = document.getElementById("cdTipo");

// Devuelve
const cdDevBuscarProd = document.getElementById("cdDevBuscarProd");
const cdDevTalle      = document.getElementById("cdDevTalle");
const cdDevCantidad   = document.getElementById("cdDevCantidad");
const cdDevPrecio     = document.getElementById("cdDevPrecio");

// Se lleva
const cdSeLlevaBox    = document.getElementById("cdSeLlevaBox");
const cdNewBuscarProd = document.getElementById("cdNewBuscarProd");
const cdNewTalle      = document.getElementById("cdNewTalle");
const cdNewCantidad   = document.getElementById("cdNewCantidad");
const cdNewPrecio     = document.getElementById("cdNewPrecio");

// Diferencia UI
const cdResumen         = document.getElementById("cdResumen");
const cdAccionesDinero  = document.getElementById("cdAccionesDinero");
const cdEtiquetaAccion  = document.getElementById("cdEtiquetaAccion");
const cdModoDiferencia  = document.getElementById("cdModoDiferencia");
const cdMedioPagoDif    = document.getElementById("cdMedioPagoDif");
const cdNotaMedio       = document.getElementById("cdNotaMedio");

const cdMotivo = document.getElementById("cdMotivo");
const btnRegistrarCambioDev = document.getElementById("btnRegistrarCambioDev");

/* ========= setup buscadores ========= */
setupBuscadorProductos("cdDevBuscarProd", "cdDevSugerencias", (p)=>{
  devSel = p;
  cdDevPrecio.value = getPrecioVentaProducto(p);

  cargarTallesEnSelect(cdDevTalle, devSel);
  cdDevTalle.value = ""; // reset

  recalcularDiferencia();
});

setupBuscadorProductos("cdNewBuscarProd", "cdNewSugerencias", (p) => {
  newSel = p;

  cdNewPrecio.value = getPrecioVentaProducto(p);

  cargarTallesEnSelect(cdNewTalle, newSel);
  cdNewTalle.value = "";

  recalcularDiferencia();
});

/* ========= helpers de modo ========= */
function esCambio(){
  return cdTipo?.value === "CAMBIO";
}

function setUIporTipo(){
  const cambio = esCambio();
  if (cdSeLlevaBox) cdSeLlevaBox.style.opacity = cambio ? "1" : "0.45";
  if (cdNewBuscarProd) cdNewBuscarProd.disabled = !cambio;
  if (cdNewTalle) cdNewTalle.disabled = !cambio;
  if (cdNewCantidad) cdNewCantidad.disabled = !cambio;

  if (!cambio){
    // limpiar selección de "se lleva"
    newSel = null;
    if (cdNewBuscarProd) cdNewBuscarProd.value = "";
    if (cdNewTalle) cdNewTalle.value = "";
    if (cdNewCantidad) cdNewCantidad.value = 1;
    if (cdNewPrecio) cdNewPrecio.value = "";
  }
  recalcularDiferencia();
}

cdTipo?.addEventListener("change", setUIporTipo);
cdDevTalle?.addEventListener("change", recalcularDiferencia);
cdDevCantidad?.addEventListener("input", recalcularDiferencia);
cdNewTalle?.addEventListener("change", recalcularDiferencia);
cdNewCantidad?.addEventListener("input", recalcularDiferencia);
cdModoDiferencia?.addEventListener("change", ()=>{
  // notita según modo
  if (cdModoDiferencia.value === "GIFTCARD"){
    cdNotaMedio.textContent = "Con Gift Card no sale plata de la caja (queda saldo a favor del cliente).";
  } else {
    cdNotaMedio.textContent = "";
  }
});

function ordenarTalles(keys = []) {
  // orden: numéricos primero (38, 40, 1, 2...), luego textos (S, M, XL, UNICO...)
  return [...keys].sort((a, b) => {
    const an = Number(a), bn = Number(b);
    const aNum = Number.isFinite(an) && String(an) === String(a);
    const bNum = Number.isFinite(bn) && String(bn) === String(b);
    if (aNum && bNum) return an - bn;
    if (aNum && !bNum) return -1;
    if (!aNum && bNum) return 1;
    return String(a).localeCompare(String(b));
  });
}

function cargarTallesEnSelect(selectEl, producto) {
  if (!selectEl) return;

  const talles = producto?.talles ? Object.keys(producto.talles) : [];
  const ordenados = ordenarTalles(talles);

  selectEl.innerHTML = `<option value="">Elegir talle</option>`;
  ordenados.forEach(t => {
    const op = document.createElement("option");
    op.value = t;
    op.textContent = t;
    selectEl.appendChild(op);
  });
}

/* =========================
   CUENTA CORRIENTE (v1)
   ========================= */
const LS_CC = "cuenta_corriente_v1";

// helpers
function cc_load(){ try { return JSON.parse(localStorage.getItem(LS_CC) || "[]"); } catch { return []; } }
function cc_save(arr){ localStorage.setItem(LS_CC, JSON.stringify(arr)); }

function cc_findById(id){
  return cc_load().find(c => c.id === id);
}

function cc_upsertCliente({ id=null, nombre="", dni="", tel="", email="" }){
  const arr = cc_load();
  let c = arr.find(x => x.id === id) || arr.find(x => dni && x.dni === dni) || null;

  if(!c){
    c = { id: Date.now(), nombre, dni, tel, email, movimientos: [] };
    arr.push(c);
  } else {
    // actualiza datos si vinieron
    c.nombre = nombre || c.nombre;
    c.dni    = dni    || c.dni;
    c.tel    = tel    || c.tel;
    c.email  = email  || c.email;
    c.movimientos = c.movimientos || [];
  }
  cc_save(arr);
  return c.id;
}

function cc_saldo(cliente){
  const movs = cliente.movimientos || [];
  // CARGO suma, PAGO resta
  return movs.reduce((acc,m)=> acc + (m.tipo==="CARGO" ? m.monto : -m.monto), 0);
}

function cc_addMovimiento(clienteId, mov){
  const arr = cc_load();
  const c = arr.find(x => x.id === clienteId);
  if(!c) throw new Error("Cliente no encontrado en Cuenta Corriente");

  c.movimientos = c.movimientos || [];
  c.movimientos.unshift({
    id: Date.now(),
    fecha: new Date().toISOString(),
    tipo: mov.tipo,               // "CARGO" | "PAGO"
    monto: Number(mov.monto||0),  // siempre positivo
    desc: mov.desc || "",
    venta_id: mov.venta_id || null,
    medio_pago: mov.medio_pago || null
  });

  cc_save(arr);
  return c;
}

// Atajos
function cc_addCargo(clienteId, monto, desc, ventaId=null){
  return cc_addMovimiento(clienteId, { tipo:"CARGO", monto, desc, venta_id: ventaId });
}

function cc_addPago(clienteId, monto, medioPago, desc){
  return cc_addMovimiento(clienteId, {
    tipo: "PAGO",
    monto: Number(monto || 0),
    medio_pago: medioPago,
    desc: desc || "Pago cuenta corriente"
  });
}

// ===== UI PAGO CUENTA CORRIENTE (CAJA) =====
let clienteIdSeleccionado = null;

const chkPagoCC = document.getElementById("chkPagoCC");
const ccBuscarCliente = document.getElementById("ccBuscarCliente");
const ccSaldoTxt = document.getElementById("ccSaldoTxt");

if (chkPagoCC && ccBuscarCliente) {
  chkPagoCC.addEventListener("change", () => {
    ccBuscarCliente.disabled = !chkPagoCC.checked;
    clienteIdSeleccionado = null;
    ccSaldoTxt.innerText = "Saldo: —";
    ccBuscarCliente.value = "";
  });

  ccBuscarCliente.addEventListener("input", () => {
    const txt = ccBuscarCliente.value.toLowerCase().trim();
    if (!txt) return;

    const clientes = cc_load();
    const c = clientes.find(x =>
      (x.nombre || "").toLowerCase().includes(txt) ||
      (x.tel || "").includes(txt) ||
      (x.email || "").toLowerCase().includes(txt) ||
      (x.dni || "").includes(txt)
    );

    if (!c) return;

    clienteIdSeleccionado = c.id;
    const saldo = cc_saldo(c);
    ccSaldoTxt.innerText = `Saldo: $${saldo.toLocaleString("es-AR")}`;
  });
}

/* ========= cálculo ========= */
function recalcularDiferencia(){
  const cambio = esCambio();

  const devQty = Number(cdDevCantidad?.value || 0);
  const devPU  = Number(cdDevPrecio?.value || 0);

  const devOK = !!devSel && !!cdDevTalle?.value && devQty > 0;
  const totalDev = devOK ? calcTotal(devPU, devQty) : 0;

  if (!cambio){
    // Devolución: no hay "se lleva"
    if (!devOK){
      cdResumen.textContent = "Elegí prenda que devuelve (producto + talle + cantidad).";
      cdAccionesDinero.classList.add("oculto");
      return;
    }
    cdResumen.textContent = `Total devolución: $${moneyAR(totalDev)}. (Podés devolver dinero o emitir gift card por ese monto.)`;
    // En devolución: mostrar acciones (devolver o giftcard) si querés. Por ahora lo dejamos simple: se resuelve al registrar.
    cdAccionesDinero.classList.remove("oculto");
    cdEtiquetaAccion.textContent = "Resolver devolución";
    cdModoDiferencia.innerHTML = `
      <option value="DEVOLVER">Devolver dinero</option>
      <option value="GIFTCARD">Emitir Gift Card</option>
    `;
    if (cdModoDiferencia.value !== "GIFTCARD" && cdModoDiferencia.value !== "DEVOLVER"){
      cdModoDiferencia.value = "GIFTCARD";
    }
    return;
  }

  // Cambio: requiere prenda nueva
  const newQty = Number(cdNewCantidad?.value || 0);
  const newPU  = Number(cdNewPrecio?.value || 0);
  const newOK  = !!newSel && !!cdNewTalle?.value && newQty > 0;
  const totalNew = newOK ? calcTotal(newPU, newQty) : 0;

  if (!devOK || !newOK){
    cdResumen.textContent = "Elegí ambas prendas (devuelve y se lleva) para calcular la diferencia.";
    cdAccionesDinero.classList.add("oculto");
    return;
  }

  const diff = totalNew - totalDev; // + => cobrar | - => devolver/saldo a favor

  if (diff === 0){
    cdResumen.textContent = `Total devuelve: $${moneyAR(totalDev)} | Total se lleva: $${moneyAR(totalNew)} → Sin diferencia.`;
    cdAccionesDinero.classList.add("oculto");
    return;
  }

  cdAccionesDinero.classList.remove("oculto");

  if (diff > 0){
    cdResumen.textContent = `Devuelve: $${moneyAR(totalDev)} | Se lleva: $${moneyAR(totalNew)} → Diferencia a cobrar: $${moneyAR(diff)}.`;
    cdEtiquetaAccion.textContent = "Cobrar diferencia";
    cdModoDiferencia.innerHTML = `<option value="COBRAR">Cobrar diferencia</option>`;
    cdModoDiferencia.value = "COBRAR";
  } else {
    const favor = Math.abs(diff);
    cdResumen.textContent = `Devuelve: $${moneyAR(totalDev)} | Se lleva: $${moneyAR(totalNew)} → Saldo a favor del cliente: $${moneyAR(favor)}.`;
    cdEtiquetaAccion.textContent = "Resolver saldo a favor";
    cdModoDiferencia.innerHTML = `
      <option value="GIFTCARD">Emitir Gift Card (recomendado)</option>
      <option value="DEVOLVER">Devolver dinero</option>
    `;
    if (cdModoDiferencia.value !== "GIFTCARD" && cdModoDiferencia.value !== "DEVOLVER"){
      cdModoDiferencia.value = "GIFTCARD";
    }
  }
}

/* ========= registrar ========= */
btnRegistrarCambioDev?.addEventListener("click", ()=>{
  const cambio = esCambio();

  // valida devuelve
  if (!devSel) return alert("Seleccioná el producto que devuelve.");
  const devTalle = cdDevTalle.value;
  const devQty = Number(cdDevCantidad.value || 0);
  if (!devTalle) return alert("Elegí talle en 'devuelve'.");
  if (!Number.isInteger(devQty) || devQty <= 0) return alert("Cantidad inválida en 'devuelve'.");

  const devPU = Number(cdDevPrecio.value || 0);
  const totalDev = calcTotal(devPU, devQty);

  // stock devuelve (siempre suma)
  if (!devSel.talles || devSel.talles[devTalle] === undefined) return alert("Talle inválido en producto devuelto.");
  devSel.talles[devTalle] += devQty;

  // si cambio, valida se lleva y descuenta stock
  let newTalle = null, newQty = 0, newPU = 0, totalNew = 0;
  if (cambio){
    if (!newSel) return alert("Seleccioná el producto que se lleva.");
    newTalle = cdNewTalle.value;
    newQty = Number(cdNewCantidad.value || 0);
    if (!newTalle) return alert("Elegí talle en 'se lleva'.");
    if (!Number.isInteger(newQty) || newQty <= 0) return alert("Cantidad inválida en 'se lleva'.");

    if (!newSel.talles || newSel.talles[newTalle] === undefined) return alert("Talle inválido en producto nuevo.");

    // chequeo stock suficiente
    if (newSel.talles[newTalle] < newQty){
      return alert(`No hay stock suficiente del producto nuevo (${newSel.nombre} talle ${newTalle}).`);
    }

    newPU = Number(cdNewPrecio.value || 0);
    totalNew = calcTotal(newPU, newQty);

    // descuenta stock de lo que se lleva
    newSel.talles[newTalle] -= newQty;
  }

  // resolver caja / giftcard
  if (typeof loadCaja !== "function") {
  alert("Sistema de caja no disponible.");
  return;
}
const state = loadCaja();

  const cajaAbierta = !!(state && state.abierta && state.caja);

  // diff (+ cobrar / - devolver / 0 nada)
  const diff = cambio ? (totalNew - totalDev) : (-totalDev); 
  // Para devolución: consideramos "saldo a favor" = totalDev (para resolver con devolver o giftcard)

  const modo = cdModoDiferencia?.value || (cambio ? "COBRAR" : "GIFTCARD");
  const medio = cdMedioPagoDif?.value || "EFECTIVO";

  let resolucion = null;

  if (!cambio){
    // DEVOLUCION: totalDev a favor del cliente
    if (totalDev <= 0) return alert("Total devolución inválido.");

    if (modo === "DEVOLVER"){
      // egreso en caja
      if (!cajaAbierta){
        alert("Caja cerrada: se registró la devolución y stock, pero NO impactó en caja.");
      } else {
        state.movimientos.push({
          id: Date.now(),
          caja_id: state.caja.id,
          fecha: nowStr(),
          tipo: "EGRESO",
          descripcion: `Devolución - ${devSel.nombre} (${devTalle}) x${devQty}`,
          monto: -Math.abs(totalDev),
          medio_pago: medio
        });
        saveCaja(state);
        try { renderCaja(); } catch {}
      }
      resolucion = { tipo: "DEVOLVER_DINERO", monto: totalDev, medio };
    } else {
      // GIFTCARD (no mueve caja)
      const codigo = `GC-${randCode(8)}`;
      const gcs = loadArr(LS_GC);
      gcs.push({
        id: Date.now(),
        codigo,
        saldo: totalDev,
        emitida_en: nowStr(),
        nombre: "",
        medio_pago: "AJUSTE",
        movimientos: [{ fecha: nowStr(), tipo: "EMITIDA_POR_DEVOLUCION", monto: totalDev }]
      });
      saveArr(LS_GC, gcs);
      resolucion = { tipo: "GIFTCARD", monto: totalDev, codigo };
      alert(` Gift Card emitida: ${codigo} | Saldo: $${moneyAR(totalDev)}`);
    }
  } else {
    // CAMBIO
    if (diff > 0){
      // cobrar diferencia (ingreso)
      if (!cajaAbierta){
        alert("Caja cerrada: se registró el cambio y stock, pero NO impactó en caja (diferencia a cobrar pendiente).");
      } else {
        state.movimientos.push({
          id: Date.now(),
          caja_id: state.caja.id,
          fecha: nowStr(),
          tipo: "INGRESO",
          descripcion: `Diferencia cambio - ${devSel.nombre} → ${newSel.nombre}`,
          monto: Math.abs(diff),
          medio_pago: medio
        });
        saveCaja(state);
        try { renderCaja(); } catch {}
      }
      resolucion = { tipo: "COBRO_DIFERENCIA", monto: diff, medio };
    } else if (diff < 0){
      const favor = Math.abs(diff);
      if (modo === "DEVOLVER"){
        // devolver dinero (egreso)
        if (!cajaAbierta){
          alert("Caja cerrada: se registró el cambio y stock, pero NO impactó en caja (devolución pendiente).");
        } else {
          state.movimientos.push({
            id: Date.now(),
            caja_id: state.caja.id,
            fecha: nowStr(),
            tipo: "EGRESO",
            descripcion: `Devolución diferencia cambio - ${devSel.nombre} → ${newSel.nombre}`,
            monto: -Math.abs(favor),
            medio_pago: medio
          });
          saveCaja(state);
          try { renderCaja(); } catch {}
        }
        resolucion = { tipo: "DEVOLVER_DIFERENCIA", monto: favor, medio };
      } else {
        // gift card (no mueve caja)
        const codigo = `GC-${randCode(8)}`;
        const gcs = loadArr(LS_GC);
        gcs.push({
          id: Date.now(),
          codigo,
          saldo: favor,
          emitida_en: nowStr(),
          nombre: "",
          medio_pago: "AJUSTE",
          movimientos: [{ fecha: nowStr(), tipo: "EMITIDA_POR_DIFERENCIA_CAMBIO", monto: favor }]
        });
        saveArr(LS_GC, gcs);
        resolucion = { tipo: "GIFTCARD_DIFERENCIA", monto: favor, codigo };
        alert(` Gift Card emitida: ${codigo} | Saldo: $${moneyAR(favor)}`);
      }
    } else {
      resolucion = { tipo: "SIN_DIFERENCIA" };
    }
  }

  // guardar registro
  const arr = loadArr(LS_CDEV);
  arr.push({
    id: Date.now(),
    fecha: nowStr(),
    tipo: cambio ? "CAMBIO" : "DEVOLUCION",
    devuelve: {
      id: devSel.id,
      nombre: devSel.nombre,
      talle: devTalle,
      cantidad: devQty,
      precio_unit: devPU,
      total: totalDev
    },
    se_lleva: cambio ? {
      id: newSel.id,
      nombre: newSel.nombre,
      talle: newTalle,
      cantidad: newQty,
      precio_unit: newPU,
      total: totalNew
    } : null,
    resolucion,
    motivo: (cdMotivo.value || "").trim()
  });
  saveArr(LS_CDEV, arr);

  // refrescar UI
  try { renderProductos(); } catch {}

  // limpiar
  devSel = null; newSel = null;
  cdDevBuscarProd.value = "";
  cdDevTalle.value = "";
  cdDevCantidad.value = 1;
  cdDevPrecio.value = "";

  cdNewBuscarProd.value = "";
  cdNewTalle.value = "";
  cdNewCantidad.value = 1;
  cdNewPrecio.value = "";

  cdMotivo.value = "";
  setUIporTipo();

  alert("Registrado correctamente (stock actualizado).");
});

// init
setUIporTipo();

// =========================================================
// Integrar Gift Card como medio de pago en VENTAS
// (Agrega opción + descuenta saldo al confirmar venta)
// =========================================================
/* =========================================================
   FIX GIFT CARD (EMITIR / CONSULTAR / USAR EN VENTA)
   ========================================================= */
(() => {
  const LS_GC = "giftcards_v1";

  function nowStr() {
    return new Date().toLocaleString("es-AR");
  }

  function moneyAR(n) {
    return Number(n || 0).toLocaleString("es-AR");
  }

  function loadArr(key) {
    try { return JSON.parse(localStorage.getItem(key) || "[]"); }
    catch { return []; }
  }

  function saveArr(key, arr) {
    localStorage.setItem(key, JSON.stringify(arr));
  }

  function loadGiftCards() { return loadArr(LS_GC); }
  function saveGiftCards(arr) { saveArr(LS_GC, arr); }

  function toUpperSafe(x) {
    return (x || "").toString().trim().toUpperCase();
  }

  function randCode(len = 8) {
    const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
    let out = "";
    for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
    return out;
  }

  function findGiftByCode(code) {
    const c = toUpperSafe(code);
    return loadGiftCards().find(g => g.codigo === c) || null;
  }

  function emitirGiftCard({ monto, medio_pago, nombre, motivo }) {
    const m = Number(monto || 0);
    if (!(m > 0)) return null;

    const codigo = `GC-${randCode(8)}`;
    const gcs = loadGiftCards();

    const gift = {
      id: Date.now(),
      codigo,
      saldo: m,
      emitida_en: nowStr(),
      nombre: (nombre || "").trim(),
      medio_pago: medio_pago || "EFECTIVO",
      movimientos: [{ fecha: nowStr(), tipo: motivo || "EMISION", monto: m }]
    };

    gcs.push(gift);
    saveGiftCards(gcs);
    return gift;
  }

  // ===== UI Gift Card: Emitir / Consultar =====
  document.addEventListener("DOMContentLoaded", () => {
    const btnEmitir = document.getElementById("btnEmitirGift");
    const btnConsultar = document.getElementById("btnConsultarGift");

    // EMITIR
    btnEmitir?.addEventListener("click", () => {
      const monto = Number(document.getElementById("gcMonto")?.value || 0);
      const medio = document.getElementById("gcMedioPago")?.value || "EFECTIVO";
      const nombre = document.getElementById("gcNombre")?.value || "";

      if (monto <= 0) return alert("Monto inválido");

      const gift = emitirGiftCard({ monto, medio_pago: medio, nombre, motivo: "EMISION" });
      if (!gift) return alert("No se pudo emitir la Gift Card.");

      // impactar caja como INGRESO (si existe tu sistema de caja)
      if (typeof window.loadCaja === "function" && typeof window.saveCaja === "function") {
        const state = window.loadCaja();
        if (state?.abierta && state?.caja && Array.isArray(state.movimientos)) {
          state.movimientos.push({
            id: Date.now(),
            caja_id: state.caja.id,
            fecha: nowStr(),
            tipo: "INGRESO",
            descripcion: `Emisión GiftCard ${gift.codigo}${gift.nombre ? " - " + gift.nombre : ""}`,
            monto: Math.abs(monto),
            medio_pago: medio
          });
          window.saveCaja(state);
          try { if (typeof window.renderCaja === "function") window.renderCaja(); } catch {}
        }
      }

      const info = document.getElementById("gcEmitidaInfo");
      if (info) info.textContent = ` Emitida: ${gift.codigo} | Saldo: $${moneyAR(gift.saldo)}`;

      document.getElementById("gcMonto").value = "";
      document.getElementById("gcNombre").value = "";
    });

    // CONSULTAR
    btnConsultar?.addEventListener("click", () => {
      const code = toUpperSafe(document.getElementById("gcCodigo")?.value || "");
      const out = document.getElementById("gcSaldoTxt");
      if (!out) return;

      if (!code) { out.textContent = "Saldo: —"; return; }

      const g = findGiftByCode(code);
      if (!g) { out.textContent = " Gift Card no encontrada"; return; }

      out.textContent = `Saldo: $${moneyAR(g.saldo)} | Emitida: ${g.emitida_en}`;
    });
  });

  // ===== Integrar Gift Card como medio de pago en Ventas =====
  document.addEventListener("DOMContentLoaded", () => {
    const selectPago = document.getElementById("selectPago");
    const cont = document.getElementById("contenedorBanco");
    if (!selectPago || !cont) return;

    // agregar opción si no está
    const ya = Array.from(selectPago.options).some(o => o.value === "giftcard");
    if (!ya) {
      const opt = document.createElement("option");
      opt.value = "giftcard";
      opt.textContent = "Gift Card";
      selectPago.appendChild(opt);
    }

    function renderGiftUI() {
      cont.innerHTML = "";
      if (selectPago.value !== "giftcard") return;

      cont.innerHTML = `
  <div style="display:grid; gap:8px;">
    <input id="ventaGiftCodigo" class="input" placeholder="Código Gift Card (GC-XXXX)" autocomplete="off" />
    <div class="small-muted" id="ventaGiftInfo" data-ok="0">Ingresá el código para validar saldo.</div>

    <div id="ventaGiftRestoBox" class="oculto" style="display:grid; gap:8px;">
      <div class="small-muted" id="ventaGiftRestoTxt">Resto a pagar: —</div>

      <select id="ventaRestoMedio" class="input">
        <option value="EFECTIVO">Efectivo</option>
        <option value="TRANSFERENCIA">Transferencia</option>
        <option value="QR">QR</option>
        <option value="TARJETA_DEBITO">Tarjeta Débito</option>
        <option value="TARJETA_CREDITO">Tarjeta Crédito</option>
      </select>

      <input id="ventaRestoCuotas" class="input oculto" type="number" min="1" value="1" placeholder="Cuotas (solo crédito)" />
      <select id="ventaRestoBanco" class="input oculto">
        <option value="">Elegí un banco</option>
        <option value="BBVA">BBVA</option>
        <option value="Santander">Santander</option>
        <option value="Galicia">Galicia</option>
        <option value="Macro">Macro</option>
        <option value="Banco Nación">Banco Nación</option>
        <option value="Mercado Pago">Mercado Pago</option>
      </select>
    </div>

    <button id="btnValidarGiftVenta" class="btn btn-dark" type="button">Validar</button>
  </div>
`;

      document.getElementById("btnValidarGiftVenta")?.addEventListener("click", () => {
        const code = toUpperSafe(document.getElementById("ventaGiftCodigo")?.value || "");
        const info = document.getElementById("ventaGiftInfo");

        const g = findGiftByCode(code);
        if (!g) {
          info.textContent = "Gift card no encontrada.";
          info.dataset.ok = "0";
          info.dataset.code = "";
          return;
        }

        info.textContent = `Saldo disponible: $${moneyAR(g.saldo)}`;
        info.dataset.ok = "1";
        info.dataset.code = g.codigo;
        btnValidarGiftVenta
      });
    }
    function getTotalVentaActual(){
  const totalTxt = document.getElementById("totalVenta")?.innerText || "0";
  return (typeof window.parseMoneyAR === "function")
    ? window.parseMoneyAR(totalTxt)
    : Number(String(totalTxt).replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".")) || 0;
}

function syncRestoUI(saldoGift){
  const total = getTotalVentaActual();
  const resto = Math.max(0, Number(total) - Number(saldoGift || 0));

  const box = document.getElementById("ventaGiftRestoBox");
  const txt = document.getElementById("ventaGiftRestoTxt");
  if (!box || !txt) return;

  if (resto > 0){
    box.classList.remove("oculto");
    txt.textContent = `Resto a pagar: $${Number(resto).toLocaleString("es-AR")}`;
  } else {
    box.classList.add("oculto");
    txt.textContent = "Resto a pagar: —";
  }

  // mostrar/ocultar extras según medio
  const medioSel = document.getElementById("ventaRestoMedio");
  const cuotasEl = document.getElementById("ventaRestoCuotas");
  const bancoEl  = document.getElementById("ventaRestoBanco");

  function refreshExtras(){
    const m = medioSel?.value || "EFECTIVO";
    if (cuotasEl) cuotasEl.classList.toggle("oculto", m !== "TARJETA_CREDITO");
    if (bancoEl)  bancoEl.classList.toggle("oculto", m !== "TRANSFERENCIA");
  }

  medioSel?.addEventListener("change", refreshExtras);
  refreshExtras();
}

    selectPago.addEventListener("change", renderGiftUI);

    // Hook confirmar venta (antes de tu lógica, captura)
    const btnConfirmar = document.getElementById("btnConfirmarVenta");
    if (!btnConfirmar) return;

    btnConfirmar.addEventListener("click", () => {
      if (selectPago.value !== "giftcard") return;

      const info = document.getElementById("ventaGiftInfo");
      const ok = info?.dataset?.ok === "1";
      const code = info?.dataset?.code;

      if (!ok || !code) {
        alert("Validá la Gift Card antes de registrar la venta.");
        throw new Error("GiftCard no validada");
      }

      const gcs = loadGiftCards();
      const g = gcs.find(x => x.codigo === code);
      if (!g) { alert("Gift card no encontrada."); throw new Error("GiftCard missing"); }

      const totalTxt = document.getElementById("totalVenta")?.innerText || "0";
      const total = (typeof window.parseMoneyAR === "function")
        ? window.parseMoneyAR(totalTxt)
        : Number(String(totalTxt).replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".")) || 0;

      if (g.saldo <= 0) { alert("Gift card sin saldo."); throw new Error("saldo 0"); }

// cuánto usa de gift
const usaGift = Math.min(Number(g.saldo || 0), Number(total || 0));
const resto   = Math.max(0, Number(total || 0) - usaGift);

// descuenta gift (si usa algo)
if (usaGift > 0){
  g.saldo = Number(g.saldo) - usaGift;
  g.movimientos = g.movimientos || [];
  g.movimientos.push({ fecha: nowStr(), tipo: "USO", monto: -Math.abs(usaGift), venta_total: total });
  saveGiftCards(gcs);
}

// si queda resto, se paga con otro medio (NO error)
if (resto > 0){
  const medioResto = document.getElementById("ventaRestoMedio")?.value || "EFECTIVO";
  const cuotas = Number(document.getElementById("ventaRestoCuotas")?.value || 1);
  const banco  = document.getElementById("ventaRestoBanco")?.value || null;

  // registra el resto en CAJA como INGRESO (si hay caja abierta)
  if (typeof window.loadCaja === "function" && typeof window.saveCaja === "function") {
    const state = window.loadCaja();
    if (state?.abierta && state?.caja && Array.isArray(state.movimientos)) {
      state.movimientos.push({
        id: Date.now(),
        caja_id: state.caja.id,
        fecha: nowStr(),
        tipo: "INGRESO",
        descripcion: `Resto venta (GiftCard + ${medioResto})`,
        monto: Math.abs(resto),
        medio_pago: medioResto
      });
      window.saveCaja(state);
      try { if (typeof window.renderCaja === "function") window.renderCaja(); } catch {}
    }
  }

  // opcional: guardá info en la venta (si querés)
  window.__ventaPagoMixto = {
    gift: { codigo: code, usado: usaGift },
    resto: { monto: resto, medio: medioResto, cuotas, banco }
  };
} else {
  window.__ventaPagoMixto = { gift: { codigo: code, usado: usaGift }, resto: null };
}

      g.saldo = Number(g.saldo) - Number(total);
      g.movimientos = g.movimientos || [];
      g.movimientos.push({ fecha: nowStr(), tipo: "USO", monto: -Math.abs(total), venta_total: total });

      saveGiftCards(gcs);

      alert(`Gift card aplicada | Nuevo saldo: $${moneyAR(g.saldo)}`);
    }, true);
  });

})();

// ================== NAV: ABRIR SECCIONES (FIX) ==================
document.addEventListener("DOMContentLoaded", () => {
  const btnCambios = document.getElementById("btnCambios");
  const btnGiftCard = document.getElementById("btnGiftCard");

  const seccionCambios = document.getElementById("seccionCambios");
  const seccionGiftCard = document.getElementById("seccionGiftCard");

  // DEBUG: te dice si encuentra o no los elementos
  console.log("btnCambios:", btnCambios);
  console.log("btnGiftCard:", btnGiftCard);
  console.log("seccionCambios:", seccionCambios);
  console.log("seccionGiftCard:", seccionGiftCard);

  function ocultarTodo() {
    document.querySelectorAll(".seccion").forEach(s => s.classList.add("oculto"));
  }

  function mostrarSeccion(id) {
    ocultarTodo();
    const sec = document.getElementById(id);
    if (!sec) {
      alert("No encuentro la sección: " + id);
      return;
    }
    sec.classList.remove("oculto");
  }

  if (btnCambios) {
    btnCambios.addEventListener("click", (e) => {
      e.preventDefault();
      console.log("CLICK Cambios");
      mostrarSeccion("seccionCambios");
    });
  } else {
    console.warn("No existe #btnCambios en el HTML");
  }

  if (btnGiftCard) {
    btnGiftCard.addEventListener("click", (e) => {
      e.preventDefault();
      console.log("CLICK GiftCard");
      mostrarSeccion("seccionGiftCard");
    });
  } else {
    console.warn("No existe #btnGiftCard en el HTML");
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const btnCambios = document.getElementById("btnCambios");
  const btnGiftCard = document.getElementById("btnGiftCard");

  function ocultarTodoSeguro() {
    // 1) Si tu sistema ya tiene una función para ocultar secciones, la usamos
    if (typeof ocultarTodasLasSecciones === "function") {
      ocultarTodasLasSecciones();
      return;
    }

    // 2) Fallback: ocultar por clase .seccion
    document.querySelectorAll(".seccion").forEach(sec => sec.classList.add("oculto"));
  }

  function mostrarSeguro(id) {
    ocultarTodoSeguro();
    const sec = document.getElementById(id);
    if (!sec) return console.warn("No existe la sección:", id);
    sec.classList.remove("oculto");
  }

  if (btnCambios) {
    btnCambios.onclick = (e) => {
      e.preventDefault();
      mostrarSeguro("seccionCambios");
    };
  }

  if (btnGiftCard) {
    btnGiftCard.onclick = (e) => {
      e.preventDefault();
      mostrarSeguro("seccionGiftCard");
    };
  }
});

function importarProductosBase(arr) {
  if (!Array.isArray(arr)) return alert("JSON inválido (no es un array)");

  let ok = 0, fail = 0;

  arr.forEach(p => {
    try {
      const prod = new Producto(
        p.id,
        p.nombre,
        Number(p.precio) || 0,
        Number(p.precioCompra) || 0,
        p.talles || {},
        p.categoria || ""
      );

      // si ya existe, lo salteo
      if (stock.productos.some(x => x.id === prod.id)) { fail++; return; }

      stock.productos.push(prod);
      ok++;
    } catch(e) { fail++; }
  });

  renderProductos();
  actualizarProductosSugerencias?.();

}

function categoriaDesdeDescripcion(descripcion) {
  const clean = (descripcion || "")
    .toString()
    .trim()
    .replace(/\s+/g, " ");

  if (!clean) return "SIN_CATEGORIA";

  // primera palabra
  let first = clean.split(" ")[0].toUpperCase();

  // normalizaciones opcionales (por si querés que quede más prolijo)
  const map = {
    "REMERAS": "REMERA",
    "CAMISAS": "CAMISA",
    "CAMPERAS": "CAMPERA",
    "BERMUDAS": "BERMUDA",
    "PANTALON": "PANTALÓN",
    "PANTALONES": "PANTALÓN",
    "JEANS": "JEAN",
    "MEDIAS": "MEDIA",
    "BOXERS": "BOXER",
  };

  return map[first] || first;
}

function generarJSONBaseDesdeTabla(textoPlano) {
  const lineas = (textoPlano || "")
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean);

  // saltear encabezado si existe
  const sinHeader = (lineas[0] || "").toLowerCase().includes("articulo")
    ? lineas.slice(1)
    : lineas;

  const map = new Map();

  const toNum = (v) => {
    if (v == null) return 0;
    const s = String(v).trim();
    if (!s) return 0;
    // soporta "15.000" / "15000" / "15,000" (por las dudas)
    const n = (typeof parseMoneyAR === "function")
      ? parseMoneyAR(s.replace(/[^\d.,-]/g, ""))
      : Number(s.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".")) || 0;
    return Number.isFinite(n) ? n : 0;
  };

  sinHeader.forEach(linea => {
    // split por TAB primero, sino por 2+ espacios
    const cols = linea.includes("\t") ? linea.split("\t") : linea.split(/\s{2,}/);

    const articulo = (cols[0] || "").trim();
    const descripcion = (cols[1] || "").trim();
    const talle = (cols[2] || "").trim();

    // columnas extra
    const stockVal = toNum(cols[3]);       // STOCK
    const compraVal = toNum(cols[4]);      // Precio Compra
    const ventaVal  = toNum(cols[5]);      // Precio Venta

    if (!descripcion) return;

    const key = descripcion.toUpperCase();

    if (!map.has(key)) {
      const descLow = descripcion.toLowerCase();

      // categoría por heurística
     let cat = categoriaDesdeDescripcion(descripcion);
      if (descLow.includes("jean")) cat = "Jeans";
      else if (descLow.includes("pantal")) cat = "Pantalones";
      else if (descLow.includes("berm")) cat = "Bermudas";
      else if (descLow.includes("boxer")) cat = "Boxer";
      else if (descLow.includes("media")) cat = "Medias";
      else if (descLow.includes("camisa")) cat = "Camisas";
      else if (descLow.includes("buzo")) cat = "Buzos";
      else if (descLow.includes("campera")) cat = "Camperas";
      else if (descLow.includes("remera")) cat = "Remeras";

      map.set(key, {
        id: articulo || generarID(),
        nombre: capitalizarTexto(descripcion),
        categoria: cat,
        precio: ventaVal || 0,       
        precioCompra: compraVal || 0, 
        talles: {}
      });
    }

    const prod = map.get(key);

    // si el primero vino en 0 y aparece un valor después, lo completa
    if ((Number(prod.precio) || 0) === 0 && ventaVal > 0) prod.precio = ventaVal;
    if ((Number(prod.precioCompra) || 0) === 0 && compraVal > 0) prod.precioCompra = compraVal;

    if (talle) {
      const t = talle.toUpperCase();
      prod.talles[t] = (Number(prod.talles[t] || 0) + Number(stockVal || 0));
    }
  });

  return Array.from(map.values());
}


const texto = `H/1000	BERMUDAS ALGODON O WAFLE	1		5000	15000
H/1001	BERMUDAS ALGODON O WAFLE	2		5000	15000
H/1002	BERMUDAS ALGODON O WAFLE	3		5000	15000
H/1003	BERMUDAS ALGODON O WAFLE	4		5000	15000
H/1004	BERMUDAS ALGODON O WAFLE	5		5000	15000
H/1005	BERMUDAS ALGODON O WAFLE	6		5000	15000
H/1006	BERMUDAS ALGODON O WAFLE	ESPECIALES		5000	15000
H/1007	BERMUDAS CARGO	38		11000	25000
H/1008	BERMUDAS CARGO	40		11000	25000
H/1009	BERMUDAS CARGO	42		11000	25000
H/1010	BERMUDAS CARGO	44		11000	25000
H/1011	BERMUDAS CARGO	46		11000	25000
H/1012	BERMUDAS CARGO	48		11000	25000
H/1013	BERMUDAS CORTE CHINO	38		11000	25000
H/1014	BERMUDAS CORTE CHINO	40		11000	25000
H/1015	BERMUDAS CORTE CHINO	42		11000	25000
H/1016	BERMUDAS CORTE CHINO	44		11000	25000
H/1017	BERMUDAS CORTE CHINO	46		11000	25000
H/1018	BERMUDAS CORTE CHINO	48		11000	25000
H/1019	BERMUDAS JEANS CORTAS	38		11000	25000
H/1020	BERMUDAS JEANS CORTAS	40		11000	25000
H/1021	BERMUDAS JEANS CORTAS	42		11000	25000
H/1022	BERMUDAS JEANS CORTAS	44		11000	25000
H/1023	BERMUDAS JEANS CORTAS	46		11000	25000
H/1024	BERMUDAS JEANS CORTAS	48		11000	25000
H/1025	BERMUDAS JEANS CORTAS	ESPECIALES		11000	25000
H/1026	BERMUDAS JEANS LARGAS	38		11000	25000
H/1027	BERMUDAS JEANS LARGAS	40		11000	25000
H/1028	BERMUDAS JEANS LARGAS	42		11000	25000
H/1029	BERMUDAS JEANS LARGAS	44		11000	25000
H/1030	BERMUDAS JEANS LARGAS	46		11000	25000
H/1031	BERMUDAS JEANS LARGAS	48		11000	25000
H/1032	BERMUDAS JEANS LARGAS	ESPECIALES		11000	25000
H/1033	BOXER	M		2400	5000
H/1034	BOXER	L		2400	5000
H/1035	BOXER	XL		2400	5000
H/1036	BOXER	XXL		2400	5000
H/1037	BOXER	XXXL		2400	5000
H/1038	BOXER	XXXXL		2400	5000
H/1039	BUZO CANGURO CON FRISA ESTAMPADO	S		17000	40000
H/1040	BUZO CANGURO CON FRISA ESTAMPADO	M		17000	40000
H/1041	BUZO CANGURO CON FRISA ESTAMPADO	L		17000	40000
H/1042	BUZO CANGURO CON FRISA ESTAMPADO	XL		17000	40000
H/1043	BUZO CANGURO CON FRISA ESTAMPADO	XXL		17000	40000
H/1044	BUZO CANGURO CON FRISA ESTAMPADO	XXXL		17000	40000
H/1045	BUZO CANGURO CON FRISA LISO	S		17000	40000
H/1046	BUZO CANGURO CON FRISA LISO	M		17000	40000
H/1047	BUZO CANGURO CON FRISA LISO	L		17000	40000
H/1048	BUZO CANGURO CON FRISA LISO	XL		17000	40000
H/1049	BUZO CANGURO CON FRISA LISO	XXL		17000	40000
H/1050	BUZO CANGURO CON FRISA LISO	XXXL		17000	40000
H/1051	BUZO CANGURO RUSTICO DE ALGODON LISO	S		11000	25000
H/1052	BUZO CANGURO RUSTICO DE ALGODON LISO	M		11000	25000
H/1053	BUZO CANGURO RUSTICO DE ALGODON LISO	L		11000	25000
H/1054	BUZO CANGURO RUSTICO DE ALGODON LISO	XL		11000	25000
H/1055	BUZO CANGURO RUSTICO DE ALGODON LISO	XXL		11000	25000
H/1056	BUZO CANGURO RUSTICO DE ALGODON LISO	XXXL		11000	25000
H/1057	BUZO MICROPOLAR HOMBRE	S			
H/1058	BUZO MICROPOLAR HOMBRE	M			
H/1059	BUZO MICROPOLAR HOMBRE	L			
H/1060	BUZO MICROPOLAR HOMBRE	XL			
H/1061	BUZO MICROPOLAR HOMBRE	XXL			
H/1062	BUZO POLAR HOMBRE	S			
H/1063	BUZO POLAR HOMBRE	M			
H/1064	BUZO POLAR HOMBRE	L			
H/1065	BUZO POLAR HOMBRE	XL			
H/1066	BUZO POLAR HOMBRE	XXL			
H/1067	BUZO POLAR HOMBRE	XXXL			
H/1068	CAMISAS MANGAS CORTAS / LINO	1		8000	20000
H/1069	CAMISAS MANGAS CORTAS / LINO	2		8000	20000
H/1070	CAMISAS MANGAS CORTAS / LINO	3		8000	20000
H/1071	CAMISAS MANGAS CORTAS / LINO	4		8000	20000
H/1072	CAMISAS MANGAS CORTAS / LINO	5		8000	20000
H/1073	CAMISAS MANGAS CORTAS / LINO	6		8000	20000
H/1074	CAMISAS MANGAS LARGAS	38		11000	20000
H/1075	CAMISAS MANGAS LARGAS	40		11000	20000
H/1076	CAMISAS MANGAS LARGAS	42		11000	20000
H/1077	CAMISAS MANGAS LARGAS	44		11000	20000
H/1078	CAMISAS MANGAS LARGAS	46		11000	20000
H/1079	CAMPERA CON FRISA ESTAMPADA 	S			
H/1080	CAMPERA CON FRISA ESTAMPADA 	M			
H/1081	CAMPERA CON FRISA ESTAMPADA 	L			
H/1082	CAMPERA CON FRISA ESTAMPADA 	XL			
H/1083	CAMPERA CON FRISA ESTAMPADA 	XXL			
H/1084	CAMPERA CON FRISA ESTAMPADA 	XXXL			
H/1085	CAMPERA CON FRISA LISA	S		18000	40000
H/1086	CAMPERA CON FRISA LISA	M		18000	40000
H/1087	CAMPERA CON FRISA LISA	L		18000	40000
H/1088	CAMPERA CON FRISA LISA	XL		18000	40000
H/1089	CAMPERA CON FRISA LISA	XXL		18000	40000
H/1090	CAMPERA CON FRISA LISA	XXXL		18000	40000
H/1091	CAMPERA INFLABLE HOMBRE	S			
H/1092	CAMPERA INFLABLE HOMBRE	M			
H/1093	CAMPERA INFLABLE HOMBRE	L			
H/1094	CAMPERA INFLABLE HOMBRE	XL			
H/1095	CAMPERA INFLABLE HOMBRE	XXL			
H/1096	CAMPERA INFLABLE HOMBRE	XXXL			
H/1097	CAMPERA POLAR HOMBRE	S			
H/1098	CAMPERA POLAR HOMBRE	M			
H/1099	CAMPERA POLAR HOMBRE	L			
H/1100	CAMPERA POLAR HOMBRE	XL			
H/1101	CAMPERA POLAR HOMBRE	XXL			
H/1102	CAMPERA POLAR HOMBRE	XXXL			
H/1103	CAMPERA RUSTICA DE ALGODON LISA	S		18000	40000
H/1104	CAMPERA RUSTICA DE ALGODON LISA	M		18000	40000
H/1105	CAMPERA RUSTICA DE ALGODON LISA	L		18000	40000
H/1106	CAMPERA RUSTICA DE ALGODON LISA	XL		18000	40000
H/1107	CAMPERA RUSTICA DE ALGODON LISA	XXL		18000	40000
H/1108	CAMPERA RUSTICA DE ALGODON LISA	XXXL		18000	40000
H/1109	CAMPERAS HILO HOMBRE	S			
H/1110	CAMPERAS HILO HOMBRE	M			
H/1111	CAMPERAS HILO HOMBRE	L			
H/1112	CAMPERAS HILO HOMBRE	XL			
H/1113	CAMPERAS HILO HOMBRE	XXL			
H/1114	CAMPERAS HILO HOMBRE	XXXL			
H/1115	CHALECO INFLABLE HOMBRE	S			
H/1116	CHALECO INFLABLE HOMBRE	M			
H/1117	CHALECO INFLABLE HOMBRE	L			
H/1118	CHALECO INFLABLE HOMBRE	XL			
H/1119	CHALECO INFLABLE HOMBRE	XXL			
H/1120	CHALECO INFLABLE HOMBRE	XXXL			
H/1121	CHALECO POLAR HOMBRE	S			
H/1122	CHALECO POLAR HOMBRE	M			
H/1123	CHALECO POLAR HOMBRE	L			
H/1124	CHALECO POLAR HOMBRE	XL			
H/1125	CHALECO POLAR HOMBRE	XXL			
H/1126	CHALECO POLAR HOMBRE	XXXL			
H/1127	CHOMBAS HOMBRE	S		8000	20000
H/1128	CHOMBAS HOMBRE	M		8000	20000
H/1129	CHOMBAS HOMBRE	L		8000	20000
H/1130	CHOMBAS HOMBRE	XL		8000	20000
H/1131	CHOMBAS HOMBRE	XXL		8000	20000
H/1132	CHOMBAS HOMBRE	XXXL		8000	20000
H/1133	CHOMBAS HOMBRE	7		8000	20000
H/1134	CHOMBAS HOMBRE	8		8000	20000
H/1135	CHOMBAS HOMBRE	9		8000	20000
H/1136	CHOMBAS HOMBRE	10		8000	20000
H/1137	CHUPIN DEPORTIVO CON FRISA	1			
H/1138	CHUPIN DEPORTIVO CON FRISA	2			
H/1139	CHUPIN DEPORTIVO CON FRISA	3			
H/1140	CHUPIN DEPORTIVO CON FRISA	4			
H/1141	CHUPIN DEPORTIVO CON FRISA	5			
H/1142	CHUPIN DEPORTIVO CON FRISA	6			
H/1143	CHUPIN DEPORTIVO SIN FRISA	1		7000	15000
H/1144	CHUPIN DEPORTIVO SIN FRISA	2		7000	15000
H/1145	CHUPIN DEPORTIVO SIN FRISA	3		7000	15000
H/1146	CHUPIN DEPORTIVO SIN FRISA	4		7000	15000
H/1147	CHUPIN DEPORTIVO SIN FRISA	5		7000	15000
H/1148	CHUPIN DEPORTIVO SIN FRISA	6		7000	15000
H/1149	JEANS CHUPIN HORMBRE	38		10000	30000
H/1150	JEANS CHUPIN HORMBRE	40		10000	30000
H/1151	JEANS CHUPIN HORMBRE	42		10000	30000
H/1152	JEANS CHUPIN HORMBRE	44		10000	30000
H/1153	JEANS CHUPIN HORMBRE	46		10000	30000
H/1154	JEANS CHUPIN HORMBRE	48		10000	30000
H/1155	JEANS CHUPIN HORMBRE	ESPECIALES		10000	30000
H/1156	JEANS RECTO HOMBRE	38		14000	30000
H/1157	JEANS RECTO HOMBRE	40		14000	30000
H/1158	JEANS RECTO HOMBRE	42		14000	30000
H/1159	JEANS RECTO HOMBRE	44		14000	30000
H/1160	JEANS RECTO HOMBRE	46		14000	30000
H/1161	JEANS RECTO HOMBRE	48		14000	30000
H/1162	JEANS RECTO HOMBRE	ESPECIALES		14000	30000
H/1163	JOGGING BABUCHA HOMBRE CON FRISA	1			
H/1164	JOGGING BABUCHA HOMBRE CON FRISA	2			
H/1165	JOGGING BABUCHA HOMBRE CON FRISA	3			
H/1166	JOGGING BABUCHA HOMBRE CON FRISA	4			
H/1167	JOGGING BABUCHA HOMBRE CON FRISA	5			
H/1168	JOGGING BABUCHA HOMBRE CON FRISA	6			
H/1169	JOGGING BABUCHA HOMBRE CON FRISA	ESPECIALES			
H/1170	JOGGING BABUCHA MICROPOLAR	S			
H/1171	JOGGING BABUCHA MICROPOLAR	M			
H/1172	JOGGING BABUCHA MICROPOLAR	L			
H/1173	JOGGING BABUCHA MICROPOLAR	XL			
H/1174	JOGGING BABUCHA MICROPOLAR	XXL			
H/1175	JOGGING BABUCHA MICROPOLAR	XXXL			
H/1176	JOGGING CARGO HOMBRE CON FRISA	1			
H/1177	JOGGING CARGO HOMBRE CON FRISA	2			
H/1178	JOGGING CARGO HOMBRE CON FRISA	3			
H/1179	JOGGING CARGO HOMBRE CON FRISA	4			
H/1180	JOGGING CARGO HOMBRE CON FRISA	5			
H/1181	JOGGING CARGO HOMBRE CON FRISA	6			
H/1182	JOGGING RECTO HOMBRE CON FRISA	1			
H/1183	JOGGING RECTO HOMBRE CON FRISA	2			
H/1184	JOGGING RECTO HOMBRE CON FRISA	3			
H/1185	JOGGING RECTO HOMBRE CON FRISA	4			
H/1186	JOGGING RECTO HOMBRE CON FRISA	5			
H/1187	JOGGING RECTO HOMBRE CON FRISA	6			
H/1188	JOGGING RECTO HOMBRE CON FRISA	ESPECIALES			
H/1189	MALLAS DE BAÑO HOMBRE	1		5000	15000
H/1190	MALLAS DE BAÑO HOMBRE	2		5000	15000
H/1191	MALLAS DE BAÑO HOMBRE	3		5000	15000
H/1192	MALLAS DE BAÑO HOMBRE	4		5000	15000
H/1193	MALLAS DE BAÑO HOMBRE	5		5000	15000
H/1194	MALLAS DE BAÑO HOMBRE	6		5000	15000
H/1195	MALLAS DE BAÑO HOMBRE	ESPECIALES		5000	15000
H/1196	MEDIAS DE HOMBRE INVISIBLES	UNICO		1000	1500
H/1197	MEDIAS DE HOMBRE LARGAS	UNICO		1000	1500
H/1198	MEDIAS DE HOMBRE MEDIA CAÑA	UNICO		1000	1500
H/1199	MEDIAS DE HOMBRE SOQUETE	UNICO		1000	1500
H/1200	MUSCULOSA ACETATO HOMBRE	1		4000	10000
H/1201	MUSCULOSA ACETATO HOMBRE	2		4000	10000
H/1202	MUSCULOSA ACETATO HOMBRE	3		4000	10000
H/1203	MUSCULOSA ACETATO HOMBRE	4		4000	10000
H/1204	MUSCULOSA ACETATO HOMBRE	5		4000	10000
H/1205	MUSCULOSA ACETATO HOMBRE	6		4000	10000
H/1206	MUSCULOSA DE ALGODON HOMBRE	S		8000	18000
H/1207	MUSCULOSA DE ALGODON HOMBRE	M		8000	18000
H/1208	MUSCULOSA DE ALGODON HOMBRE	L		8000	18000
H/1209	MUSCULOSA DE ALGODON HOMBRE	XL		8000	18000
H/1210	MUSCULOSA DE ALGODON HOMBRE	XXL		8000	18000
H/1211	MUSCULOSA DE ALGODON HOMBRE	XXXL		8000	18000
H/1212	PANTALON CARGO BABUCHA HOMBRE	38		14000	30000
H/1213	PANTALON CARGO BABUCHA HOMBRE	40		14000	30000
H/1214	PANTALON CARGO BABUCHA HOMBRE	42		14000	30000
H/1215	PANTALON CARGO BABUCHA HOMBRE	44		14000	30000
H/1216	PANTALON CARGO BABUCHA HOMBRE	46		14000	30000
H/1217	PANTALON CARGO BABUCHA HOMBRE	48		14000	30000
H/1218	PANTALON CARGO BABUCHA HOMBRE	ESPECIALES		14000	30000
H/1219	PANTALON CARGO RECTO HOMBRE	38		14000	30000
H/1220	PANTALON CARGO RECTO HOMBRE	40		14000	30000
H/1221	PANTALON CARGO RECTO HOMBRE	42		14000	30000
H/1222	PANTALON CARGO RECTO HOMBRE	44		14000	30000
H/1223	PANTALON CARGO RECTO HOMBRE	46		14000	30000
H/1224	PANTALON CARGO RECTO HOMBRE	48		14000	30000
H/1225	PANTALON CARGO RECTO HOMBRE	ESPECIALES		14000	30000
H/1226	PANTALON CORTE CHINO HOMBRE	42		14000	30000
H/1227	PANTALON CORTE CHINO HOMBRE	44		14000	30000
H/1228	PANTALON CORTE CHINO HOMBRE	46		14000	30000
H/1229	PANTALON CORTE CHINO HOMBRE 	38		14000	30000
H/1230	PANTALON CORTE CHINO HOMBRE 	40		14000	30000
H/1231	PANTALON CORTE CHINO HOMBRE 	48		14000	30000
H/1232	PANTALON CORTE CHINO HOMBRE 	ESPECIALES		14000	30000
H/1233	PANTALON GABARDINA RECTO HOMBRE	38		14000	30000
H/1234	PANTALON GABARDINA RECTO HOMBRE	40		14000	30000
H/1235	PANTALON GABARDINA RECTO HOMBRE	42		14000	30000
H/1236	PANTALON GABARDINA RECTO HOMBRE	44		14000	30000
H/1237	PANTALON GABARDINA RECTO HOMBRE	46		14000	30000
H/1238	PANTALON GABARDINA RECTO HOMBRE	48		14000	30000
H/1239	PILOTIN UNISEX	S		13000	25000
H/1240	PILOTIN UNISEX	M		13000	25000
H/1241	PILOTIN UNISEX	L		13000	25000
H/1242	PILOTIN UNISEX	XL		13000	25000
H/1243	PILOTIN UNISEX	XXL		13000	25000
H/1244	PILOTIN UNISEX	XXXL		13000	25000
H/1245	REMERAS DEPORTIVAS ACETATO HOMBRE	1		4000	10000
H/1246	REMERAS DEPORTIVAS ACETATO HOMBRE	2		4000	10000
H/1247	REMERAS DEPORTIVAS ACETATO HOMBRE	3		4000	10000
H/1248	REMERAS DEPORTIVAS ACETATO HOMBRE	4		4000	10000
H/1249	REMERAS DEPORTIVAS ACETATO HOMBRE	5		4000	10000
H/1250	REMERAS DEPORTIVAS ACETATO HOMBRE	6		4000	10000
H/1251	REMERAS SIN MANGAS HOMBRE	S		8000	18000
H/1252	REMERAS SIN MANGAS HOMBRE	M		8000	18000
H/1253	REMERAS SIN MANGAS HOMBRE	L		8000	18000
H/1254	REMERAS SIN MANGAS HOMBRE	XL		8000	18000
H/1255	REMERAS SIN MANGAS HOMBRE	XXL		8000	18000
H/1256	REMERAS SIN MANGAS HOMBRE	XXXL		8000	18000
H/1257	REMERAS URBANAS HOMBRE	S		7500	20000
H/1258	REMERAS URBANAS HOMBRE	M		7500	20000
H/1259	REMERAS URBANAS HOMBRE	L		7500	20000
H/1260	REMERAS URBANAS HOMBRE	XL		7500	20000
H/1261	REMERAS URBANAS HOMBRE	XXL		7500	20000
H/1262	REMERAS URBANAS HOMBRE	XXXL		7500	20000
H/1263	SHORT DEPORTIVO LYCRA	1		5000	15000
H/1264	SHORT DEPORTIVO LYCRA	2		5000	15000
H/1265	SHORT DEPORTIVO LYCRA	3		5000	15000
H/1266	SHORT DEPORTIVO LYCRA	4		5000	15000
H/1267	SHORT DEPORTIVO LYCRA	5		5000	15000
H/1268	SHORT DEPORTIVO LYCRA	6		5000	15000
H/1269	SHORT DEPORTIVO MICROFIBRA	1		6500	15000
H/1270	SHORT DEPORTIVO MICROFIBRA	2		6500	15000
H/1271	SHORT DEPORTIVO MICROFIBRA	3		6500	15000
H/1272	SHORT DEPORTIVO MICROFIBRA	4		6500	15000
H/1273	SHORT DEPORTIVO MICROFIBRA	5		6500	15000
H/1274	SHORT DEPORTIVO MICROFIBRA	6		6500	15000
H/1275	SHORT DEPORTIVO MICROFIBRA	ESPECIALES		6500	15000
H/1276	SWEATER HOMBRE CUELLO REDONDO HILO	S			
H/1277	SWEATER HOMBRE CUELLO REDONDO HILO	M			
H/1278	SWEATER HOMBRE CUELLO REDONDO HILO	L			
H/1279	SWEATER HOMBRE CUELLO REDONDO HILO	XL			
H/1280	SWEATER HOMBRE CUELLO REDONDO HILO	XXL			
H/1281	SWEATER HOMBRE CUELLO REDONDO HILO	XXXL			
H/1282	SWEATER HOMBRE MEDIO CUELLO HILO	S			
H/1283	SWEATER HOMBRE MEDIO CUELLO HILO	M			
H/1284	SWEATER HOMBRE MEDIO CUELLO HILO	L			
H/1285	SWEATER HOMBRE MEDIO CUELLO HILO	XL			
H/1286	SWEATER HOMBRE MEDIO CUELLO HILO	XXL			
H/1287	SWEATER HOMBRE MEDIO CUELLO HILO	XXXL			
H/1288	SWEATER POLERA HOMBRE HILO	S			
H/1289	SWEATER POLERA HOMBRE HILO	M			
H/1290	SWEATER POLERA HOMBRE HILO	L			
H/1291	SWEATER POLERA HOMBRE HILO	XL			
H/1292	SWEATER POLERA HOMBRE HILO	XXL			
H/1293	SWEATER POLERA HOMBRE HILO	XXXL			
H/1294	TERMICAS REMERAS UNISEX	1			
H/1295	TERMICAS REMERAS UNISEX	2			
H/1296	TERMICAS REMERAS UNISEX	3			
H/1297	TERMICAS REMERAS UNISEX	4			
H/1298	TERMICAS REMERAS UNISEX	5			
H/1299	TERMICAS REMERAS UNISEX	6			`;
const jsonBase = generarJSONBaseDesdeTabla(texto);
importarProductosBase(jsonBase);