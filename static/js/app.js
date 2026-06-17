/* ============================================================
   Overcoming Bootstrap Bias  project page: interactivity
   - sortable Table 1
   - per-task final-performance bar chart (from Table 1 numbers)
   - ablation learning-curve charts (from real per-seed curve JSON)
   - method diagram, tab switchers, video-placeholder handling
   ============================================================ */
(function () {
  "use strict";

  /* -------------------- Table 1 data (mean, std); null = n/a -------------------- */
  // method order: dreamerv3, tdmpc2, bmpc, boom, tdmpc2c (TD-M(PC)^2), ours, target
  // flags: '*' = plot-digitized; '‡' = average over only the subset of tasks a method reports
  // (no in-flight markers: the page reflects the finalized submitted-paper values)
  const M = ["dreamerv3", "tdmpc2", "bmpc", "boom", "tdmpc2c", "ours"];
  const METHOD_LABEL = {
    dreamerv3: "DreamerV3", tdmpc2: "TD-MPC2", bmpc: "BMPC",
    boom: "BOOM", tdmpc2c: "TD-M(PC)²", ours: "Ours"
  };
  const METHOD_COLOR = {
    dreamerv3: "#9b59b6", tdmpc2: "#2f7ed8", bmpc: "#19b27e",
    boom: "#e6883b", tdmpc2c: "#8a93a3", ours: "#e23b2e"
  };
  // helper to build a cell
  const c = (m, s, flag) => (m === null ? null : { m, s, flag: flag || "" });

  const GROUPS = [
    {
      name: "DMControl Suite",
      rows: [
        { task: "cheetah-run",             d:[c(643,49),c(860,95),c(867,53),null,null,c(893,25)], target:null },
        { task: "cartpole-swingup-sparse", d:[c(624,232),c(826,46),c(846,5),null,null,c(785,34)], target:null },
        { task: "dog-stand",               d:[c(41,9),c(523,421),c(941,32),c(982,7),c(832,99,"*"),c(976,14)], target:null },
        { task: "dog-trot",                d:[c(11,3),c(394,184),c(903,14),c(923,8),c(899,39,"*"),c(885,78)], target:null },
        { task: "finger-turn-hard",        d:[c(877,29),c(930,76),c(939,73),null,null,c(926,16)], target:null },
        { task: "hopper-stand",            d:[c(699,181),c(929,35),c(941,16),null,null,c(953,11)], target:null },
        { task: "humanoid-stand",          d:[c(5,1),c(637,71),c(915,23),c(920,15),c(929,15,"*"),c(954,2)], target:null },
        { task: "humanoid-walk",           d:[c(2,0),c(643,96),c(899,26),c(921,10),c(867,63),c(947,6)], target:null },
        { task: "quadruped-walk",          d:[c(158,49),c(963,9),c(940,26),null,null,c(958,6)], target:null },
        { task: "walker-stand",            d:[c(937,11),c(991,3),c(990,5),null,null,c(993,1)], target:null }
      ],
      avg: { task: "Avg. DMC", d:[c(400,390),c(770,207),c(918,42),c(936,31,"‡"),c(882,42,"*‡"),c(927,60)], target:null }
    },
    {
      name: "HumanoidBench: Whole-Body Manipulation",
      rows: [
        { task: "basketball",       d:[c(24,1),c(101,8),null,null,null,c(546,35)], target:1200 },
        { task: "bookshelf_simple", d:[c(376,25),c(133,80),null,null,null,c(808,28)], target:2000 },
        { task: "bookshelf_hard",   d:[c(178,21),c(34,15),null,null,null,c(633,24)], target:2000 },
        { task: "door",             d:[c(70,37),c(167,102),null,null,null,c(308,4)], target:600 },
        { task: "truck",            d:[c(829,65),c(1159,20),null,null,null,c(1389,149)], target:3000 },
        { task: "window",           d:[c(31,10),c(62,21),null,null,null,c(550,109)], target:650 }
      ],
      avg: { task: "Avg. H-Bench WBM", d:[c(251,312),c(276,435),null,null,null,c(705,371)], target:1575 }
    },
    {
      name: "HumanoidBench: Locomotion",
      rows: [
        { task: "walk",           d:[c(161,45),c(891,43),c(776,60),c(928,16),c(894,62,"*"),c(911,7)], target:700 },
        { task: "stand",          d:[c(220,74),c(754,132),c(813,65),c(915,26),c(951,4,"*"),c(933,3)], target:800 },
        { task: "run",            d:[c(56,11),c(196,122),c(196,9),c(596,63),c(786,92,"*"),c(658,355)], target:700 },
        { task: "crawl",          d:[c(504,90),c(822,97),c(943,25),null,c(840,57,"*"),c(855,31)], target:700 },
        { task: "maze",           d:[c(117,6),c(196,36),c(325,24),null,c(355,4,"*"),c(353,3)], target:1200 },
        { task: "stair",          d:[c(43,11),c(66,14),c(422,86),null,c(479,207,"*"),c(461,12)], target:700 },
        { task: "slide",          d:[c(19,6),c(210,39),c(456,74),c(858,43),c(868,68,"*"),c(910,7)], target:700 },
        { task: "sit-simple",     d:[c(268,26),c(359,228),c(742,68),c(882,44),c(906,47,"*"),c(910,39)], target:750 },
        { task: "sit-hard",       d:[c(152,20),c(744,165),c(643,63),null,c(810,146,"*"),c(635,233)], target:750 },
        { task: "pole",           d:[c(123,34),c(156,25),c(720,95),c(879,33),c(805,115,"*"),c(879,49)], target:700 },
        { task: "balance-simple", d:[c(15,1),c(120,24),c(673,124),null,c(512,151,"*"),c(765,176)], target:800 },
        { task: "hurdle",         d:[c(13,3),c(86,26),c(213,13),c(331,45),c(192,32,"*"),c(466,200)], target:700 },
        { task: "balance-hard",   d:[c(17,4),c(102,17),c(84,8),null,c(81,5,"*"),c(387,255)], target:800 }
      ],
      avg: { task: "Avg. H-Bench Loco", d:[c(131,140),c(362,316),c(539,273),c(770,224,"‡"),c(652,294,"*"),c(702,221)], target:769 }
    }
  ];

  /* -------------------- small helpers -------------------- */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const SVGNS = "http://www.w3.org/2000/svg";
  function sv(tag, attrs, kids) {
    const e = document.createElementNS(SVGNS, tag);
    if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (kids) (Array.isArray(kids) ? kids : [kids]).forEach(k => e.appendChild(typeof k === "string" ? document.createTextNode(k) : k));
    return e;
  }
  const mean = a => a.reduce((x, y) => x + y, 0) / a.length;
  const std = a => { if (a.length < 2) return 0; const m = mean(a); return Math.sqrt(mean(a.map(x => (x - m) ** 2))); };
  const fmt = v => (Math.abs(v) >= 1000 ? Math.round(v) : Math.round(v));

  /* ==================================================================
     TABLE 1
     ================================================================== */
  function cellHTML(cell, isOurs, rank) {
    if (!cell) return '<td class="num cell-na">n/a</td>';
    let cls = "num";
    if (isOurs) cls += " ours-cell";
    if (rank === 1) cls += " cell-best";
    else if (rank === 2) cls += " cell-second";
    const sup = cell.flag ? `<sup>${cell.flag}</sup>` : "";
    return `<td class="${cls}">${cell.m} &plusmn; ${cell.s}${sup}</td>`;
  }
  function ranks(cells) {
    // returns map idx->rank (1 best,2 second) over numeric values
    const vals = cells.map((c, i) => (c ? { i, m: c.m } : null)).filter(Boolean).sort((a, b) => b.m - a.m);
    const r = {};
    if (vals[0]) r[vals[0].i] = 1;
    if (vals[1] && vals[1].m !== (vals[0] && vals[0].m)) r[vals[1].i] = 2;
    else if (vals[1]) r[vals[1].i] = 2;
    return r;
  }
  function cellsHTML(row, highlight) {
    const rk = highlight ? ranks(row.d) : {};
    const tds = row.d.map((cell, i) => cellHTML(cell, M[i] === "ours", rk[i])).join("");
    const tgt = row.target == null ? '<td class="num cell-na">n/a</td>' : `<td class="num">${row.target}</td>`;
    return `<td>${row.task}</td>${tds}${tgt}`;
  }
  function rowHTML(row, highlight) {
    return `<tr data-task="${row.task}">${cellsHTML(row, highlight)}</tr>`;
  }
  function renderTable() {
    const tb = $("#table1 tbody");
    let html = "";
    GROUPS.forEach(g => {
      html += `<tr class="group-head"><td colspan="8">${g.name}</td></tr>`;
      g.rows.forEach(r => { html += rowHTML(r, true); });
      html += `<tr class="avg-row">${cellsHTML(g.avg, false)}</tr>`;
    });
    tb.innerHTML = html;
  }
  // sorting (within the flat list of task rows; keeps group heads + avgs pinned out)
  let sortState = { key: null, dir: 1 };
  function sortTable(key) {
    const dir = (sortState.key === key && sortState.dir === 1) ? -1 : 1;
    sortState = { key, dir };
    // flatten task rows across groups, sort, then re-render as a single sorted list
    const allRows = GROUPS.flatMap(g => g.rows);
    const getVal = (row) => {
      if (key === "task") return row.task;
      if (key === "target") return row.target == null ? -Infinity : row.target;
      const idx = M.indexOf(key === "tdmpc2c" ? "tdmpc2c" : key);
      const cell = row.d[idx];
      return cell ? cell.m : -Infinity;
    };
    allRows.sort((a, b) => {
      const va = getVal(a), vb = getVal(b);
      if (typeof va === "string") return dir * va.localeCompare(vb);
      return dir * (va - vb);
    });
    const tb = $("#table1 tbody");
    tb.innerHTML = `<tr class="group-head"><td colspan="8">Sorted by ${key === "tdmpc2c" ? "TD-M(PC)²" : (METHOD_LABEL[key] || key)} ${dir === 1 ? "▲" : "▼"} &middot; <a href="#" id="reset-sort">reset grouping</a></td></tr>`
      + allRows.map(r => rowHTML(r, true)).join("");
    // header indicators
    $$("#table1 th.sortable").forEach(th => {
      th.removeAttribute("aria-sort");
      const ic = th.querySelector("i");
      ic.className = "fas fa-sort";
      if (th.dataset.sort === key) {
        th.setAttribute("aria-sort", dir === 1 ? "ascending" : "descending");
        ic.className = dir === 1 ? "fas fa-sort-up" : "fas fa-sort-down";
      }
    });
    $("#reset-sort") && $("#reset-sort").addEventListener("click", e => { e.preventDefault(); sortState = { key: null, dir: 1 }; renderTable(); resetHeaders(); });
  }
  function resetHeaders() {
    $$("#table1 th.sortable").forEach(th => { th.removeAttribute("aria-sort"); th.querySelector("i").className = "fas fa-sort"; });
  }
  function wireTableSort() {
    $$("#table1 th.sortable").forEach(th => th.addEventListener("click", () => sortTable(th.dataset.sort)));
  }

  /* ==================================================================
     BAR CHART: final performance by task (from Table 1)
     ================================================================== */
  const TASK_INDEX = {}; // task -> {d, target}
  GROUPS.forEach(g => { g.rows.forEach(r => TASK_INDEX[r.task] = r); TASK_INDEX[g.avg.task] = g.avg; });

  function buildTaskSelect() {
    const sel = $("#task-select");
    const og = (label, rows) => {
      const o = document.createElement("optgroup"); o.label = label;
      rows.forEach(r => { const opt = document.createElement("option"); opt.value = r.task; opt.textContent = r.task; o.appendChild(opt); });
      sel.appendChild(o);
    };
    og("HumanoidBench: Locomotion", GROUPS[2].rows);
    og("HumanoidBench: Whole-Body Manipulation", GROUPS[1].rows);
    og("DMControl", GROUPS[0].rows);
    og("Averages", [GROUPS[2].avg, GROUPS[1].avg, GROUPS[0].avg]);
    sel.value = "balance-hard";
    sel.addEventListener("change", () => drawBar(sel.value));
  }

  function drawBar(task) {
    const row = TASK_INDEX[task];
    const mount = $("#bar-chart");
    mount.innerHTML = "";
    const W = 720, H = 360, PADL = 56, PADR = 18, PADT = 24, PADB = 64;
    const plotW = W - PADL - PADR, plotH = H - PADT - PADB;
    const present = M.map((m, i) => ({ m, i, cell: row.d[i] })).filter(o => o.cell);
    const maxData = Math.max(...present.map(o => o.cell.m + o.cell.s), row.target || 0);
    const yMax = Math.ceil(maxData / 100) * 100 || 100;
    const svg = sv("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": `Final performance on ${task}` });
    const y = v => PADT + plotH * (1 - v / yMax);

    // gridlines + y ticks
    const nTicks = 5;
    for (let t = 0; t <= nTicks; t++) {
      const val = yMax * t / nTicks, yy = y(val);
      svg.appendChild(sv("line", { class: "grid-line", x1: PADL, y1: yy, x2: W - PADR, y2: yy }));
      svg.appendChild(sv("text", { class: "tick-label", x: PADL - 8, y: yy + 3, "text-anchor": "end" }, String(Math.round(val))));
    }
    svg.appendChild(sv("line", { class: "axis-line", x1: PADL, y1: PADT, x2: PADL, y2: PADT + plotH }));
    svg.appendChild(sv("line", { class: "axis-line", x1: PADL, y1: PADT + plotH, x2: W - PADR, y2: PADT + plotH }));
    svg.appendChild(sv("text", { class: "axis-label", x: 16, y: PADT + plotH / 2, transform: `rotate(-90 16 ${PADT + plotH / 2})`, "text-anchor": "middle" }, "Total Average Return"));

    // target threshold
    if (row.target != null) {
      const ty = y(row.target);
      svg.appendChild(sv("line", { class: "threshold-line", x1: PADL, y1: ty, x2: W - PADR, y2: ty }));
      svg.appendChild(sv("text", { class: "threshold-label", x: W - PADR, y: ty - 5, "text-anchor": "end" }, `success threshold (${row.target})`));
    }

    // bars
    const n = present.length;
    const slot = plotW / n, bw = Math.min(64, slot * 0.62);
    present.forEach((o, k) => {
      const cx = PADL + slot * (k + 0.5);
      const bx = cx - bw / 2, by = y(o.cell.m), bh = PADT + plotH - by;
      const isOurs = o.m === "ours";
      svg.appendChild(sv("rect", {
        x: bx, y: by, width: bw, height: Math.max(0, bh), rx: 5,
        fill: METHOD_COLOR[o.m], opacity: isOurs ? 1 : 0.82
      }));
      // error bar
      if (o.cell.s > 0) {
        const yhi = y(o.cell.m + o.cell.s), ylo = y(Math.max(0, o.cell.m - o.cell.s));
        svg.appendChild(sv("line", { x1: cx, y1: yhi, x2: cx, y2: ylo, stroke: "#2a3142", "stroke-width": 1.4, opacity: 0.65 }));
        svg.appendChild(sv("line", { x1: cx - 5, y1: yhi, x2: cx + 5, y2: yhi, stroke: "#2a3142", "stroke-width": 1.4, opacity: 0.65 }));
        svg.appendChild(sv("line", { x1: cx - 5, y1: ylo, x2: cx + 5, y2: ylo, stroke: "#2a3142", "stroke-width": 1.4, opacity: 0.65 }));
      }
      // value label
      svg.appendChild(sv("text", { class: "bar-value", x: cx, y: y(o.cell.m + o.cell.s) - 6, "text-anchor": "middle", fill: isOurs ? "#e23b2e" : "#1a1f2b" }, String(o.cell.m)));
      // method label
      const lbl = sv("text", { class: "tick-label", x: cx, y: PADT + plotH + 16, "text-anchor": "middle", fill: isOurs ? "#e23b2e" : "#7b8499" });
      lbl.style.fontWeight = isOurs ? "700" : "400";
      lbl.appendChild(document.createTextNode(METHOD_LABEL[o.m]));
      svg.appendChild(lbl);
    });
    mount.appendChild(svg);

    // legend
    $("#bar-legend").innerHTML = present.map(o =>
      `<span class="legend-item"><span class="legend-swatch" style="background:${METHOD_COLOR[o.m]}"></span>${METHOD_LABEL[o.m]}</span>`
    ).join("");
  }

  /* ==================================================================
     ABLATION CURVES: precomputed smoothed/extrapolated TAR.
     Loads static/data/ablation_smoothed.json, produced by
     compute_results/dump_ablation_smoothed.py, which replicates the paper
     figures' exact smoothing (w=5 mean / 7 std) and seeded AR(1)
     extrapolation to 3M: so this chart matches the paper TAR panels.
     ================================================================== */
  const ABL_CAPTION = {
    balance_hard: "Multi-step TD is decisive on balance_hard: with one-step TD the agent stays near the baseline (zero success); an n=3 target lets the critic register an impending fall several steps early and reaches nonzero success. Curves are seed mean ±1 std, smoothed and extrapolated to 3M exactly as in the paper.",
    hurdle: "Terminal pessimism + return-weighted distillation matter on hurdle: enabling both raises TAR from 288 to 466 and yields nonzero success, while the digitized TD-M(PC)² baseline plateaus. Curves are seed mean ±1 std, smoothed and extrapolated to 3M exactly as in the paper."
  };
  let ablData = null;
  function drawCurves(task) {
    const render = () => {
      const mount = $("#ablation-chart"); mount.innerHTML = "";
      const t = ablData[task]; if (!t) return;
      const conds = t.conds;
      const W = 720, H = 360, PADL = 58, PADR = 18, PADT = 18, PADB = 50;
      const plotW = W - PADL - PADR, plotH = H - PADT - PADB;
      const xMax = t.xmax || 3.0;
      const dataMax = Math.max(...conds.flatMap(c => c.hi));
      const yMax = Math.max(Math.ceil(dataMax / 100) * 100, t.target ? Math.ceil(t.target / 100) * 100 : 0);
      const X = v => PADL + plotW * (v / xMax);
      const Y = v => PADT + plotH * (1 - v / yMax);
      const svg = sv("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": `Ablation curves for ${task}` });
      for (let i = 0; i <= 5; i++) { const val = yMax * i / 5, yy = Y(val);
        svg.appendChild(sv("line", { class: "grid-line", x1: PADL, y1: yy, x2: W - PADR, y2: yy }));
        svg.appendChild(sv("text", { class: "tick-label", x: PADL - 8, y: yy + 3, "text-anchor": "end" }, String(Math.round(val)))); }
      const xticks = 3;
      for (let i = 0; i <= xticks; i++) { const xv = xMax * i / xticks;
        svg.appendChild(sv("text", { class: "tick-label", x: X(xv), y: PADT + plotH + 16, "text-anchor": "middle" }, xv.toFixed(1) + "M")); }
      svg.appendChild(sv("line", { class: "axis-line", x1: PADL, y1: PADT, x2: PADL, y2: PADT + plotH }));
      svg.appendChild(sv("line", { class: "axis-line", x1: PADL, y1: PADT + plotH, x2: W - PADR, y2: PADT + plotH }));
      svg.appendChild(sv("text", { class: "axis-label", x: 15, y: PADT + plotH / 2, transform: `rotate(-90 15 ${PADT + plotH / 2})`, "text-anchor": "middle" }, "Episode return (TAR)"));
      svg.appendChild(sv("text", { class: "axis-label", x: PADL + plotW / 2, y: H - 6, "text-anchor": "middle" }, "Environment steps"));
      if (t.target) { const ty = Y(t.target);
        svg.appendChild(sv("line", { class: "threshold-line", x1: PADL, y1: ty, x2: W - PADR, y2: ty }));
        svg.appendChild(sv("text", { class: "threshold-label", x: W - PADR, y: ty - 5, "text-anchor": "end" }, `success threshold (${t.target})`)); }
      // bands then lines (array order: baseline, ablated, full last/on top)
      conds.forEach(c => {
        if (!c.x.length) return;
        const top = c.x.map((x, i) => `${X(x).toFixed(1)},${Y(c.hi[i]).toFixed(1)}`);
        const bot = c.x.map((x, i) => `${X(x).toFixed(1)},${Y(Math.max(0, c.lo[i])).toFixed(1)}`).reverse();
        svg.appendChild(sv("polygon", { points: top.concat(bot).join(" "), fill: c.color, opacity: 0.15 }));
      });
      conds.forEach(c => {
        if (!c.x.length) return;
        const d = "M" + c.x.map((x, i) => `${X(x).toFixed(1)},${Y(c.mean[i]).toFixed(1)}`).join(" L");
        svg.appendChild(sv("path", { d, fill: "none", stroke: c.color, "stroke-width": c.key === "full" ? 2.8 : 2, "stroke-dasharray": c.dotted ? "4 3" : "none", "stroke-linejoin": "round" }));
      });
      // hover guide + tooltip
      const guide = sv("line", { class: "curve-guide", x1: 0, y1: PADT, x2: 0, y2: PADT + plotH, opacity: 0 });
      svg.appendChild(guide);
      const overlay = sv("rect", { x: PADL, y: PADT, width: plotW, height: plotH, fill: "transparent", style: "cursor:crosshair" });
      overlay.addEventListener("mousemove", e => {
        const ctm = svg.getScreenCTM(); if (!ctm) return;
        const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
        const loc = pt.matrixTransform(ctm.inverse());
        let xM = (loc.x - PADL) / plotW * xMax; xM = Math.max(0, Math.min(xMax, xM));
        guide.setAttribute("x1", X(xM)); guide.setAttribute("x2", X(xM)); guide.setAttribute("opacity", 1);
        const rows = conds.filter(c => c.x.length).map(c => {
          let bi = 0; for (let i = 1; i < c.x.length; i++) if (Math.abs(c.x[i] - xM) < Math.abs(c.x[bi] - xM)) bi = i;
          return `<span style="color:${c.color}">&#9632;</span> ${c.label}: <b>${Math.round(c.mean[bi])}</b>`;
        });
        const tp = tip(); tp.style.display = "block";
        tp.innerHTML = `<div style="font-weight:700;margin-bottom:2px">${task} &middot; ${xM.toFixed(2)}M</div>` + rows.join("<br>");
        tp.style.left = e.pageX + "px"; tp.style.top = (e.pageY - 10) + "px";
      });
      overlay.addEventListener("mouseleave", () => { guide.setAttribute("opacity", 0); tip().style.display = "none"; });
      svg.appendChild(overlay);
      mount.appendChild(svg);
      $("#ablation-legend").innerHTML = conds.map(c =>
        `<span class="legend-item"><span class="legend-swatch" style="background:${c.color}"></span>${c.label}</span>`).join("");
      $("#ablation-caption").textContent = ABL_CAPTION[task] || "";
    };
    if (ablData) { render(); return; }
    fetch("./static/data/ablation_smoothed.json").then(r => r.json()).then(j => { ablData = j; render(); })
      .catch(() => {
        $("#ablation-chart").innerHTML = `<p class="chart-help has-text-centered">Curve data loads when the page is served over http(s) (e.g. <code>python3 -m http.server</code>) or on GitHub Pages.</p>`;
        $("#ablation-caption").textContent = ABL_CAPTION[task] || "";
        $("#ablation-legend").innerHTML = "";
      });
  }

  /* ==================================================================
     METHOD DIAGRAM (inline SVG)
     ================================================================== */
  function drawDiagram() {
    const mount = $("#method-diagram"); if (!mount) return;
    const W = 920, H = 340;
    const svg = sv("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": "TD-MPC loop and the bootstrap-bias bottleneck" });
    // defs: arrow markers
    const defs = sv("defs");
    const mk = (id, color) => { const m = sv("marker", { id, viewBox: "0 0 10 10", refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: "auto-start-reverse" }); m.appendChild(sv("path", { d: "M0,0 L10,5 L0,10 z", fill: color })); return m; };
    defs.appendChild(mk("arr", "#5b6472")); defs.appendChild(mk("arrR", "#e23b2e")); defs.appendChild(mk("arrG", "#19b27e"));
    svg.appendChild(defs);

    const box = (x, y, w, h, title, sub, accent) => {
      const g = sv("g");
      g.appendChild(sv("rect", { x, y, width: w, height: h, rx: 12, fill: "#fff", stroke: accent || "#d7dde8", "stroke-width": accent ? 2 : 1.4 }));
      const t = sv("text", { x: x + w / 2, y: y + (sub ? h / 2 - 4 : h / 2 + 4), "text-anchor": "middle", fill: "#1a1f2b" });
      t.style.font = "700 15px 'Google Sans',sans-serif"; t.appendChild(document.createTextNode(title)); g.appendChild(t);
      if (sub) { const s = sv("text", { x: x + w / 2, y: y + h / 2 + 15, "text-anchor": "middle", fill: "#5b6472" }); s.style.font = "400 11.5px 'Noto Sans',sans-serif"; s.appendChild(document.createTextNode(sub)); g.appendChild(s); }
      return g;
    };
    const edge = (x1, y1, x2, y2, color, marker, dash) => sv("path", { d: `M${x1},${y1} L${x2},${y2}`, fill: "none", stroke: color, "stroke-width": 2, "marker-end": `url(#${marker})`, "stroke-dasharray": dash || "none" });
    const label = (x, y, txt, color, anchor) => { const t = sv("text", { x, y, "text-anchor": anchor || "middle", fill: color || "#5b6472" }); t.style.font = "600 11px 'Noto Sans',sans-serif"; t.appendChild(document.createTextNode(txt)); return t; };
    const pill = (x, y, txt, color) => { const g = sv("g"); const w = txt.length * 6.6 + 18;
      g.appendChild(sv("rect", { x: x - w / 2, y: y - 11, width: w, height: 22, rx: 11, fill: color, opacity: .12 }));
      g.appendChild(sv("rect", { x: x - w / 2, y: y - 11, width: w, height: 22, rx: 11, fill: "none", stroke: color, "stroke-width": 1.2 }));
      const t = sv("text", { x, y: y + 4, "text-anchor": "middle", fill: color }); t.style.font = "700 11px 'Google Sans',sans-serif"; t.appendChild(document.createTextNode(txt)); g.appendChild(t); return g; };

    // nodes
    svg.appendChild(box(40, 56, 200, 72, "MPPI Planner", "+ world model", null));
    svg.appendChild(box(360, 56, 200, 72, "Replay Buffer", "planner transitions", null));
    svg.appendChild(box(680, 56, 200, 72, "Critic", "Q-ensemble + TD target", null));
    svg.appendChild(box(360, 236, 200, 72, "Actor  π", "policy-constrained", null));

    // edges (forward loop)
    svg.appendChild(edge(240, 92, 360, 92, "#5b6472", "arr"));
    svg.appendChild(label(300, 84, "collect"));
    svg.appendChild(edge(560, 92, 680, 92, "#5b6472", "arr"));
    svg.appendChild(label(620, 84, "TD learning"));
    // critic -> planner terminal value (curve over the top)
    svg.appendChild(sv("path", { d: "M780,56 C780,18 460,18 240,40", fill: "none", stroke: "#5b6472", "stroke-width": 2, "marker-end": "url(#arr)" }));
    svg.appendChild(label(500, 16, "terminal value  V_term"));
    // ATE pill on that edge
    svg.appendChild(pill(640, 30, "ATE  ·  uncertainty-aware", "#19b27e"));

    // critic -> actor (Q-max improvement)
    svg.appendChild(edge(720, 128, 520, 236, "#5b6472", "arr"));
    svg.appendChild(label(648, 196, "Q-max", "#5b6472", "start"));
    // actor -> critic bootstrap (RED, bottleneck 1)
    svg.appendChild(edge(560, 250, 760, 132, "#e23b2e", "arrR"));
    svg.appendChild(label(690, 232, "bootstrap at π(z′)", "#e23b2e", "middle"));
    svg.appendChild(pill(470, 178, "MTD  ·  multi-step target", "#19b27e"));

    // planner -> actor DIRECT distillation (GREEN)
    svg.appendChild(edge(140, 128, 360, 256, "#19b27e", "arrG", "6 5"));
    svg.appendChild(pill(210, 210, "Return-weighted distillation", "#19b27e"));

    // bottleneck markers
    const warn = (x, y, n) => { const g = sv("g");
      g.appendChild(sv("circle", { cx: x, cy: y, r: 12, fill: "#e23b2e" }));
      const t = sv("text", { x, y: y + 4, "text-anchor": "middle", fill: "#fff" }); t.style.font = "800 13px 'Google Sans'"; t.appendChild(document.createTextNode(n)); g.appendChild(t); return g; };
    svg.appendChild(warn(660, 196, "1"));
    svg.appendChild(warn(150, 182, "2"));

    mount.innerHTML = "";
    mount.appendChild(svg);
    const cap = document.createElement("p");
    cap.className = "chart-help has-text-centered";
    cap.style.marginTop = ".6rem";
    cap.innerHTML = "Gray = standard TD-MPC loop. <span style='color:#e23b2e;font-weight:700'>Red</span> = the two bootstrap-bias bottlenecks. <span style='color:#19b27e;font-weight:700'>Green</span> = where each of our three changes acts.";
    mount.appendChild(cap);
  }

  /* ==================================================================
     TABS, NAV, VIDEO PLACEHOLDERS
     ================================================================== */
  /* ----- per-task learning-curve explorer (small multiples from curves.json) ----- */
  let mainCurves = null;
  const mlabel = m => (mainCurves.meta.labels[m] || m).replace("$^2$", "²").replace(/\$/g, "");
  let curveTip = null;
  function tip() { if (!curveTip) { curveTip = document.createElement("div"); curveTip.className = "chart-tip"; curveTip.style.display = "none"; document.body.appendChild(curveTip); } return curveTip; }

  function buildCurveLegend(suite) {
    const meta = mainCurves.meta, tasks = mainCurves[suite];
    const used = [];
    meta.draw_order.forEach(m => { if (Object.values(tasks).some(t => t[m]) && !used.includes(m)) used.push(m); });
    let html = used.map(m => {
      const dotted = meta.colors[m] && mainCurves[suite] && Object.values(tasks).some(t => t[m] && t[m].dotted);
      const sw = dotted
        ? `<span class="legend-swatch" style="background:repeating-linear-gradient(90deg,${meta.colors[m]} 0 3px,transparent 3px 6px)"></span>`
        : `<span class="legend-swatch" style="background:${meta.colors[m]}"></span>`;
      const strong = m === "Ours" ? ' style="color:#c44e52;font-weight:700"' : "";
      return `<span class="legend-item"${strong}>${sw}${mlabel(m)}</span>`;
    }).join("");
    if (suite !== "dmc") html += `<span class="legend-item"><span class="legend-swatch" style="background:repeating-linear-gradient(90deg,#222 0 2px,transparent 2px 5px)"></span>Target (success threshold)</span>`;
    $("#curve-legend").innerHTML = html;
  }

  function drawCurvePanel(task, methods, suite) {
    const meta = mainCurves.meta;
    const W = 300, H = 210, PADL = 40, PADR = 12, PADT = 22, PADB = 28;
    const plotW = W - PADL - PADR, plotH = H - PADT - PADB;
    const xmaxM = meta.xlim[suite][1];
    const target = (suite !== "dmc") ? meta.targets[task] : undefined;
    // collect, clipped to xmax
    const series = {};
    meta.draw_order.forEach(m => {
      const c = methods[m]; if (!c) return;
      const pts = [];
      for (let i = 0; i < c.x.length; i++) { const xM = c.x[i] / 1e6; if (xM <= xmaxM + 1e-6) pts.push({ xM, m: c.mean[i], lo: c.lo[i], hi: c.hi[i] }); }
      if (pts.length) series[m] = { pts, dotted: c.dotted };
    });
    let top = 0;
    Object.values(series).forEach(s => s.pts.forEach(p => { if (p.hi > top) top = p.hi; }));
    if (target) top = Math.max(top, target);
    const yTop = top > 0 ? top * 1.12 : 1;
    const X = xM => PADL + plotW * (xM / xmaxM);
    const Y = v => PADT + plotH * (1 - v / yTop);
    const svg = sv("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": `${task} learning curves` });

    // y gridlines + ticks
    [0, 0.5, 1].forEach(f => { const val = yTop * f, yy = Y(val);
      svg.appendChild(sv("line", { class: "grid-line", x1: PADL, y1: yy, x2: W - PADR, y2: yy }));
      svg.appendChild(sv("text", { class: "tick-label", x: PADL - 5, y: yy + 3, "text-anchor": "end" }, String(Math.round(val)))); });
    // x ticks
    [0, xmaxM].forEach(xv => svg.appendChild(sv("text", { class: "tick-label", x: X(xv), y: PADT + plotH + 14, "text-anchor": xv === 0 ? "start" : "end" }, xv === 0 ? "0" : xv + "M")));
    svg.appendChild(sv("line", { class: "axis-line", x1: PADL, y1: PADT, x2: PADL, y2: PADT + plotH }));
    svg.appendChild(sv("line", { class: "axis-line", x1: PADL, y1: PADT + plotH, x2: W - PADR, y2: PADT + plotH }));

    // target line
    if (target) { const ty = Y(target);
      svg.appendChild(sv("line", { x1: PADL, y1: ty, x2: W - PADR, y2: ty, stroke: "#222", "stroke-width": 1.6, "stroke-dasharray": "1 2" }));
      svg.appendChild(sv("text", { class: "threshold-label", x: W - PADR, y: ty - 3, "text-anchor": "end" }, String(target))); }

    // bands then lines (draw_order; Ours last/on top)
    meta.draw_order.forEach(m => { const s = series[m]; if (!s || s.dotted) return;
      const flat = s.pts.every(p => Math.abs(p.hi - p.lo) < 1e-6); if (flat) return;
      const top_ = s.pts.map(p => `${X(p.xM).toFixed(1)},${Y(p.hi).toFixed(1)}`);
      const bot_ = s.pts.map(p => `${X(p.xM).toFixed(1)},${Y(Math.max(0, p.lo)).toFixed(1)}`).reverse();
      svg.appendChild(sv("polygon", { points: top_.concat(bot_).join(" "), fill: meta.colors[m], opacity: 0.13 })); });
    meta.draw_order.forEach(m => { const s = series[m]; if (!s) return;
      const d = "M" + s.pts.map(p => `${X(p.xM).toFixed(1)},${Y(p.m).toFixed(1)}`).join(" L");
      svg.appendChild(sv("path", { d, fill: "none", stroke: meta.colors[m], "stroke-width": m === "Ours" ? 2.4 : 1.4, "stroke-dasharray": s.dotted ? "2 2" : "none", "stroke-linejoin": "round" })); });

    // title
    svg.appendChild(sv("text", { class: "panel-title", x: PADL - 2, y: 14 }, task));

    // hover guide + overlay
    const guide = sv("line", { class: "curve-guide", x1: 0, y1: PADT, x2: 0, y2: PADT + plotH, opacity: 0 });
    svg.appendChild(guide);
    const overlay = sv("rect", { x: PADL, y: PADT, width: plotW, height: plotH, fill: "transparent", style: "cursor:crosshair" });
    const onMove = (e) => {
      const ctm = svg.getScreenCTM(); if (!ctm) return;
      const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
      const loc = pt.matrixTransform(ctm.inverse());
      let xM = (loc.x - PADL) / plotW * xmaxM; xM = Math.max(0, Math.min(xmaxM, xM));
      guide.setAttribute("x1", X(xM)); guide.setAttribute("x2", X(xM)); guide.setAttribute("opacity", 1);
      const rows = meta.draw_order.filter(m => series[m]).map(m => {
        const p = series[m].pts.reduce((a, b) => Math.abs(b.xM - xM) < Math.abs(a.xM - xM) ? b : a);
        return `<span style="color:${meta.colors[m]}">&#9632;</span> ${mlabel(m)}: <b>${Math.round(p.m)}</b>`;
      });
      const t = tip(); t.style.display = "block";
      t.innerHTML = `<div style="font-weight:700;margin-bottom:2px">${task} &middot; ${xM.toFixed(2)}M</div>` + rows.join("<br>");
      t.style.left = e.pageX + "px"; t.style.top = (e.pageY - 10) + "px";
    };
    overlay.addEventListener("mousemove", onMove);
    overlay.addEventListener("mouseleave", () => { guide.setAttribute("opacity", 0); tip().style.display = "none"; });
    svg.appendChild(overlay);
    return svg;
  }

  function renderCurveGrid(suite) {
    const grid = $("#curve-grid"); if (!grid || !mainCurves) return;
    buildCurveLegend(suite);
    grid.innerHTML = "";
    mainCurves.meta.task_order[suite].forEach(task => {
      const methods = mainCurves[suite][task]; if (!methods) return;
      const panel = document.createElement("div"); panel.className = "curve-panel";
      panel.appendChild(drawCurvePanel(task, methods, suite));
      grid.appendChild(panel);
    });
  }

  function loadMainCurves() {
    const grid = $("#curve-grid"); if (!grid) return;
    grid.innerHTML = '<div class="curve-loading">Loading curves&hellip;</div>';
    fetch("./static/data/curves.json").then(r => r.json()).then(j => { mainCurves = j; renderCurveGrid("loco"); })
      .catch(() => { grid.innerHTML = '<div class="curve-loading">Curve data loads when served over http(s) (<code>python3 -m http.server</code>) or on GitHub Pages.</div>'; });
  }

  function wireCurveTabs() {
    const tabs = $("#curve-tabs"); if (!tabs) return;
    $$("li", tabs).forEach(li => li.addEventListener("click", () => {
      $$("li", tabs).forEach(x => x.classList.remove("is-active"));
      li.classList.add("is-active");
      renderCurveGrid(li.dataset.suite);
    }));
  }
  function wireAblationTabs() {
    const tabs = $("#ablation-tabs"); if (!tabs) return;
    $$("li", tabs).forEach(li => li.addEventListener("click", () => {
      $$("li", tabs).forEach(x => x.classList.remove("is-active"));
      li.classList.add("is-active");
      drawCurves(li.dataset.abl);
    }));
  }
  function wireNav() {
    const burger = $(".navbar-burger");
    if (burger) burger.addEventListener("click", () => {
      burger.classList.toggle("is-active");
      $("#" + burger.dataset.target).classList.toggle("is-active");
    });
    $$('a[data-anon-link]').forEach(a => a.addEventListener("click", e => {
      if (a.getAttribute("href") === "#") { e.preventDefault(); }
    }));
  }
  // Wrap gallery items in a duplicated track for a seamless auto-scroll marquee.
  function wireGallery() {
    const strip = $("#rollout-strip"); if (!strip) return;
    const items = $$(".strip-item", strip);
    if (!items.length) return;
    const track = document.createElement("div");
    track.className = "strip-track";
    items.forEach(it => track.appendChild(it));
    // clone once for seamless loop
    track.querySelectorAll(".strip-item").forEach(it => track.appendChild(it.cloneNode(true)));
    strip.appendChild(track);
  }

  // Reveal real videos: if a <video> can load data, drop the placeholder flag.
  function wireVideoPlaceholders() {
    $$("video").forEach(v => {
      v.addEventListener("loadeddata", () => {
        if (v.readyState >= 2 && v.videoWidth > 0) {
          const frame = v.closest("[data-placeholder]");
          if (frame) frame.removeAttribute("data-placeholder");
        }
      });
      // trigger load attempt
      try { v.load(); } catch (e) {}
    });
  }

  /* ==================================================================
     MATCHED-BUDGET TABLE (Appendix: vanilla TD-M(PC)^2 rerun at <=3M)
     ================================================================== */
  // pub = plot-digitized 2M readout (*), base = vanilla 3M rerun, ours = full method 3M
  const MATCHED = [
    { task: "balance-simple", pub: [512, 151], base: [599, 389], ours: [765, 176], dours: 166, d3m: 87,  target: 800 },
    { task: "stand",          pub: [951, 4],   base: [927, 48],  ours: [933, 3],   dours: 6,   d3m: -24, target: 800 },
    { task: "slide",          pub: [868, 68],  base: [902, 24],  ours: [910, 7],   dours: 8,   d3m: 34,  target: 700 },
    { task: "balance-hard",   pub: [81, 5],    base: [98, 18],   ours: [387, 255], dours: 289, d3m: 17,  target: 800 },
    { task: "maze",           pub: [355, 4],   base: [347, 9],   ours: [353, 3],   dours: 6,   d3m: -8,  target: 1200 },
    { task: "stair",          pub: [479, 207], base: [387, 110], ours: [461, 12],  dours: 74,  d3m: -92, target: 700 },
    { task: "hurdle",         pub: [192, 32],  base: [199, 13],  ours: [466, 200], dours: 267, d3m: 7,   target: 700 },
    { task: "pole",           pub: [805, 115], base: [874, 124], ours: [879, 49],  dours: 5,   d3m: 69,  target: 700 }
  ];
  const MATCHED_AVG = { task: "Avg.", pub: [530, null], base: [542, null], ours: [644, null], dours: 102, d3m: 12, target: 800 };
  let matchedSort = { key: null, dir: 1 };
  const valCell = (a, ours) => `<td class="num${ours ? " ours-cell" : ""}">${a[1] == null ? a[0] : a[0] + " &plusmn; " + a[1]}</td>`;
  const pubCell = (a) => `<td class="num">${a[1] == null ? a[0] : a[0] + " &plusmn; " + a[1]}<sup>*</sup></td>`;
  const deltaCell = (v) => `<td class="num ${v >= 0 ? "delta-pos" : "delta-neg"}">${v >= 0 ? "+" + v : "−" + Math.abs(v)}</td>`;
  function matchedRowHTML(r, isAvg) {
    const tgt = r.target == null ? '<td class="num cell-na">n/a</td>' : `<td class="num">${r.target}</td>`;
    return `<tr${isAvg ? ' class="avg-row"' : ""}><td>${r.task}</td>${pubCell(r.pub)}${valCell(r.base)}${valCell(r.ours, true)}${deltaCell(r.dours)}${deltaCell(r.d3m)}${tgt}</tr>`;
  }
  function mval(r, k) {
    if (k === "task") return r.task;
    if (k === "target") return r.target == null ? -Infinity : r.target;
    if (k === "dours" || k === "d3m") return r[k];
    return r[k][0]; // pub/base/ours
  }
  function renderMatched() {
    const tb = $("#matched-table tbody"); if (!tb) return;
    let rows = MATCHED.slice();
    if (matchedSort.key) {
      const k = matchedSort.key, dir = matchedSort.dir;
      rows.sort((a, b) => {
        const va = mval(a, k), vb = mval(b, k);
        return typeof va === "string" ? dir * va.localeCompare(vb) : dir * (va - vb);
      });
    }
    tb.innerHTML = rows.map(r => matchedRowHTML(r, false)).join("") + matchedRowHTML(MATCHED_AVG, true);
    $$("#matched-table th.sortable").forEach(th => {
      const ic = th.querySelector("i"); ic.className = "fas fa-sort"; th.removeAttribute("aria-sort");
      if (th.dataset.mkey === matchedSort.key) {
        th.setAttribute("aria-sort", matchedSort.dir === 1 ? "ascending" : "descending");
        ic.className = matchedSort.dir === 1 ? "fas fa-sort-up" : "fas fa-sort-down";
      }
    });
  }
  function wireMatchedSort() {
    $$("#matched-table th.sortable").forEach(th => th.addEventListener("click", () => {
      const k = th.dataset.mkey;
      matchedSort = { key: k, dir: (matchedSort.key === k && matchedSort.dir === 1) ? -1 : 1 };
      renderMatched();
    }));
  }

  /* ==================================================================
     LEAVE-ONE-OUT COMPONENT-DROP CHART
     ================================================================== */
  function drawLooDrops() {
    const mount = $("#loo-drop-chart"); if (!mount) return;
    const comps = ["Δ multi‑step TD", "Δ adaptive terminal", "Δ distillation"];
    const series = [
      { task: "balance-hard", color: "#e23b2e", vals: [255, 181, 115] },
      { task: "hurdle",       color: "#2747a6", vals: [-64, 166, 234] }
    ];
    const W = 720, H = 340, PADL = 58, PADR = 18, PADT = 22, PADB = 56;
    const plotW = W - PADL - PADR, plotH = H - PADT - PADB;
    const all = series.flatMap(s => s.vals);
    let yMax = Math.ceil(Math.max(...all) / 50) * 50;
    let yMin = Math.min(0, Math.floor(Math.min(...all) / 50) * 50);
    const Y = v => PADT + plotH * (1 - (v - yMin) / (yMax - yMin));
    const svg = sv("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": "Component drop by task" });
    // gridlines + y ticks
    const nT = 5;
    for (let t = 0; t <= nT; t++) {
      const val = yMin + (yMax - yMin) * t / nT, yy = Y(val);
      svg.appendChild(sv("line", { class: "grid-line", x1: PADL, y1: yy, x2: W - PADR, y2: yy }));
      svg.appendChild(sv("text", { class: "tick-label", x: PADL - 8, y: yy + 3, "text-anchor": "end" }, String(Math.round(val))));
    }
    svg.appendChild(sv("line", { class: "axis-line", x1: PADL, y1: PADT, x2: PADL, y2: PADT + plotH }));
    // zero baseline emphasized
    svg.appendChild(sv("line", { x1: PADL, y1: Y(0), x2: W - PADR, y2: Y(0), stroke: "#9aa6bd", "stroke-width": 1.4 }));
    svg.appendChild(sv("text", { class: "axis-label", x: 15, y: PADT + plotH / 2, transform: `rotate(-90 15 ${PADT + plotH / 2})`, "text-anchor": "middle" }, "TAR drop  (Full − w/o X)"));
    const groupW = plotW / comps.length, bw = Math.min(50, groupW * 0.28);
    comps.forEach((cname, g) => {
      const gx = PADL + groupW * (g + 0.5);
      series.forEach((s, i) => {
        const v = s.vals[g];
        const cx = gx + (i - 0.5) * (bw + 8);
        const y0 = Y(0), yv = Y(v);
        const by = Math.min(y0, yv), bh = Math.abs(yv - y0);
        svg.appendChild(sv("rect", { x: cx - bw / 2, y: by, width: bw, height: Math.max(1, bh), rx: 4, fill: s.color, opacity: v >= 0 ? 0.9 : 0.5 }));
        svg.appendChild(sv("text", { class: "bar-value", x: cx, y: v >= 0 ? yv - 6 : yv + 14, "text-anchor": "middle", fill: v >= 0 ? "#1a1f2b" : "#c0392b" }, (v >= 0 ? "+" : "−") + Math.abs(v)));
      });
      svg.appendChild(sv("text", { class: "loo-cat", x: gx, y: PADT + plotH + 22, "text-anchor": "middle" }, cname));
    });
    mount.innerHTML = ""; mount.appendChild(svg);
    $("#loo-drop-legend").innerHTML = series.map(s =>
      `<span class="legend-item"><span class="legend-swatch" style="background:${s.color}"></span>${s.task}</span>`).join("");
  }

  /* ==================================================================
     REAL-ROBOT DEMO SWITCHER (top showcase): lazy side-by-side pairs.
     Ours succeeds; the TD-M(PC)^2 baseline times out on the same trial.
     ================================================================== */
  const RR_BASE = "./static/videos/real/";
  // baseOutcome: 'timeout' (baseline fails) for w5/w3; 'success' for w1 where both methods insert.
  const RR_DEMOS = [
    // w5 order requested: old video 2 (front-center) first, then video 3 (front-right), then video 1 (front-left).
    { size: 5, pose: "front-center", baseOutcome: "timeout", ours: "2-ours-front-center-insertion-w5.mp4",  base: "2-vanilla-front-center-insertion-w5.mp4" },
    { size: 5, pose: "front-right",  baseOutcome: "timeout", ours: "3-ours-front-right-insertion-w5.mp4",   base: "3-vanilla-front-right-insertion-w5.mp4" },
    { size: 5, pose: "front-left",   baseOutcome: "timeout", ours: "1-ours-front-left-insertion-w5.mp4",    base: "1-vanilla-front-left-insertion-w5.mp4" },
    { size: 3, pose: "center",       baseOutcome: "timeout", ours: "1-ours-center-center-insertion-w3.mp4", base: "1-vanilla-center-center-insertion-w3.mp4" },
    { size: 3, pose: "back-center",  baseOutcome: "timeout", ours: "2-ours-back-center-insertion-w3.mp4",   base: "2-vanilla-back-center-insertion-w3.mp4" },
    { size: 1, pose: "center",       baseOutcome: "success", ours: "1-ours-center-center-insertion-w1.mp4", base: "1-vanilla-center-center-insertion-w1.mp4" }
  ];
  function rrSelect(i) {
    const d = RR_DEMOS[i]; if (!d) return;
    const o = $("#rr-ours"), b = $("#rr-base"); if (!o || !b) return;
    o.src = RR_BASE + d.ours; b.src = RR_BASE + d.base;
    o.load(); b.load();
    const play = v => { const p = v.play(); if (p && p.catch) p.catch(() => {}); };
    play(o); play(b);
    const badge = $("#rr-base-badge");
    if (badge) {
      if (d.baseOutcome === "success") {
        badge.className = "compare-badge is-base-ok";
        badge.innerHTML = '<i class="fas fa-check-circle"></i>&nbsp;TD-M(PC)<sup>2</sup> baseline &middot; also succeeds';
      } else {
        badge.className = "compare-badge is-base";
        badge.innerHTML = '<i class="fas fa-times-circle"></i>&nbsp;TD-M(PC)<sup>2</sup> baseline &middot; times out';
      }
    }
    const dist = d.size === 5 ? "wrench size 5: matches the simulation training distribution (in-distribution)"
               : d.size === 3 ? "wrench size 3: unseen during training (generalization)"
                              : "wrench size 1: the smallest, hardest unseen size (generalization)";
    const outcome = d.baseOutcome === "success"
      ? "In this trial both our policy and the TD-M(PC)² baseline complete the insertion (size 1 is the hardest unseen size: see overall per-size success rates below)."
      : "Our policy completes the insertion; the TD-M(PC)² baseline runs to the time limit without inserting.";
    const cap = $("#rr-caption");
    if (cap) cap.innerHTML = `<b>Wrench-into-nut insertion</b> &middot; video ${i + 1} &middot; ${dist}. ${outcome}`;
    $$("#rr-switch .rr-chip").forEach(c => c.classList.toggle("is-active", +c.dataset.idx === i));
  }
  function wireRealDemos() {
    const sw = $("#rr-switch"); if (!sw) return;
    $$(".rr-chip", sw).forEach(c => c.addEventListener("click", () => rrSelect(+c.dataset.idx)));
    rrSelect(0);
  }

  /* ==================================================================
     LIGHTBOX: click any img.zoomable to expand it full-screen.
     ================================================================== */
  function wireLightbox() {
    const imgs = $$("img.zoomable");
    if (!imgs.length) return;
    const ov = document.createElement("div");
    ov.className = "lightbox";
    ov.innerHTML = '<span class="lb-hint">click anywhere or press Esc to close</span><img alt="">';
    document.body.appendChild(ov);
    const big = ov.querySelector("img");
    const close = () => ov.classList.remove("is-open");
    ov.addEventListener("click", close);
    document.addEventListener("keydown", e => { if (e.key === "Escape") close(); });
    imgs.forEach(im => im.addEventListener("click", () => {
      big.src = im.currentSrc || im.src;
      big.alt = im.alt || "";
      ov.classList.add("is-open");
    }));
  }

  /* -------------------- init -------------------- */
  document.addEventListener("DOMContentLoaded", () => {
    renderTable();
    wireTableSort();
    buildTaskSelect();
    drawBar("balance-hard");
    drawDiagram();
    drawCurves("balance_hard");
    loadMainCurves();
    wireCurveTabs();
    wireAblationTabs();
    renderMatched();
    wireMatchedSort();
    drawLooDrops();
    wireNav();
    wireGallery();
    wireVideoPlaceholders();
    wireRealDemos();
    wireLightbox();
  });
})();
