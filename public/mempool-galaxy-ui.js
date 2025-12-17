// The Mempool Galaxy UI (vanilla JS, no libs)
// High-tech rotatable 3D wireframe network, "Etherscan Visualizer" theme.

export function startMempoolGalaxy({ canvas, fpsEl, panelEl, closePanelEl, toastEl, placeholders }) {
  const ctx = canvas.getContext("2d", { alpha: false });
  const DPR = Math.max(1, Math.min(2.5, window.devicePixelRatio || 1));

  const state = {
    w: 0, h: 0,
    t: 0,
    dragging: false,
    lastX: 0, lastY: 0,
    rotY: 0.4,
    rotX: -0.25,
    velY: 0,
    velX: 0,
    hoverId: null,
    selectedId: null,
    lastFrame: performance.now(),
    fps: 0,
    toastTimer: 0,
  };

  const theme = {
    bg0: "#070A12",
    bg1: "#0B1020",
    etherBlue: "#0C1B3A",
    glowPurple: "rgba(147,51,234,1)",
    glowPurpleSoft: "rgba(147,51,234,0.22)",
    neonCyan: "rgba(110,231,255,0.95)",
    neonCyanSoft: "rgba(110,231,255,0.18)",
    danger: "rgba(255,77,77,1)",
  };

  // Demo data (production-ready structure; replace with real Farcaster graph later)
  // You = central node. Friends = satellites.
  const YOU = {
    id: "you",
    address: "0xYOU…NODE",
    handle: "@you",
    bio: "You are the validator of your social chain.",
    spam: false,
    congested: false,
  };

  const friends = [
    { id: "a", address: "0xA1b2…c3D4", handle: "@orbital", bio: "Shipped 3 miniapps. Loves indexers.", spam: false, congested: false },
    { id: "b", address: "0xBEEF…F00D", handle: "@packetloss", bio: "Bandwidth maximalist. Builds graph tooling.", spam: false, congested: false },
    { id: "c", address: "0xC0FF…EE00", handle: "@congested", bio: "Engagement bait detected. High duplication.", spam: true, congested: true },
    { id: "d", address: "0xDADA…BABA", handle: "@purplewire", bio: "Designs in dark mode. Neon everything.", spam: false, congested: false },
    { id: "e", address: "0xE1E1…E1E1", handle: "@gasguzzler", bio: "Posts often. Sometimes too often.", spam: true, congested: true },
    { id: "f", address: "0xF00D…CAFE", handle: "@blockheader", bio: "Bio reads like a header. Always.", spam: false, congested: false },
    { id: "g", address: "0x1234…5678", handle: "@satellite", bio: "Quiet builder. Strong signal.", spam: false, congested: false },
    { id: "h", address: "0x90AB…CDEF", handle: "@relay", bio: "Bridges communities. Low latency.", spam: false, congested: false },
    { id: "i", address: "0xAAAA…0001", handle: "@mempool", bio: "Watches the mempool. Sees everything.", spam: false, congested: false },
  ];

  // Bandwidth weights (thicker lines = more interaction)
  const edges = friends.map((f, idx) => ({
    a: "you",
    b: f.id,
    w: [0.92, 0.65, 0.22, 0.78, 0.28, 0.56, 0.88, 0.40, 0.72][idx] || 0.5,
  }));

  // Add some friend-friend links for mesh feel
  const extraLinks = [
    ["a","d",0.34], ["a","f",0.42], ["b","h",0.38], ["d","i",0.30], ["g","h",0.26], ["f","i",0.44],
    ["b","d",0.22], ["a","i",0.18], ["h","i",0.20],
  ].map(([a,b,w]) => ({ a, b, w }));

  const nodes = [YOU, ...friends].map((n) => ({ ...n, x:0, y:0, z:0, sx:0, sy:0, r:0, depth:0 }));

  const nodeById = new Map(nodes.map(n => [n.id, n]));

  // Layout on a sphere around you
  function seedPositions() {
    const R = 1.0;
    const ring = friends.length;
    for (let i=0;i<nodes.length;i++) {
      const n = nodes[i];
      if (n.id === "you") { n.x = 0; n.y = 0; n.z = 0; continue; }
      const k = i-1;
      const ang = (k / Math.max(1, ring)) * Math.PI * 2;
      const elev = (Math.sin(ang*1.7) * 0.45) + (Math.cos(ang*0.9) * 0.10);
      const rad = R * (0.75 + 0.20*Math.sin(k*2.1));
      n.x = Math.cos(ang) * rad;
      n.z = Math.sin(ang) * rad;
      n.y = elev;
    }
  }

  seedPositions();

  function resize() {
    const rect = canvas.getBoundingClientRect();
    state.w = Math.max(1, Math.floor(rect.width));
    state.h = Math.max(1, Math.floor(rect.height));
    canvas.width = Math.floor(state.w * DPR);
    canvas.height = Math.floor(state.h * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  window.addEventListener("resize", resize);
  resize();

  // Input: drag to rotate; tap to open header
  function onDown(e) {
    state.dragging = true;
    state.lastX = e.clientX;
    state.lastY = e.clientY;
    state.velX = 0;
    state.velY = 0;
  }
  function onMove(e) {
    if (!state.dragging) {
      // hover (desktop)
      const hit = pickNode(e.clientX, e.clientY);
      state.hoverId = hit ? hit.id : null;
      return;
    }
    const dx = e.clientX - state.lastX;
    const dy = e.clientY - state.lastY;
    state.lastX = e.clientX;
    state.lastY = e.clientY;

    const k = 0.006;
    state.rotY += dx * k;
    state.rotX += dy * k;
    state.rotX = Math.max(-1.2, Math.min(1.2, state.rotX));

    state.velY = dx * k;
    state.velX = dy * k;
  }
  function onUp(e) {
    const wasDragging = state.dragging;
    state.dragging = false;

    // tap detection: small movement
    if (wasDragging) {
      const hit = pickNode(e.clientX, e.clientY);
      if (hit) openHeader(hit);
    }
  }

  canvas.addEventListener("pointerdown", (e) => { canvas.setPointerCapture(e.pointerId); onDown(e); });
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", () => { state.dragging = false; });

  closePanelEl.addEventListener("click", () => closeHeader());
  panelEl.addEventListener("click", (e) => {
    // click outside to close
    if (e.target === panelEl) closeHeader();
  });

  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(() => toastEl.classList.remove("show"), 1800);
  }

  // 3D rotation helpers
  function rotX(p, a) {
    const c = Math.cos(a), s = Math.sin(a);
    return { x: p.x, y: p.y*c - p.z*s, z: p.y*s + p.z*c };
  }
  function rotY(p, a) {
    const c = Math.cos(a), s = Math.sin(a);
    return { x: p.x*c + p.z*s, y: p.y, z: -p.x*s + p.z*c };
  }

  function project(p) {
    // perspective projection
    const fov = 1.8;
    const z = p.z + 2.6;
    const scale = fov / Math.max(0.2, z);
    const x = (p.x * scale) * (Math.min(state.w, state.h) * 0.42) + state.w/2;
    const y = (p.y * scale) * (Math.min(state.w, state.h) * 0.42) + state.h/2;
    return { x, y, scale, z };
  }

  function computeScreen() {
    for (const n of nodes) {
      const p1 = rotX({ x:n.x, y:n.y, z:n.z }, state.rotX);
      const p2 = rotY(p1, state.rotY);
      const pr = project(p2);
      n.sx = pr.x;
      n.sy = pr.y;
      n.depth = pr.z;
      n.r = (n.id === "you" ? 22 : 14) * pr.scale + (n.congested ? 2.5 : 0);
    }
    nodes.sort((a,b) => b.depth - a.depth); // far to near for drawing lines behind nodes
  }

  function pickNode(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    // pick nearest hit (front-most)
    let best = null;
    let bestD = Infinity;
    for (const n of nodes) {
      const dx = x - n.sx;
      const dy = y - n.sy;
      const d = Math.hypot(dx, dy);
      if (d <= Math.max(10, n.r + 8) && d < bestD) {
        best = n;
        bestD = d;
      }
    }
    return best;
  }

  function openHeader(n) {
    state.selectedId = n.id;

    const bandwidth = n.id === "you"
      ? "∞ (central validator)"
      : Math.round((edgeWeight("you", n.id) || 0) * 100) + " units";

    placeholders.address.textContent = n.address;
    placeholders.handle.textContent = n.handle;
    placeholders.bio.textContent = n.bio;
    placeholders.bandwidth.textContent = bandwidth;
    placeholders.status.textContent = n.congested ? "CONGESTED (spammy node)" : "CLEAR (normal flow)";

    panelEl.classList.add("open");
  }

  function closeHeader() {
    panelEl.classList.remove("open");
    state.selectedId = null;
  }

  function edgeWeight(a, b) {
    for (const e of edges) if ((e.a===a && e.b===b) || (e.a===b && e.b===a)) return e.w;
    for (const e of extraLinks) if ((e.a===a && e.b===b) || (e.a===b && e.b===a)) return e.w;
    return 0;
  }

  // Render
  function drawBackground() {
    // base gradient
    ctx.fillStyle = theme.bg0;
    ctx.fillRect(0,0,state.w,state.h);

    const g = ctx.createRadialGradient(state.w*0.5, state.h*0.28, 10, state.w*0.5, state.h*0.28, Math.max(state.w,state.h)*0.75);
    g.addColorStop(0, "rgba(147,51,234,0.10)");
    g.addColorStop(0.35, "rgba(110,231,255,0.06)");
    g.addColorStop(1, "rgba(7,10,18,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0,0,state.w,state.h);

    // subtle scanlines
    ctx.globalAlpha = 0.07;
    ctx.fillStyle = "#ffffff";
    for (let y=0;y<state.h;y+=4) ctx.fillRect(0,y,state.w,1);
    ctx.globalAlpha = 1;
  }

  function drawEdges() {
    const allEdges = [...edges, ...extraLinks];
    for (const e of allEdges) {
      const a = nodeById.get(e.a);
      const b = nodeById.get(e.b);
      if (!a || !b) continue;

      const w = 1 + Math.round(e.w * 7);
      const isHot = (a.congested || b.congested);
      const isSelected = (state.selectedId && (state.selectedId === a.id || state.selectedId === b.id));

      ctx.save();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // glow
      ctx.shadowBlur = isHot ? 22 : 18;
      ctx.shadowColor = isHot ? "rgba(255,77,77,0.9)" : "rgba(147,51,234,0.85)";

      ctx.globalAlpha = isSelected ? 0.95 : 0.55;
      ctx.strokeStyle = isHot ? "rgba(255,77,77,0.75)" : "rgba(147,51,234,0.65)";
      ctx.lineWidth = w;

      ctx.beginPath();
      ctx.moveTo(a.sx, a.sy);
      ctx.lineTo(b.sx, b.sy);
      ctx.stroke();

      // inner wire
      ctx.shadowBlur = 0;
      ctx.globalAlpha = isSelected ? 0.95 : 0.45;
      ctx.strokeStyle = isHot ? "rgba(255,120,120,0.9)" : "rgba(110,231,255,0.35)";
      ctx.lineWidth = Math.max(1, w-2);

      ctx.beginPath();
      ctx.moveTo(a.sx, a.sy);
      ctx.lineTo(b.sx, b.sy);
      ctx.stroke();

      ctx.restore();
    }
  }

  function drawNodes() {
    for (const n of nodes) {
      const pulse = n.congested ? (0.6 + 0.4*Math.sin(state.t*0.006 + n.sx*0.01)) : 0;
      const isHover = (state.hoverId === n.id);
      const isSelected = (state.selectedId === n.id);

      // outer glow ring
      ctx.save();
      ctx.shadowBlur = n.congested ? 28 : 20;
      ctx.shadowColor = n.congested ? "rgba(255,77,77,0.9)" : "rgba(147,51,234,0.85)";
      ctx.globalAlpha = n.congested ? (0.55 + 0.25*pulse) : 0.35;

      ctx.strokeStyle = n.congested ? "rgba(255,77,77,0.55)" : "rgba(147,51,234,0.40)";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(n.sx, n.sy, n.r + 10 + (n.congested ? 6*pulse : 0), 0, Math.PI*2);
      ctx.stroke();

      // core
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;

      // fill
      const grd = ctx.createRadialGradient(n.sx - n.r*0.3, n.sy - n.r*0.3, 2, n.sx, n.sy, n.r*1.6);
      grd.addColorStop(0, "rgba(24,40,80,1)");
      grd.addColorStop(0.55, "rgba(11,16,32,1)");
      grd.addColorStop(1, "rgba(7,10,18,1)");
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(n.sx, n.sy, n.r + (isHover ? 2 : 0), 0, Math.PI*2);
      ctx.fill();

      // outline
      ctx.strokeStyle = n.congested ? "rgba(255,120,120,0.95)" : "rgba(110,231,255,0.72)";
      ctx.lineWidth = isSelected ? 4 : 3;
      ctx.beginPath();
      ctx.arc(n.sx, n.sy, n.r + (isHover ? 2 : 0), 0, Math.PI*2);
      ctx.stroke();

      // label (only if selected/hover and not too busy)
      if (isSelected || (isHover && n.id !== "you")) {
        ctx.font = "12px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial";
        ctx.fillStyle = "rgba(220,232,255,0.92)";
        ctx.shadowBlur = 16;
        ctx.shadowColor = n.congested ? "rgba(255,77,77,0.8)" : "rgba(147,51,234,0.7)";
        const text = n.handle;
        const pad = 7;
        const tw = ctx.measureText(text).width;
        const bx = n.sx - tw/2 - pad;
        const by = n.sy + n.r + 10;
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = "rgba(10,14,26,0.72)";
        roundRect(ctx, bx, by, tw + pad*2, 22, 10);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
        ctx.fillStyle = "rgba(220,232,255,0.92)";
        ctx.fillText(text, n.sx - tw/2, by + 15);
      }

      ctx.restore();
    }
  }

  function roundRect(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x+r, y);
    c.arcTo(x+w, y, x+w, y+h, r);
    c.arcTo(x+w, y+h, x, y+h, r);
    c.arcTo(x, y+h, x, y, r);
    c.arcTo(x, y, x+w, y, r);
    c.closePath();
  }

  function animate(now) {
    const dt = Math.max(0.001, now - state.lastFrame);
    state.lastFrame = now;
    state.t = now;

    // fps
    state.fps = 1000 / dt;
    if (fpsEl) fpsEl.textContent = `${Math.round(state.fps)} fps`;

    // inertia
    if (!state.dragging) {
      state.rotY += state.velY;
      state.rotX += state.velX;
      state.velY *= 0.92;
      state.velX *= 0.92;
      if (Math.abs(state.velY) < 0.00001) state.velY = 0;
      if (Math.abs(state.velX) < 0.00001) state.velX = 0;
      state.rotX = Math.max(-1.2, Math.min(1.2, state.rotX));
    }

    computeScreen();
    drawBackground();
    drawEdges();
    drawNodes();

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);

  // Small first-run toast
  setTimeout(() => showToast("Drag to rotate. Tap a node to view its block header."), 450);
}
