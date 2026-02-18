import express from "express";
import cors from "cors";
import { Resend } from "resend";
import puppeteer from "puppeteer";
import fs from "fs";import path from "path";

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(express.json({ limit: "2mb" }));

const RESEND_KEY = process.env.RESEND_API_KEY;
const resend = RESEND_KEY ? new Resend(RESEND_KEY) : null;

function moneyAR(n) {
  return Number(n || 0).toLocaleString("es-AR", { maximumFractionDigits: 0 });
}

function buildReciboHTML(venta) {
  const fecha = new Date(venta?.fecha || Date.now()).toLocaleString("es-AR", {
  timeZone: "America/Argentina/Buenos_Aires",
  hour12: false
});
  const tel = venta?.telefono ? ` <b>• Tel: ${venta.telefono}</b>` : "";
  const dni = venta?.ads ? ` <b>• DNI: ${venta.ads}</b>` : "";

  const ORANGE = "#f97316";     // naranja principal
  const ORANGE_DARK = "#c2410c"; // naranja oscuro

  const rows = (venta?.productos || [])
    .map(p => `
      <tr>
        <td style="padding:12px;border-bottom:1px solid #eef2f7;color:#111827;">${p.id}</td>
        <td style="padding:12px;border-bottom:1px solid #eef2f7;color:#111827;">${p.nombre}</td>
        <td style="padding:12px;border-bottom:1px solid #eef2f7;color:#111827;">${p.talle}</td>
        <td style="padding:12px;border-bottom:1px solid #eef2f7;text-align:right;color:#111827;">${p.cantidad}</td>
        <td style="padding:12px;border-bottom:1px solid #eef2f7;text-align:right;color:#111827;">$${moneyAR(p.precio)}</td>
      </tr>
    `).join("");

  return `
  <div style="font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:#f8fafc;padding:22px;">
    <div style="max-width:820px;margin:0 auto;">
      
      <!-- Card -->
      <div style="background:#fff;border:1px solid #e5e7eb;border-radius:18px;overflow:hidden;box-shadow:0 10px 30px rgba(17,24,39,.08);">
        
        <!-- Brand bar -->
        <div style="height:6px;background:linear-gradient(90deg, ${ORANGE} 0%, ${ORANGE_DARK} 100%);"></div>

        <!-- Header -->
        <div style="display:flex;justify-content:space-between;align-items:center;gap:14px;padding:18px 18px 10px 18px;">
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:130px;display:flex;align-items:center;">
              <img
                src="http://127.0.0.1:5500/img/logo-blanco.png"
                alt="Logo"
                style="max-width:130px;max-height:46px;object-fit:contain;"
              />
            </div>
            <div>
              <div style="font-weight:900;color:#111827;font-size:22px;letter-spacing:.3px;">Comprobante de venta</div>
              <div style="color:#6b7280;font-size:14px;margin-top:4px;">Gracias por tu compra</div>
            </div>
          </div>

          <div style="text-align:right;">
            <div style="font-weight:700;color:#6b7280;font-size:13px;">${venta?.id || ""}</div>
            <div style="color:#9ca3af;font-size:12px;margin-top:3px;">${fecha}</div>
          </div>
        </div>

        <!-- Info -->
        <div style="padding:0 18px 18px 18px;">
          <div style="border:1px solid #e5e7eb;border-radius:14px;padding:12px 12px;background:linear-gradient(180deg,#fff 0%,#fff7ed 140%);">
            <div style="color:#111827;"><b>Cliente:</b> ${venta?.cliente || "-"}${tel}${dni}</div>
            <div style="color:#111827;margin-top:4px;"><b>Email:</b> ${venta?.email || "-"}</div>
            <div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:8px;">
              <span style="display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:999px;background:rgba(249,115,22,.12);color:${ORANGE_DARK};font-weight:800;font-size:12px;">
                ${(venta?.formaPago || "-").toString().toUpperCase()}
              </span>
              ${venta?.banco ? `<span style="display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:999px;background:#f3f4f6;color:#111827;font-weight:800;font-size:12px;">Banco: ${venta.banco}</span>` : ""}
              ${venta?.cuotas ? `<span style="display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:999px;background:#f3f4f6;color:#111827;font-weight:800;font-size:12px;">Cuotas: ${venta.cuotas}</span>` : ""}
              ${Number(venta?.descuento || 0) ? `<span style="display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:999px;background:#fef3c7;color:#92400e;font-weight:800;font-size:12px;">Descuento: ${venta.descuento}%</span>` : ""}
            </div>
          </div>

          <!-- Table -->
          <div style="margin-top:14px;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;">
            <table style="width:100%;border-collapse:collapse;">
              <thead>
                <tr style="background:linear-gradient(90deg, ${ORANGE_DARK} 0%, ${ORANGE} 130%);color:#fff;">
                  <th style="padding:12px;text-align:left;font-size:12px;letter-spacing:.3px;">ID</th>
                  <th style="padding:12px;text-align:left;font-size:12px;letter-spacing:.3px;">Producto</th>
                  <th style="padding:12px;text-align:left;font-size:12px;letter-spacing:.3px;">Talle</th>
                  <th style="padding:12px;text-align:right;font-size:12px;letter-spacing:.3px;">Cant</th>
                  <th style="padding:12px;text-align:right;font-size:12px;letter-spacing:.3px;">Precio</th>
                </tr>
              </thead>
              <tbody>
                ${rows || `
                  <tr><td colspan="5" style="padding:14px;color:#6b7280;text-align:center;">Sin productos.</td></tr>
                `}
              </tbody>
            </table>
          </div>

          <!-- Totals -->
          <div style="display:flex;justify-content:flex-end;margin-top:14px;">
            <div style="min-width:300px;border:1px solid rgba(249,115,22,.35);border-radius:14px;padding:12px;background:#fff;">
              <div style="display:flex;justify-content:space-between;margin:6px 0;color:#111827;">
                <span style="color:#6b7280;">Subtotal</span><b>$${moneyAR(venta?.subtotal)}</b>
              </div>
              <div style="height:1px;background:rgba(249,115,22,.18);margin:10px 0;"></div>
              <div style="display:flex;justify-content:space-between;margin:6px 0;font-size:18px;color:#111827;">
                <span style="font-weight:900;color:${ORANGE_DARK};">Total</span>
                <b style="font-weight:900;color:#111827;">$${moneyAR(venta?.total)}</b>
              </div>
            </div>
          </div>

          <div style="margin-top:14px;color:#6b7280;font-size:12px;">
            Este comprobante es informativo.
          </div>
        </div>
      </div>
    </div>
  </div>
  `;
}

