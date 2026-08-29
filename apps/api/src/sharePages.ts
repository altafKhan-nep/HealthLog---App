import { Router } from "express";
import { ShareLink } from "./shareLinks/shareLink.model";
import { Visit } from "./visits/visit.model";

const router = Router();

const BRAND = "#0E7C7B";
const BRAND_DARK = "#0B605F";
const BRAND_LIGHT = "#E7F5F5";
const BG = "#F4F8FA";
const INK = "#1a2b3c";
const MUTED = "#5a6b7a";

// Reusable inline SVG icons (no emoji) for consistent rendering on all devices.
const SVG_ICONS = {
  lock: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0E7C7B" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
  ai: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0E7C7B" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
  trend: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0E7C7B" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3v18h18"/><path d="m7 14 4-4 3 3 5-6"/></svg>',
  doctor: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0E7C7B" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"/><path d="M5 21v-1a7 7 0 0 1 14 0v1"/></svg>',
  phone: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z"/></svg>',
  pdf: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C0392B" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></svg>',
  file: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0E7C7B" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></svg>',
};

// The app's real brand logo (served from /assets/logo.png, transparent already trimmed).
const LOGO_IMG = `<img src="/assets/logo.png" alt="" width="52" height="52" style="display:block" />`;

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function layout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="robots" content="noindex, nofollow" />
<title>${escapeHtml(title)} • HealthLog</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { height: 100%; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
    background: linear-gradient(180deg, ${BG} 0%, #EAF2F5 100%); color: ${INK}; min-height: 100vh;
    display: flex; flex-direction: column; align-items: center; padding: 32px 20px 40px; }
  .wrap { width: 100%; max-width: 580px; display: flex; flex-direction: column; align-items: center; flex: 1; }
  .brand { display: flex; align-items: center; gap: 12px; }
  .brand img { box-shadow: 0 4px 14px rgba(11, 96, 95, 0.18); }
  .brand-name { font-size: 24px; font-weight: 800; color: ${INK}; letter-spacing: -0.4px; }
  .brand-name span { color: ${BRAND}; }
  .tagline { margin-top: 6px; font-size: 14px; color: ${MUTED}; text-align: center; }
  .card { background: #fff; border-radius: 18px; box-shadow: 0 10px 40px rgba(11, 96, 95, 0.12);
    width: 100%; padding: 28px 24px; margin-top: 26px; border: 1px solid #E3EDEF; }
  .card-body { width: 100%; }
  .btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    width: 100%; padding: 15px 18px; border-radius: 12px; border: none; cursor: pointer;
    font-size: 16px; font-weight: 700; text-decoration: none; margin-top: 18px; }
  .btn-primary { background: ${BRAND}; color: #fff; box-shadow: 0 6px 16px rgba(14,124,123,0.28); }
  .btn-primary:active { background: ${BRAND_DARK}; }
  .btn-secondary { background: ${BRAND_LIGHT}; color: ${BRAND}; }
  h1 { font-size: 22px; margin: 4px 0 8px; letter-spacing: -0.3px; }
  p { color: ${MUTED}; line-height: 1.6; }
  .muted { font-size: 13px; color: #8a9aa8; }
  .error { background: #FDECEC; color: #C0392B; padding: 14px 16px; border-radius: 12px; margin-top: 12px; font-weight: 600; }
  .code { font-size: 22px; font-weight: 800; text-align: center; letter-spacing: 4px;
    background: ${BG}; padding: 16px; border-radius: 12px; color: ${BRAND}; margin: 16px 0; }
  /* Report */
  .report { text-align: left; width: 100%; }
  .report .hdr { margin-bottom: 16px; }
  .report h2 { font-size: 20px; margin-bottom: 4px; }
  .report .item { display: flex; justify-content: space-between; padding: 11px 0; border-bottom: 1px solid #eef2f4; }
  .report .item .v { font-weight: 700; color: ${INK}; }
  .report small { color: ${MUTED}; }
  .tag { display: inline-block; background: ${BRAND_LIGHT}; color: ${BRAND};
    padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; margin-top: 6px; text-transform: capitalize; }
  .summary { background: ${BRAND_LIGHT}; border-left: 4px solid ${BRAND}; padding: 14px 16px;
    border-radius: 10px; margin: 16px 0; line-height: 1.6; }
  .summary ul { padding-left: 20px; }
  .summary li { margin-bottom: 6px; }
  .section-label { font-size: 13px; font-weight: 700; color: ${MUTED}; text-transform: uppercase;
    letter-spacing: 0.6px; margin: 20px 0 8px; }
  .doctor { display: inline-flex; align-items: center; gap: 7px; margin-top: 12px;
    font-size: 14px; color: ${MUTED}; }
  .doctor-icon { display: inline-flex; align-items: center; justify-content: center;
    width: 26px; height: 26px; border-radius: 8px; background: ${BRAND_LIGHT}; }
  .divider { border: 0; border-top: 1px solid #E3EDEF; margin: 20px 0; }
  .att { margin: 12px 0; }
  .att img { width: 100%; max-height: 420px; object-fit: contain; border-radius: 12px;
    border: 1px solid #E3EDEF; background: ${BG}; }
  .att iframe { width: 100%; height: 460px; border: 1px solid #E3EDEF; border-radius: 12px; background: #fff; }
  .att-hdr { display: inline-flex; align-items: center; gap: 6px; margin-bottom: 6px;
    font-size: 13px; font-weight: 700; color: ${INK}; }
  /* Footer */
  .footer { width: 100%; max-width: 580px; margin-top: 28px; text-align: center; }
  .footer .features { display: flex; justify-content: center; gap: 18px; flex-wrap: wrap;
    margin-bottom: 12px; font-size: 13px; color: ${MUTED}; }
  .footer .features span { display: inline-flex; align-items: center; gap: 6px; }
  .footer .copy { font-size: 12px; color: #93a6b0; }
</style>
</head>
<body>
  <div class="wrap">
    <header class="brand">
      ${LOGO_IMG}
      <div class="brand-name">Health<span>Log</span></div>
    </header>
    <div class="tagline">Your personal health record, safely shared.</div>
    <div class="card"><div class="card-body">${body}</div></div>
    <footer class="footer">
      <div class="features">
        <span>${SVG_ICONS.lock} Private &amp; encrypted</span>
        <span>${SVG_ICONS.ai} AI health summaries</span>
        <span>${SVG_ICONS.trend} Health trends</span>
      </div>
      <div class="copy">© 2026 HealthLog · Your medical records stay yours.</div>
    </footer>
  </div>
</body>
</html>`;
}

// Render a visit as read-only report HTML. All dynamic values are escaped.
// Render a visit's attachments as viewable images / embedded PDFs.
function renderAttachments(visit: any): string {
  const atts = visit.attachments;
  if (!Array.isArray(atts) || atts.length === 0) return "";
  const items = atts
    .map((a: any, i: number) => {
      const fileUrl = a && typeof a.fileUrl === "string" ? a.fileUrl : "";
      const fileType = a && typeof a.fileType === "string" ? a.fileType : "";
      const name = a && typeof a.name === "string" && a.name ? a.name : "attachment-" + (i + 1);
      if (!fileUrl) return "";
      const url = escapeHtml(fileUrl);
      const safeName = escapeHtml(name);
      const lower = fileType.toLowerCase();
      if (lower.startsWith("image/")) {
        return (
          '<div class="att"><img src="' +
          url +
          '" alt="' +
          safeName +
          '" loading="lazy" onclick="window.open(\'' +
          fileUrl.replace(/'/g, "") +
          "','_blank')\" style=\"cursor:pointer\" /></div>"
        );
      }
      if (lower === "application/pdf") {
        return (
          '<div class="att"><div class="att-hdr">' + SVG_ICONS.pdf + " " + safeName + "</div>" +
          '<iframe src="' + url + '" title="' + safeName + '" loading="lazy"></iframe></div>'
        );
      }
      return (
        '<div class="att"><div class="att-hdr file">' + SVG_ICONS.file + " " + safeName + "</div>" +
        '<a class="btn btn-secondary" href="' + url + '" target="_blank" rel="noopener">View file</a></div>'
      );
    })
    .join("");
  return '<div class="section-label">Attachments</div>' + items;
}

function renderVisitReport(visit: any): string {
  const tag = escapeHtml(String(visit.tag || "other").replace(/_/g, " "));
  let summary = "";
  const rawSummary =
    visit.extractedFields && visit.extractedFields.plainLanguageSummary
      ? String(visit.extractedFields.plainLanguageSummary)
      : "";
  if (rawSummary) {
    const lines = rawSummary
      .split("\n")
      .map((s: string) => s.trim())
      .filter(Boolean);
    const hasBullets = lines.length > 1 || /[•\-\*]/.test(rawSummary);
    summary = hasBullets
      ? '<div class="summary"><ul>' +
        lines
          .map((l: string) => "<li>" + escapeHtml(l.replace(/^[•\-\*]\s*/, "")) + "</li>")
          .join("") +
        "</ul></div>"
      : '<div class="summary"><p>' + escapeHtml(rawSummary) + "</p></div>";
  }

  const rows = (visit.extractedFields && visit.extractedFields.testResults) || [];
  let tests = "";
  if (Array.isArray(rows) && rows.length) {
    tests =
      '<div class="section-label">Test Results</div>' +
      rows
        .map((t: any) => {
          const range = t.referenceRange
            ? " <small>· " + escapeHtml(t.referenceRange) + " " + escapeHtml(t.unit || "") + "</small>"
            : "";
          return (
            '<div class="item"><span>' +
            escapeHtml(t.testName) +
            range +
            '</span><span class="v">' +
            escapeHtml(t.value) +
            " " +
            escapeHtml(t.unit || "") +
            "</span></div>"
          );
        })
        .join("");
  }

  const title = visit.hospitalId && visit.hospitalId.name ? escapeHtml(visit.hospitalId.name) : "Health Report";
  const dateStr = visit.visitDate
    ? escapeHtml(
        new Date(visit.visitDate).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      )
    : "";

  return (
    '<div class="report">' +
    '<div class="hdr"><h2>' +
    title +
    '</h2><div style="color:#5a6b7a">' +
    dateStr +
    '</div><span class="tag">' +
    tag +
    "</span></div>" +
    summary +
    tests +
    renderAttachments(visit) +
    (visit.doctorName
      ? '<p class="doctor"><span class="doctor-icon">' + SVG_ICONS.doctor + "</span> " + escapeHtml(visit.doctorName) + "</p>"
      : "") +
    "</div>"
  );
}

/** GET /share/report/:token — server-rendered, read-only report (no client fetch) */
router.get("/share/report/:token", async (req, res) => {
  const token = String(req.params.token || "");
  const deepLink = `healthlog://share/report/${token}`;

  try {
    const link = await ShareLink.findOne({ token });
    if (!link) {
      return res.send(
        layout("Shared Health Report", '<div class="error">This link is no longer available.</div>')
      );
    }
    if (link.expiresAt < new Date()) {
      return res.send(
        layout("Shared Health Report", '<div class="error">This link has expired.</div>')
      );
    }
    if (link.oneTimeUse && link.used) {
      return res.send(
        layout("Shared Health Report", '<div class="error">This link has already been used.</div>')
      );
    }

    let visits: any[] = [];
    if (link.scope === "singleVisit" && link.scopeParams.visitId) {
      const visit = await Visit.findById(link.scopeParams.visitId).populate("hospitalId", "name location");
      if (visit) visits = [visit];
    } else {
      const filter: any = { userId: link.userId };
      if (link.scope === "lastNVisits" && link.scopeParams.lastN) {
        visits = await Visit.find(filter)
          .populate("hospitalId", "name location")
          .sort({ visitDate: -1 })
          .limit(link.scopeParams.lastN);
      } else if (link.scope === "dateRange") {
        if (link.scopeParams.from) filter.visitDate = { ...filter.visitDate, $gte: link.scopeParams.from };
        if (link.scopeParams.to) filter.visitDate = { ...filter.visitDate, $lte: link.scopeParams.to };
        if (link.scopeParams.hospitalId) filter.hospitalId = link.scopeParams.hospitalId;
        visits = await Visit.find(filter).populate("hospitalId", "name location").sort({ visitDate: -1 });
      }
    }

    const body =
      visits.length === 0
        ? '<div class="report"><div class="hdr"><h2>Health Report</h2></div><div class="error">No visits found.</div></div>'
        : visits.map(renderVisitReport).join("<hr class=\"divider\" />");

    res.send(
      layout(
        "Shared Health Report",
        body +
          '<button class="btn btn-primary" onclick="openApp()">Open in HealthLog app</button>' +
          '<script>window.openApp = function(){ window.location.href = ' +
          JSON.stringify(deepLink) +
          "; };</script>"
      )
    );
  } catch (err) {
    res.send(
      layout("Shared Health Report", '<div class="error">Unable to load this report.</div>')
    );
  }
});

/** GET /share/circle/:code — show the join code, open app to join */
router.get("/share/circle/:code", async (req, res) => {
  const code = String(req.params.code || "");
  const deepLink = `healthlog://share/circle/${code}`;

  const html = layout(
    "Care Circle Invite",
    `
    <h1>You're invited to a Care Circle</h1>
    <p>A trusted family member or friend shared this invite so you can keep in touch with their health journey.</p>
    <div class="code">${escapeHtml(code)}</div>
    <button class="btn btn-primary" onclick="openApp()">Open HealthLog app</button>
    <p class="muted" style="margin-top:12px">Open the app and enter this code to join.</p>
    <script>window.openApp = function(){ window.location.href = ${JSON.stringify(deepLink)}; };</script>
    `
  );
  res.send(html);
});

export default router;
