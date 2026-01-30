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
      <div class="small-muted">$${precioCompraOK}</div>
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

function generarID() {
    const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    let grupo = Math.floor(stock.productos.length / 100);
    if (grupo >= letras.length) grupo = letras.length - 1;

    let id;
    do {
        const numero = Math.floor(1000 + Math.random() * 9000);
        id = `${letras[grupo]}${numero}`;
    } while (stock.productos.some(p => p.id === id)); 

    return id;
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

// Sugerencias de categorias
function obtenerCategoriasUnicas() {
    const categorias = stock.productos.map(p => p.categoria);
    return [...new Set(categorias.filter(c => c))]; // sin vacíos y sin repetir
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

function limpiarStockTalles() {
    stockS.value = "";
    stockM.value = "";
    stockL.value = "";
    stockXL.value = "";
}


/* ================= ABRIR / CERRAR MODAL PRODUCTO ================= */
function abrirModal(producto = null) {
    modal.classList.remove("oculto");

    errorNombre.innerText = "";
    errorPrecio.innerText = "";
    errorCategoria.innerText = "";

    if (producto) {
        // EDITAR
        tituloModal.innerText = "Editar Producto";
        inputId.value = producto.id;
        inputId.disabled = true;
        inputNombre.value = producto.nombre;
        inputPrecio.value = producto.precio;
        inputCategoria.value = producto.categoria;
        inputPrecioCompraa.value = producto.precioCompra ?? "";

        stockS.value = producto.talles.S;
        stockM.value = producto.talles.M;
        stockL.value = producto.talles.L;
        stockXL.value = producto.talles.XL;

        productoEditando = producto;
    } else {
    // NUEVO PRODUCTO
    tituloModal.innerText = "Agregar Producto";
    inputId.value = generarID();
    inputId.disabled = true;
    inputNombre.value = "";
    inputPrecio.value = "";
    inputCategoria.value = "";
    productoEditando = null;
    inputPrecioCompraa.value = "";
}


    inputNombre.focus();
}


function cerrarModal() {
    modal.classList.add("oculto");
}

function existeProducto(nombre, ignorarId = null) {
  return stock.productos.some(p =>
    p.id !== ignorarId &&
    p.nombre.trim().toLowerCase() === nombre.trim().toLowerCase());
}

/* ================= GUARDAR PRODUCTO ================= */
btnGuardar.addEventListener("click", () => {
    let valid = true;

    errorNombre.innerText = "";
    errorPrecio.innerText = "";
    errorCategoria.innerText = "";
    errorPrecioCompra.innerText = "";


    const id = inputId.value;
    const nombre = inputNombre.value.trim();
    const precio = Number(inputPrecio.value);
    const precioCompra = Number(inputPrecioCompraa.value);
    const categoria = inputCategoria.value.trim();

    const talles = {
        S: Number(stockS.value) || 0,
        M: Number(stockM.value) || 0,
        L: Number(stockL.value) || 0,
        XL: Number(stockXL.value) || 0
    };

    // Validaciones
    if (!nombre || !/^[a-zA-Z\s]+$/.test(nombre)) {
        errorNombre.innerText = "Nombre inválido";
        valid = false;
    }

    if (isNaN(precio) || precio <= 0) {
        errorPrecio.innerText = "Precio inválido";
        valid = false;
    }

    if (isNaN(precioCompra) || precioCompra < 0) {
    errorPrecioCompra.innerText = "Precio de compra inválido";
    valid = false;
    }

    if (!isNaN(precioCompra) && precioCompra > 0 && precioCompra >= precio) {
    errorPrecio.innerText = "Venta debe ser mayor a compra";
    valid = false;
    }

    if (!categoria) {
        errorCategoria.innerText = "Categoría requerida";
        valid = false;
    }

    if (!valid) return;

    // 🚨 Validación duplicado (antes de guardar)
    const idActual = productoEditando ? productoEditando.id : null;
    if (existeProducto(nombre, idActual)) {
        alert("Ese producto ya existe");
        return;
    }


    if (productoEditando) {
        // Editar producto
        productoEditando.nombre = nombre;
        productoEditando.precio = precio;
        productoEditando.precioCompra = precioCompra;
        productoEditando.categoria = categoria.toLowerCase();
        productoEditando.talles = talles; // actualizar stock
    } else {
        // Nuevo producto
        stock.agregarProducto(
            new Producto(id, nombre, precio,precioCompra, talles, categoria )
        );
    }

    

    limpiarStockTalles(); 
    cerrarModal();
    renderProductos();
    actualizarListaCategorias();
    actualizarProductosSugerencias();

});


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

let productoStockActual = null;
let talleStockActual = null;

function abrirModalStock() {
    modalStock.classList.remove("oculto");
    errorStock.innerText = "";
    inputCantidadStock.value = "";
    stockInfo.innerText = `Producto: ${productoStockActual.nombre} | Talle: ${talleStockActual}`;
    inputCantidadStock.focus();
}


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
    if (!email) return alert("El email del cliente es obligatorio");
    if (!telefonoMinimoOk(8)) {
        alert("Teléfono muy corto (mínimo 8 dígitos).");
        return;
    }

    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return alert("Ingrese un email válido");

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
        subtotal: parseMoneyAR(subtotalSpan.innerText),
        total: parseMoneyAR(totalVentaSpan.innerText),
        formaPago: selectPago.value,
        banco: document.getElementById("selectBanco")?.value || null,
        cuotas: selectPago.value === "tarjeta-credito" ? Number(inputCuotas.value) || 1 : 1,
        descuento: Number(inputDescuento.value) || 0,
        fecha: new Date()
    };

    ventas.push(venta);
    localStorage.setItem("ventas_v1", JSON.stringify(ventas));
    registrarVentaEnCaja(venta);
    renderCaja();

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




// Renderizar lista de categorías y subcategorías
function actualizarListaCategorias() {
    listaCategorias.innerHTML = "";

    const categorias = [...new Set(
        stock.productos
            .map(p => p.categoria)
            .filter(c => c && c.trim() !== "")
    )];

    categorias.forEach(cat => {
        const li = document.createElement("li");
        li.textContent = capitalizarTexto(cat);

        li.addEventListener("click", () => {
            const filtrados = stock.productos.filter(p => p.categoria === cat);

            renderProductosFiltrados(filtrados);

            seccionProductos.classList.remove("oculto");
            btnVerProductosText.textContent = "Ocultar productos";

            listaCategorias.classList.add("oculto");
        });

        listaCategorias.appendChild(li);
    });
}

btnFiltroCategorias.addEventListener("click", e => {
    e.stopPropagation();
    actualizarListaCategorias();
    listaCategorias.classList.toggle("oculto");
});

document.addEventListener("click", e => {
    if (!e.target.closest(".filtro-categorias-wrapper")) {
        listaCategorias.classList.add("oculto");
    }
});

document.getElementById("listaCategorias")?.addEventListener("click", (e) => {
  const li = e.target.closest("li");
  if (!li) return;

  const cat = li.textContent.trim();
  if (!cat) return;

  // cerrar lista
  document.getElementById("listaCategorias").classList.add("oculto");

  // ir a productos
  irASeccionProductos();
  document.getElementById("inputBuscar").value = cat; 
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

    const talles = {
        S: Number(inputCompraS.value) || 0,
        M: Number(inputCompraM.value) || 0,
        L: Number(inputCompraL.value) || 0,
        XL: Number(inputCompraXL.value) || 0
    };

    if (Object.values(talles).every(c => c === 0)) {
        return alert("Ingresá al menos una cantidad");
    }

    const totalUnidades = Object.values(talles).reduce((a, b) => a + b, 0);

    productosCompra.push({
        id: producto.id,
        nombre: producto.nombre,
        talles,
        totalUnidades
    });

    mostrarResumenCompra();
    limpiarInputsProductoCompra();
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
    });
}