app.post("/api/preview-recibo", async (req, res) => {
  try {
    const venta = req.body?.payload ? JSON.parse(req.body.payload) : (req.body || {});
    // Generamos el mismo HTML del recibo, pero NO enviamos nada.
    const html = buildReciboHTML(venta);
    return res.json({ ok: true, html });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, error: "Error generando preview" });
  }
});

app.post("/api/preview-recibo-pdf", async (req, res) => {
  try {
    const venta = req.body?.payload ? JSON.parse(req.body.payload) : (req.body || {});
    const html = buildReciboHTML(venta);

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox","--disable-setuid-sandbox","--disable-gpu","--disable-dev-shm-usage"],
      timeout: 30000
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "domcontentloaded" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "12mm", right: "12mm", bottom: "12mm", left: "12mm" }
    });

    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="comprobante-${venta?.id || "venta"}.pdf"`);
    res.setHeader("Content-Length", String(pdfBuffer.length));
    res.setHeader("Cache-Control", "no-store");

    return res.end(pdfBuffer);
  } catch (e) {
    console.error("❌ PDF ERROR:", e);
    return res.status(500).type("text/plain").send("PDF ERROR: " + (e?.stack || e?.message || String(e)));
  }
});

import XLSX from "xlsx-js-style";

// carpeta donde se guardan los excels
const BASE_REG_DIR = path.join(process.cwd(), "registros", "cajas");

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function yyyymmFromISO(isoDate) {
  const d = new Date(isoDate || Date.now());
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function arMoney(n) {
  return Number(n || 0);
}

function cellFill(hex) {
  // xlsx usa ARGB
  return { patternType: "solid", fgColor: { rgb: hex.replace("#", "").toUpperCase() } };
}

function appendRowToXlsx(filePath, sheetName, header, rowObj) {
  let wb, ws;

  if (fs.existsSync(filePath)) {
    wb = XLSX.readFile(filePath);
    ws = wb.Sheets[sheetName] || XLSX.utils.aoa_to_sheet([header]);
  } else {
    wb = XLSX.utils.book_new();
    ws = XLSX.utils.aoa_to_sheet([header]);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  }

  const current = XLSX.utils.sheet_to_json(ws, { defval: "" });
  current.push(rowObj);

  ws = XLSX.utils.json_to_sheet(current, { header });
  wb.Sheets[sheetName] = ws;

  // ---- anchos (PRO)
  // ---- anchos dinámicos según hoja
if (sheetName === "Ventas") {

  ws["!cols"] = [
    { wch: 20 }, { wch: 14 }, { wch: 16 }, { wch: 22 },
    { wch: 15 }, { wch: 26 }, { wch: 14 }, { wch: 16 },
    { wch: 20 }, { wch: 8 }, { wch: 10 },
    { wch: 14 }, { wch: 14 }, { wch: 14 }
  ];

} else if (sheetName === "Cierres") {

  ws["!cols"] = [
    { wch: 20 }, { wch: 14 }, { wch: 12 },
    { wch: 14 }, { wch: 14 }, { wch: 14 },
    { wch: 14 }, { wch: 12 }, { wch: 32 }
  ];

} else if (sheetName === "Cambios") {

  ws["!cols"] = [
    { wch: 20 }, { wch: 14 },
    { wch: 22 }, { wch: 12 }, { wch: 10 },
    { wch: 14 }, { wch: 14 },
    { wch: 22 }, { wch: 12 }, { wch: 10 },
    { wch: 14 }, { wch: 14 },
    { wch: 12 }, { wch: 16 }, { wch: 24 }
  ];

} else if (sheetName === "GiftCards") {

  ws["!cols"] = [
    { wch: 20 }, { wch: 16 }, { wch: 22 },
    { wch: 14 }, { wch: 14 }, { wch: 14 },
    { wch: 14 }, { wch: 24 }
  ];

} else if (sheetName === "CuentaCorriente") {

  ws["!cols"] = [
    { wch: 20 }, { wch: 22 }, { wch: 14 },
    { wch: 16 }, { wch: 22 }, { wch: 14 },
    { wch: 14 }, { wch: 16 }, { wch: 16 }, { wch: 24 }
  ];
}

// ====== helpers estilo ======
const BORDER = {
  top:    { style: "thin", color: { rgb: "E5E7EB" } },
  bottom: { style: "thin", color: { rgb: "E5E7EB" } },
  left:   { style: "thin", color: { rgb: "E5E7EB" } },
  right:  { style: "thin", color: { rgb: "E5E7EB" } }
};

function styleCell(addr, style){
  if (!ws[addr]) return;
  ws[addr].s = { ...(ws[addr].s || {}), ...style };
}

// ---- header dark (fila 1)
const headerFill = { patternType: "solid", fgColor: { rgb: "111827" } };
const headerFont = { bold: true, color: { rgb: "FFFFFF" } };

// altura header
ws["!rows"] = ws["!rows"] || [];
ws["!rows"][0] = { hpt: 22 };

// header styles
for (let c = 0; c < header.length; c++){
  const addr = XLSX.utils.encode_cell({ r: 0, c });
  styleCell(addr, {
    fill: headerFill,
    font: headerFont,
    border: BORDER,
    alignment: { vertical: "center", horizontal: "center", wrapText: true }
  });
}

// ---- zebra rows + bordes + alineación + wrap
const totalRows = current.length + 1; // + header
const zebra = { patternType: "solid", fgColor: { rgb: "F9FAFB" } };

for (let r = 1; r < totalRows; r++){
  const isZebra = (r % 2 === 0);
  for (let c = 0; c < header.length; c++){
    const addr = XLSX.utils.encode_cell({ r, c });

    // base
    styleCell(addr, {
  border: BORDER,
  alignment: {
    vertical: "center",
    horizontal: "center",  // ✅ todo centrado
    wrapText: true
  }
});

    // zebra
    if (isZebra) styleCell(addr, { fill: zebra });
  }
}

// ---- Freeze header + autofilter dinámico (según cantidad de columnas)
ws["!freeze"] = { xSplit: 0, ySplit: 1 };
const lastCol = XLSX.utils.encode_col(header.length - 1); // A,B,C...
ws["!autofilter"] = { ref: `A1:${lastCol}${totalRows}` };

// ---- formatos por hoja (ancho + money cols + alineación)
function setMoneyCols(colsIdx){
  for (let r = 1; r < totalRows; r++){
    colsIdx.forEach(c => {
      const addr = XLSX.utils.encode_cell({ r, c });
      if (!ws[addr]) return;
      ws[addr].z = '#,##0;[Red]-#,##0';
      styleCell(addr, { alignment: { horizontal: "center", vertical: "center", wrapText: true } });
    });
  }
}

// Anchos por hoja (ajustado para que “entre todo”)
if (sheetName === "GiftCards") {
  ws["!cols"] = [
    { wch: 20 }, // Fecha
    { wch: 16 }, // Codigo
    { wch: 24 }, // Cliente
    { wch: 14 }, // DNI
    { wch: 16 }, // Telefono
    { wch: 14 }, // Tipo
    { wch: 12 }, // Monto
    { wch: 16 }, // SaldoResultante
    { wch: 34 }  // Obs (más grande para “Medio: EFECTIVO…”)
  ];
  setMoneyCols([6, 7]); // Monto, SaldoResultante
} else if (sheetName === "Cambios") {
  // (tus anchos, pero con Obs un poco más)
  ws["!cols"] = [
    { wch: 20 }, { wch: 14 },
    { wch: 22 }, { wch: 12 }, { wch: 10 },
    { wch: 14 }, { wch: 14 },
    { wch: 22 }, { wch: 12 }, { wch: 10 },
    { wch: 14 }, { wch: 14 },
    { wch: 12 }, { wch: 16 }, { wch: 34 }
  ];
  // money cols: PrecioDevUnit(5), TotalDev(6), PrecioNewUnit(10), TotalNew(11), Diferencia(12)
  setMoneyCols([5, 6, 10, 11, 12]);
} else if (sheetName === "CuentaCorriente") {
  ws["!cols"] = [
    { wch: 20 }, { wch: 26 }, { wch: 14 },
    { wch: 16 }, { wch: 24 }, { wch: 14 },
    { wch: 12 }, { wch: 16 }, { wch: 18 }, { wch: 34 }
  ];
  // money cols: Monto(6), SaldoPosterior(7)
  setMoneyCols([6, 7]);
} else if (sheetName === "Ventas") {
  // dejalo como ya lo tenías
} else if (sheetName === "Cierres") {
  // dejalo como ya lo tenías
}

XLSX.writeFile(wb, filePath);
}

function monthDirFromISO(isoDate){
  const d = new Date(isoDate || Date.now());
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return path.join(BASE_REG_DIR, `${y}-${m}`); // ej: registros/cajas/2026-02
}

const BASE_OPER_DIR = path.join(process.cwd(), "registros", "operaciones");

function operacionesXlsxPathFromISO(isoDate){
  const ym = yyyymmFromISO(isoDate); // (ya lo tenés en tu server)
  ensureDir(BASE_OPER_DIR);
  return path.join(BASE_OPER_DIR, `operaciones-${ym}.xlsx`);
}

app.post("/api/registrar-cierre-caja", (req, res) => {
  try {
    const payload = req.body || {};

    const fecha = payload.fecha || new Date().toISOString();
    const cajaId = String(payload.caja_id || "");
    const apertura = arMoney(payload.apertura);
    const cierre = arMoney(payload.cierre);
    const esperado = arMoney(payload.esperado);
    const diferencia = arMoney(payload.diferencia);

    const estado = diferencia < 0 ? "NEGATIVO" : "OK";

    const monthDir = monthDirFromISO(fecha);
    ensureDir(monthDir);

    const ym = yyyymmFromISO(fecha);
    const mensualPath = path.join(monthDir, `cajas-${ym}.xlsx`);

    const header = ["Fecha", "Turno", "Usuario", "Apertura", "Cierre", "Esperado", "Diferencia", "Estado", "Observación"];

    const row = {
     Fecha: new Date(fecha).toLocaleString("es-AR", {
  timeZone: "America/Argentina/Buenos_Aires",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false
}),
      Turno: cajaId,
      Usuario: String(payload.usuario || "—"),
      Apertura: apertura,
      Cierre: cierre,
      Esperado: esperado,
      Diferencia: diferencia,
      Estado: estado,
      "Observación": String(payload.observacion || "")
    };

    appendRowToXlsx(mensualPath, "Cierres", header, row);

    return res.json({ ok: true, file: `cajas-${ym}.xlsx` });

  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, error: "No se pudo registrar el cierre en Excel" });
  }
});

// ✅ token (ponelo por variable de entorno)
const EXCEL_TOKEN = process.env.EXCEL_TOKEN || "cambia-esto-ya";

function yyyymmNow(){
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

// ✅ Descarga Excel del mes (con token)
app.get("/api/excel/cajas-mes", (req, res) => {
  const token = String(req.query.token || "");
  if (token !== EXCEL_TOKEN) return res.status(401).send("No autorizado");

  const ym = yyyymmNow();
  const filePath = path.join(BASE_REG_DIR, ym, `cajas-${ym}.xlsx`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ ok:false, error:"Todavía no hay Excel del mes (cerrá una caja primero)." });
  }

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `inline; filename="cajas-${ym}.xlsx"`);
  return res.sendFile(filePath);
});

// =========================
//  REGISTRO DE VENTAS (Excel + JSON + Preview)
// =========================

const BASE_VENTAS_DIR = path.join(process.cwd(), "registros", "ventas");

function monthDirFromISO2(baseDir, isoDate){
  const ym = yyyymmFromISO(isoDate);
  return path.join(baseDir, ym);
}

function safeStr(x){ return String(x ?? "").trim(); }
function num(x){ return Number(x || 0); }

function resumenItems(productos = []) {
  return (productos || [])
    .map(p => String(p.id || "").trim())
    .filter(Boolean)
    .join(", ");
}

function appendVentaToJson(jsonPath, venta){
  let arr = [];
  try { arr = JSON.parse(fs.readFileSync(jsonPath, "utf8") || "[]"); } catch {}
  arr.push(venta);
  fs.writeFileSync(jsonPath, JSON.stringify(arr, null, 2), "utf8");
}

function findVentaInJson(jsonPath, id){
  try {
    const arr = JSON.parse(fs.readFileSync(jsonPath, "utf8") || "[]");
    return arr.find(v => String(v.id) === String(id)) || null;
  } catch { return null; }
}

// ✅ Registrar venta: guarda en Excel mensual + JSON mensual
app.post("/api/registrar-venta", (req, res) => {
  try {
    const venta = req.body?.venta || req.body || {};

    const fechaISO = venta.fecha || new Date().toISOString();
    const ym = yyyymmFromISO(fechaISO);
    const monthDir = monthDirFromISO2(BASE_VENTAS_DIR, fechaISO);
    ensureDir(monthDir);

    const xlsxPath = path.join(monthDir, `ventas-${ym}.xlsx`);
    const jsonPath = path.join(monthDir, `ventas-${ym}.json`);

    // si no mandan id, generamos uno simple
    // Genera número correlativo de 8 dígitos
const contadorPath = path.join(BASE_VENTAS_DIR, "contador.json");

let ultimo = 0;
try {
  ultimo = JSON.parse(fs.readFileSync(contadorPath, "utf8"))?.ultimo || 0;
} catch {}

const nuevoNumero = ultimo + 1;
fs.writeFileSync(contadorPath, JSON.stringify({ ultimo: nuevoNumero }));

const ventaId = "V-" + String(nuevoNumero).padStart(8, "0");


    // guardo venta completa en JSON para poder “rearmar” comprobante luego
    const ventaFull = {
      ...venta,
      id: ventaId,
      fecha: fechaISO
    };
    appendVentaToJson(jsonPath, ventaFull);

    // Excel: columnas
    const header = [
      "Fecha", "ID", "Vendedor", "Cliente", "Teléfono", "Email", "DNI",
      "FormaPago", "Banco", "Cuotas", "Descuento",
      "Subtotal", "Total", "Productos"
    ];

    const row = {
      Fecha: new Date(fechaISO).toLocaleString("es-AR", {
        timeZone: "America/Argentina/Buenos_Aires",
        hour12: false
      }),
      ID: ventaId,
      Vendedor: safeStr(venta.vendedor || "—"),
      Cliente: safeStr(venta.cliente || "—"),
      "Teléfono": safeStr(venta.telefono || ""),
      Email: safeStr(venta.email || ""),
      DNI: safeStr(venta.ads || venta.dni || ""), // vos usás "ads" en el recibo
      FormaPago: safeStr(venta.formaPago || ""),
      Banco: safeStr(venta.banco || ""),
      Cuotas: safeStr(venta.cuotas || ""),
      Descuento: num(venta.descuento || 0),
      Subtotal: num(venta.subtotal || 0),
      Total: num(venta.total || 0),
      Productos: resumenItems(venta.productos || [])
    };

    appendRowToXlsx(xlsxPath, "Ventas", header, row);

    return res.json({ ok: true, id: ventaId, ym, file: `ventas-${ym}.xlsx` });
  } catch (e) {
    console.error("❌ registrar-venta ERROR:", e);
    return res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
});

// ✅ Buscar venta por ID (para soporte rápido)
app.get("/api/ventas/:id", (req, res) => {
  try {
    const id = String(req.params.id || "");
    const ym = req.query.ym ? String(req.query.ym) : yyyymmFromISO(new Date().toISOString());

    const jsonPath = path.join(BASE_VENTAS_DIR, ym, `ventas-${ym}.json`);
    const v = findVentaInJson(jsonPath, id);

    if (!v) return res.status(404).json({ ok:false, error:"No encontrada" });
    return res.json({ ok:true, venta: v });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok:false, error:"Error buscando venta" });
  }
});

// ✅ Preview HTML desde ID (regenera usando tu buildReciboHTML)
app.get("/api/ventas/:id/preview", (req, res) => {
  try {
    const id = String(req.params.id || "");
    const ym = req.query.ym ? String(req.query.ym) : yyyymmFromISO(new Date().toISOString());

    const jsonPath = path.join(BASE_VENTAS_DIR, ym, `ventas-${ym}.json`);
    const v = findVentaInJson(jsonPath, id);

    if (!v) return res.status(404).json({ ok:false, error:"No encontrada" });

    const html = buildReciboHTML(v);
    return res.json({ ok:true, html, id, ym });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok:false, error:"Error generando preview" });
  }
});

const FROM_EMAIL = process.env.FROM_EMAIL || "Comprobantes <onboarding@resend.dev>"; // cambiá esto a tu remitente real

app.post("/api/enviar-recibo-pdf", async (req, res) => {
  try {
    if (!resend) {
      return res.status(400).json({ ok: false, error: "Resend no está configurado (falta RESEND_API_KEY)." });
    }

    const venta = req.body?.payload ? JSON.parse(req.body.payload) : (req.body || {});
    const to = String(venta?.email || "").trim();
    if (!to) return res.status(400).json({ ok: false, error: "Falta email del cliente." });

    // 1) Generar PDF
    const html = buildReciboHTML(venta);

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox","--disable-setuid-sandbox","--disable-gpu","--disable-dev-shm-usage"],
      timeout: 30000
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "domcontentloaded" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "12mm", right: "12mm", bottom: "12mm", left: "12mm" }
    });

    await browser.close();

    // 2) Enviar por email (PDF adjunto)
    const filename = `comprobante-${venta?.id || "venta"}.pdf`;

    await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: `Tu comprobante ${venta?.id ? `(${venta.id})` : ""}`,
      html: `
        <p>Hola ${venta?.cliente || ""},</p>
        <p>Adjuntamos tu comprobante de compra.</p>
        <p>Gracias por tu compra.</p>
      `,
      attachments: [
        {
          filename,
          content: pdfBuffer.toString("base64"),
          type: "application/pdf"
        }
      ]
    });

    return res.json({ ok: true });
  } catch (e) {
    console.error("Enviar-recibo-pdf ERROR:", e);
    return res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
});

app.post("/api/operaciones/cambio", (req, res) => {
  try {
    const d = req.body || {};
    const fechaISO = d.fecha || new Date().toISOString();
    const xlsxPath = operacionesXlsxPathFromISO(fechaISO);

    const header = [
      "Fecha","Tipo",
      "ProdDev","TalleDev","CantDev","PrecioDevUnit","TotalDev",
      "ProdNew","TalleNew","CantNew","PrecioNewUnit","TotalNew",
      "Diferencia","Resolucion","Obs"
    ];

    const cantDev = Number(d.cantDev || 0);
    const cantNew = Number(d.cantNew || 0);
    const precioDevUnit = Number(d.precioDevUnit || 0);
    const precioNewUnit = Number(d.precioNewUnit || 0);
    const totalDev = Number(d.totalDev ?? (cantDev * precioDevUnit));
    const totalNew = Number(d.totalNew ?? (cantNew * precioNewUnit));
    const diferencia = Number(d.diferencia ?? (totalNew - totalDev));

    const row = {
      Fecha: new Date(fechaISO).toLocaleString("es-AR"),
      Tipo: String(d.tipo || ""), // CAMBIO / DEVOLUCION
      ProdDev: String(d.prodDev || ""),
      TalleDev: String(d.talleDev || ""),
      CantDev: cantDev,
      PrecioDevUnit: precioDevUnit,
      TotalDev: totalDev,
      ProdNew: String(d.prodNew || ""),
      TalleNew: String(d.talleNew || ""),
      CantNew: cantNew,
      PrecioNewUnit: precioNewUnit,
      TotalNew: totalNew,
      Diferencia: diferencia,
      Resolucion: String(d.resolucion || ""), // EFECTIVO / GIFT_CARD / CC / OTRO
      Obs: String(d.obs || "")
    };

    appendRowToXlsx(xlsxPath, "Cambios", header, row);
    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false });
  }
});

app.post("/api/operaciones/giftcard", (req, res) => {
  try {
    const d = req.body || {};
    const fechaISO = d.fecha || new Date().toISOString();
    const xlsxPath = operacionesXlsxPathFromISO(fechaISO);

    const header = [
      "Fecha","Codigo","Cliente","DNI","Telefono",
      "Tipo","Monto","SaldoResultante","Obs"
    ];

    const row = {
      Fecha: new Date(fechaISO).toLocaleString("es-AR"),
      Codigo: String(d.codigo || ""),
      Cliente: String(d.cliente || ""),
      DNI: String(d.dni || ""),
      Telefono: String(d.telefono || ""),
      Tipo: String(d.tipo || ""), // EMITIDA / USADA / AJUSTE
      Monto: Number(d.monto || 0),
      SaldoResultante: Number(d.saldo || 0),
      Obs: String(d.obs || "")
    };

    appendRowToXlsx(xlsxPath, "GiftCards", header, row);
    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false });
  }
});

app.post("/api/operaciones/cuenta-corriente", (req, res) => {
  try {
    const d = req.body || {};
    const fechaISO = d.fecha || new Date().toISOString();
    const xlsxPath = operacionesXlsxPathFromISO(fechaISO);

    const header = [
      "Fecha","Cliente","DNI","Telefono","Email",
      "Tipo","Monto","SaldoPosterior","Ref","Obs"
    ];

    const row = {
      Fecha: new Date(fechaISO).toLocaleString("es-AR"),
      Cliente: String(d.cliente || ""),
      DNI: String(d.dni || ""),
      Telefono: String(d.telefono || ""),
      Email: String(d.email || ""),
      Tipo: String(d.tipo || ""), // VENTA / PAGO / AJUSTE
      Monto: Number(d.monto || 0),
      SaldoPosterior: Number(d.saldo || 0),
      Ref: String(d.ref || ""),   // ej: ID venta / recibo / lo que quieras
      Obs: String(d.obs || "")
    };

    appendRowToXlsx(xlsxPath, "CuentaCorriente", header, row);
    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false });
  }
});

app.get("/api/operaciones/excel", (req, res) => {
  try {
    const ym = yyyymmFromISO(new Date().toISOString());
    const filePath = path.join(BASE_OPER_DIR, `operaciones-${ym}.xlsx`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ ok:false, error:"No hay operaciones registradas este mes." });
    }

    res.setHeader("Content-Type","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `inline; filename="operaciones-${ym}.xlsx"`);
    return res.sendFile(filePath);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok:false });
  }
});

app.listen(3000, () => console.log("API lista en http://127.0.0.1:3000"));
