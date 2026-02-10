import express from "express";
import cors from "cors";
import { Resend } from "resend";
import puppeteer from "puppeteer";

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
  const fecha = new Date(venta?.fecha || Date.now()).toLocaleString("es-AR");
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
            <div style="font-weight:700;color:#6b7280;font-size:13px;">${venta?.id ?? "-"}</div>
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
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-gpu",
    "--disable-dev-shm-usage"
  ],
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
    res.setHeader("Content-Type", "application/pdf");
res.setHeader("Content-Disposition", `inline; filename="comprobante-${venta?.id || "venta"}.pdf"`);
res.setHeader("Content-Length", String(pdfBuffer.length));
res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
res.setHeader("Pragma", "no-cache");
res.setHeader("Expires", "0");
return res.end(pdfBuffer);

    return res.send(pdfBuffer);
  }  catch (e) {
  console.error("❌ PDF ERROR:", e);
  return res
    .status(500)
    .type("text/plain")
    .send("PDF ERROR: " + (e?.stack || e?.message || String(e)));
}
});


app.listen(3000, () => console.log("API lista en http://127.0.0.1:3000"));