function limpiarInputsProductoCompra() {
    inputProductoCompra.value = "";
    inputCompraS.value = inputCompraM.value = inputCompraL.value = inputCompraXL.value = "";
    sugerenciasProductosCompra.innerHTML = "";
}


/* ====== GUARDAR COMPRA ====== */
const btnGuardarCompra = document.getElementById("btnGuardarCompra");

if (btnGuardarCompra) {
  btnGuardarCompra.addEventListener("click", () => {

    // ✅ si no agregaste productos
    if (productosCompra.length === 0) {
      alert("No agregaste productos a la compra");
      return;
    }

    // ✅ Actualizar stock con TODOS los productos agregados
    productosCompra.forEach(item => {
      const producto = stock.productos.find(p => p.id === item.id);
      if (!producto) return;

      Object.keys(item.talles).forEach(talle => {
        producto.talles[talle] += item.talles[talle];
      });
    });

    // ✅ Guardar compra (sin proveedor)
   compras.push({
  total: Number(document.getElementById("precioCompra").value) || 0,
  fecha: new Date(),
  productos: productosCompra
});

    alert("Compra registrada y stock actualizado ✅");

    // ✅ Limpiar todo
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
  if (!confirm("¿Borrar TODAS las ventas y reiniciar reportes?")) return;

  // borrar localStorage
  localStorage.removeItem("ventas_v1");

  // resetear variable en memoria
  ventas = [];

  // refrescar reporte en pantalla si estás en reportes
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
    const max = Math.max(...mixArr.map(x=> x.total));
    mixArr.forEach(x=>{
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
    topProductos.forEach(p=>{
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
    criticos.slice(0, 12).forEach(c=>{
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
    movsOrdenados.forEach(m=>{
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

  btnLogin.addEventListener("click", async () => {
    btnLogin.disabled = true;
    try {
      const ok = await verifyLogin();
      if (ok) setLockedUI(false);
    } finally {
      btnLogin.disabled = false;
    }
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
