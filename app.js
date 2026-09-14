"use strict";

// Shared helpers and application state
const { seed, metrics, sell, publish, answer, channels } = WedTech;
const $ = (s) => document.querySelector(s),
  money = (n) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(n),
  esc = (v) =>
    String(v ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
let state;
try {
  state = JSON.parse(localStorage.getItem("wedtech-demo-v1"));
  if (
    !state ||
    state.version !== 1 ||
    !Array.isArray(state.products) ||
    !Array.isArray(state.orders)
  )
    state = seed();
} catch {
  state = seed();
}
let page = "dashboard",
  modal = null,
  busy = false,
  menu = false,
  sidebarOpen = false,
  query = "",
  chat = [],
  dashboardAiResponse = "",
  oneStage = 0,
  progress = 0,
  selected = ["ml", "sh", "tk"],
  ads = [],
  draft = blank(),
  syncText = "",
  publishedId = null;
function blank() {
  return {
    name: "",
    brand: "",
    category: "Calçados",
    sku: "",
    price: "",
    stock: "",
    description: "",
    features: "",
    image: "",
  };
}
// Navigation labels and SVG icon paths
const routes = {
  dashboard: "Dashboard",
  produtos: "Produtos",
  one: "WedTech One",
  marketplaces: "Marketplaces",
  ai: "WedTech AI",
};
const paths = {
  dashboard:
    '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  produtos:
    '<path d="m3 7 9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10M7 5l10 5"/>',
  one: '<path d="M12 3v18M3 12h18M5 5l14 14M19 5 5 19"/>',
  marketplaces: '<path d="M4 10v11h16V10M3 4h18l1 6H2zM9 21v-7h6v7"/>',
  ai: '<path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3z"/>',
  sale: '<path d="M3 17 8 12l4 3 8-11M15 4h5v5"/>',
  orders: '<path d="M5 3h14v18l-3-2-4 2-4-2-3 2zM9 7h6M9 11h6"/>',
  stock: '<path d="M3 8h18v13H3zM5 3h14v5M9 12h6"/>',
  alert: '<path d="m12 3 10 18H2zM12 9v5M12 17v1"/>',
  shoe: '<path d="m3 14 4-8 5 7 8 2 1 4H3zM10 11l-2 2M13 14l-2 2"/>',
  watch:
    '<rect x="6" y="6" width="12" height="12" rx="4"/><path d="M9 6V2h6v4M9 18v4h6v-4M12 9v4h3"/>',
  mouse:
    '<rect x="6" y="2" width="12" height="20" rx="6"/><path d="M12 2v7M6 9h12"/>',
  headset: '<path d="M3 15v-3a9 9 0 0 1 18 0v3M3 13h4v7H3zM17 13h4v7h-4z"/>',
  bag: '<rect x="4" y="7" width="16" height="14" rx="2"/><path d="M8 7V5a4 4 0 0 1 8 0v2"/>',
  keyboard:
    '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M6 9h1m3 0h1m3 0h1m3 0h1M6 13h1m3 0h1m3 0h1M7 16h10"/>',
  shirt: '<path d="m8 3-6 4 3 5 3-2v11h8V10l3 2 3-5-6-4q-4 4-8 0z"/>',
  speaker:
    '<rect x="5" y="2" width="14" height="20" rx="2"/><circle cx="12" cy="14" r="4"/><path d="M11 6h2"/>',
};
function icon(name) {
  return (
    '<span class="icon"><svg viewBox="0 0 24 24" aria-hidden="true">' +
    (paths[name] || paths.produtos) +
    "</svg></span>"
  );
}
function logo(id) {
  const c = channels.find((c) => c.id === id);
  return (
    '<span class="channel-logo ' +
    id +
    '" title="' +
    c.name +
    '">' +
    c.short +
    "</span>"
  );
}
function badge(text, type = "") {
  return '<span class="badge ' + type + '">' + text + "</span>";
}
function save() {
  try {
    localStorage.setItem("wedtech-demo-v1", JSON.stringify(state));
  } catch {
    toast(
      "Dados mantidos nesta sessão. O armazenamento local está indisponível.",
    );
  }
}
function toast(t) {
  $("#toast").textContent = t;
  $("#toast").classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => $("#toast").classList.remove("show"), 4000);
}
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
function heading(title, sub, action = "") {
  return (
    '<div class="page-heading"><div><h1>' +
    title +
    "</h1><p>" +
    sub +
    '</p></div><div class="actions">' +
    action +
    "</div></div>"
  );
}
function go(p) {
  location.hash = p;
}
// Application shell
function render() {
  const m = metrics(state);
  $("#app").innerHTML =
    `<a class="skip-link" href="#main-content">Pular para o conteúdo principal</a><div class="layout"><aside id="main-navigation" class="sidebar ${menu ? "open" : ""} ${sidebarOpen ? "expanded" : "collapsed"}" aria-label="Menu principal"><button type="button" class="sidebar-toggle" data-action="sidebar" aria-controls="primary-navigation" aria-label="${menu || sidebarOpen ? "Recolher" : "Abrir"} menu lateral" aria-expanded="${menu || sidebarOpen}" title="${menu || sidebarOpen ? "Recolher" : "Abrir"} menu">${menu || sidebarOpen ? "←" : '<img src="wedtech-symbol.png" alt=""><span class="menu-glyph" aria-hidden="true">☰</span>'}</button><div class="brand"><span class="mark"><img src="wedtech-symbol.png" alt="" width="48" height="48"></span><span class="wordmark"><b>Wed</b>Tech</span></div><div class="brand-sub">Tecnologia e conexão para o futuro</div><div class="nav-label">WORKSPACE</div><nav class="nav" id="primary-navigation" aria-label="Navegação principal">${Object.entries(
      routes,
    )
      .map(
        ([id, name]) =>
          `<a href="#${id}" class="${page === id ? "active" : ""}" ${page === id ? 'aria-current="page"' : ""}>${icon(id)}${name}${id === "ai" ? '<span class="badge" style="margin-left:auto;padding:3px 5px;font-size:10px">AI</span>' : ""}</a>`,
      )
      .join(
        "",
      )}</nav><div class="sidebar-bottom"><div class="side-note"><b>Uma operação. Mais possibilidades.</b><br>Um produto. Todos os canais.<br>Uma única inteligência.</div><div><span class="dot"></span>Modo Demonstração</div><div style="margin:10px 0;color:#8fa3bb">Protótipo Hackathon · v0.1</div><button class="link" style="color:#9fc7f3;padding:8px 0" data-action="reset">↺ Reiniciar demonstração</button></div></aside>${menu ? '<button type="button" class="sidebar-backdrop" data-action="menu" aria-label="Fechar menu lateral"></button>' : ""}<div class="workspace"><header class="topbar"><div class="crumb"><button class="mobile-menu" aria-label="Abrir menu" data-action="menu">☰</button><span class="muted">Workspace</span><span class="separator muted">/</span><span>${routes[page]}</span></div><div class="top-right">${badge('<span class="dot"></span>Demonstração', "neutral")}<span class="store-name">Minha loja</span><span class="avatar">ML</span></div></header><main id="main-content" tabindex="-1">${page === "dashboard" ? dashboard(m) : page === "produtos" ? catalog() : page === "one" ? one() : page === "marketplaces" ? markets() : ai(m)}</main></div></div>${modal ? detail() : ""}<dialog class="reset-dialog" id="reset-dialog"><h2>Recomeçar a apresentação?</h2><p>As alterações simuladas serão apagadas e os dados iniciais serão restaurados.</p><div class="actions"><button class="btn" data-action="cancel-reset">Cancelar</button><button class="btn primary" data-action="confirm-reset">Reiniciar</button></div></dialog>`;
  if (modal) {
    document.body.style.overflow = "hidden";
    $(".close")?.focus();
  } else document.body.style.overflow = "";
}
// Dashboard
function dashboardCopilot(m) {
  const low = state.products.filter((p) => p.stock < 20),
    issues = state.products.filter((p) => p.issue),
    top = channels.find(
      (c) =>
        c.id ===
        Object.entries(state.shareBase).sort((a, b) => b[1] - a[1])[0][0],
    );
  const summary = `Hoje você registrou ${m.orders} pedidos e ${money(m.revenue)} em vendas. ${low.length} ${low.length === 1 ? "produto está" : "produtos estão"} com estoque abaixo de 20 unidades${issues.length ? ` e ${issues.length} anúncio${issues.length === 1 ? " precisa" : "s precisam"} de revisão.` : "."}`;
  const response = dashboardAiResponse || summary;
  return `<section class="dashboard-ai-hero" aria-labelledby="dashboard-ai-title"><div class="dashboard-ai-main"><div class="dashboard-ai-badge"><span>✧</span> WEDTECH AI · COPILOTO DA OPERAÇÃO</div><h2 id="dashboard-ai-title">Sua operação, explicada antes dos números.</h2><div class="dashboard-ai-answer" aria-live="polite">${busy ? '<span class="spin"></span> Analisando sua operação...' : esc(response)}</div><div class="dashboard-ai-chips">${[0, 2, 4].map((i) => `<button type="button" class="dashboard-ai-chip" data-dashboard-ask="${i}" ${busy ? "disabled" : ""}>${suggestions[i]}</button>`).join("")}</div><form class="dashboard-ai-form" id="dashboard-ai-form"><label class="sr-only" for="dashboard-ai-question">Pergunte ao WedTech AI sobre sua operação</label><input id="dashboard-ai-question" name="question" placeholder="Pergunte sobre vendas, estoque ou anúncios..." aria-label="Pergunta rápida para WedTech AI" required maxlength="500" ${busy ? "disabled" : ""}><button ${busy ? "disabled" : ""} aria-label="Enviar pergunta">Perguntar ↑</button></form><a class="dashboard-ai-link" href="#ai">Abrir conversa completa com WedTech AI →</a></div><aside class="dashboard-ai-side" aria-label="Resumo inteligente"><div><small>ATENÇÃO AGORA</small><strong>${m.alerts}</strong><span>alertas identificados</span></div><div><small>ESTOQUE BAIXO</small><strong>${low.length}</strong><span>produtos abaixo de 20 un.</span></div><div><small>CANAL EM DESTAQUE</small><strong class="channel-highlight">${esc(top?.name || "—")}</strong><span>maior participação nas vendas</span></div></aside></section>`;
}
function dashboard(m) {
  const kpis = [
    ["Vendas hoje", money(m.revenue), "↑ 18,6% vs. ontem", "sale"],
    ["Pedidos", m.orders, "Pedidos recebidos hoje", "orders"],
    ["Produtos ativos", m.products, "Catálogo demonstrativo", "produtos"],
    ["Estoque total", m.stock, "Unidades em todos os canais", "stock"],
    ["Alertas", m.alerts, "Situações e oportunidades", "alert"],
    ["Marketplaces", m.connected, "Conectados e sincronizados", "marketplaces"],
  ];
  const total = Object.values(state.shareBase).reduce((a, b) => a + b, 0);
  let offset = 0;
  const segments = ["ml", "sh", "tk", "lp"].map((id) => {
    const c = channels.find((c) => c.id === id);
    const pct = (state.shareBase[id] / total) * 100;
    const seg = c.color + " " + offset + "% " + (offset + pct) + "%";
    offset += pct;
    return seg;
  });
  const values = [...state.salesWeek, m.revenue],
    max = Math.max(6000, ...values),
    points = values.map((v, i) => [40 + i * 90, 180 - (v / max) * 160]);
  const line = points.map((p) => p.join(",")).join(" ");
  return (
    heading(
      "Visão geral",
      "Bom dia! Aqui está o resumo da sua operação.",
      `<span class="btn" style="cursor:default">Hoje · Modo demonstração</span><button class="btn primary" data-action="new">+ Novo produto</button>`,
    ) +
    dashboardCopilot(m) +
    `<div class="kpis">${kpis.map((k, i) => `<div class="card kpi"><div class="kpi-label">${icon(k[3])}${k[0]}</div><strong>${k[1]}</strong><small class="${i === 0 ? "positive" : ""}">${k[2]}</small></div>`).join("")}</div><div class="chart-grid"><section class="card"><div class="section-head"><div><h2>Vendas nos últimos 7 dias</h2><p>A evolução da sua operação, em um só lugar.</p></div><span class="legend"><span class="dot"></span>Vendas</span></div><svg class="graph" viewBox="0 0 600 210" role="img" aria-label="Vendas de 3 a 9 de setembro: ${values.map(money).join(", ")}"><defs><linearGradient id="fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#2f6fb2" stop-opacity=".18"/><stop offset="100%" stop-color="#2f6fb2" stop-opacity="0"/></linearGradient></defs>${[0, 1, 2, 3].map((i) => `<line class="gridline" x1="40" y1="${20 + i * 53}" x2="590" y2="${20 + i * 53}"/><text x="0" y="${25 + i * 53}">${Math.round((max * (1 - i / 3)) / 1000)} mil</text>`).join("")}<polygon points="40,185 ${line} 580,185" fill="url(#fill)"/><polyline points="${line}" fill="none" stroke="#2f6fb2" stroke-width="3" stroke-linejoin="round"/>${points.map((p, i) => `<circle cx="${p[0]}" cy="${p[1]}" r="${i === 6 ? 5 : 3}" fill="#2f6fb2" stroke="white" stroke-width="2"><title>${money(values[i])}</title></circle>`).join("")}</svg><div class="chart-foot">${["Qui, 03", "Sex, 04", "Sáb, 05", "Dom, 06", "Seg, 07", "Ter, 08", "Hoje"].map((t) => "<span>" + t + "</span>").join("")}</div></section><section class="card"><div class="section-head"><div><h2>Vendas por marketplace</h2><p>Participação no faturamento · últimos 7 dias</p></div></div><div class="donut-wrap"><div class="donut" style="background:conic-gradient(${segments.join(",")})" role="img" aria-label="Distribuição de vendas por canal"><div class="donut-center"><strong>4</strong><small>Canais de venda</small></div></div><div class="channel-legend">${[
      "ml",
      "sh",
      "tk",
      "lp",
    ]
      .map((id) => {
        const c = channels.find((c) => c.id === id);
        return `<div><span class="swatch" style="background:${c.color}"></span>${c.name}<strong>${Math.round((state.shareBase[id] / total) * 100)}%</strong></div>`;
      })
      .join(
        "",
      )}</div></div></section></div><div class="ai-strip"><span class="spark">✧</span><div><h2>Sua operação tem um copiloto.</h2><p>WedTech AI encontrou algumas situações que precisam da sua atenção.</p></div><a class="link" href="#ai">Conversar com WedTech AI ↗</a></div><div class="alert-grid">${[
      ["p0", "CRÍTICO", "danger", "Estoque próximo da ruptura.", "Ver estoque"],
      [
        "p1",
        state.products[1].issue ? "ATENÇÃO" : "RESOLVIDO",
        state.products[1].issue ? "warn" : "",
        state.products[1].issue
          ? "Existe um problema no anúncio da Shopee."
          : "Anúncio revisado e pronto para vender.",
        "Ver anúncio",
      ],
      [
        "p2",
        "OPORTUNIDADE",
        "",
        "As vendas deste produto cresceram nesta semana.",
        "Explorar oportunidade",
      ],
    ]
      .map(
        (a) =>
          `<button class="card alert-card" data-product="${a[0]}">${badge(a[1], a[2])}<h3>${esc(state.products.find((p) => p.id === a[0]).name)}</h3><p>${a[3]}</p><span class="link">${a[4]} →</span></button>`,
      )
      .join(
        "",
      )}</div><div class="bottom-grid"><section class="card"><div class="section-head"><h2>Seus canais, conectados</h2><a href="#marketplaces" class="link">Gerenciar →</a></div>${channels
      .filter((c) => c.id !== "lp")
      .map(
        (c) =>
          `<div class="channel-row">${logo(c.id)}<div>${c.name}<div class="muted">${state.products.filter((p) => p.channels.includes(c.id)).length} produtos publicados</div></div>${badge(state.connected.includes(c.id) ? "Conectado" : "Não conectado", state.connected.includes(c.id) ? "" : "neutral")}</div>`,
      )
      .join(
        "",
      )}</section><section class="card"><div class="section-head"><h2>Atividade recente</h2><span class="muted" style="font-size:12px">Sua operação em movimento</span></div>${state.history
      .slice(0, 4)
      .map(
        (h) =>
          `<div class="activity"><span class="activity-icon">✓</span><div>${esc(h.text)}<small>${esc(h.time)}</small></div></div>`,
      )
      .join(
        "",
      )}<p class="caption">Todas as atividades são simulações locais.</p></section></div>`
  );
}
// Product catalog and details
function catalog() {
  const products = state.products.filter((p) =>
    (p.name + " " + p.sku).toLowerCase().includes(query.toLowerCase()),
  );
  return (
    heading(
      "Catálogo de produtos",
      "Um único cadastro. Estoque e informações em sintonia.",
      `<button class="btn primary" data-action="new">+ Novo Produto</button>`,
    ) +
    `<div class="toolbar"><input class="search" type="search" id="search" placeholder="Buscar por produto ou SKU..." aria-label="Buscar produtos" value="${esc(query)}"></div><section class="card table-wrap"><table><thead><tr><th>Produto</th><th>SKU</th><th>Preço</th><th>Estoque</th><th>Marketplaces</th><th>Status</th></tr></thead><tbody>${products.map((p) => `<tr><td><div class="product-name"><span class="product-icon">${p.image ? `<img src="${esc(p.image)}" alt="" style="width:38px;height:38px;object-fit:contain">` : icon(p.icon)}</span><button class="product-button" data-product="${p.id}">${esc(p.name)}<small>${esc(p.brand)} · ${esc(p.category)}</small></button></div></td><td class="muted">${esc(p.sku)}</td><td>${money(p.price)}</td><td><b style="color:${p.stock < 20 ? "#b67730" : "inherit"}">${p.stock}</b><small>${p.stock < 20 ? "Estoque baixo" : "unidades"}</small></td><td><div class="mini-channels">${p.channels.map(logo).join("")}</div></td><td>${badge(p.issue ? "Atenção" : "Ativo", p.issue ? "warn" : "")}</td></tr>`).join("")}</tbody></table>${products.length ? "" : '<div class="empty">Nenhum produto encontrado.</div>'}<div class="table-footer">${products.length} de ${state.products.length} produtos · Catálogo demonstrativo completo</div></section><div class="ai-strip" style="margin-top:24px"><span class="spark">✧</span><div><h2>Um estoque que acompanha suas vendas.</h2><p>Abra Nike Revolution 8 e simule uma venda para ver a sincronização entre os canais.</p></div><button class="link" data-product="p0">Experimentar →</button></div>`
  );
}
function detail() {
  const p = state.products.find((p) => p.id === modal);
  if (!p) return "";
  const count = state.orders
    .filter((o) => o.productId === p.id)
    .reduce((a, o) => a + o.quantity, 0);
  return `<div class="modal-overlay"><section class="drawer" role="dialog" aria-modal="true" aria-labelledby="detail-title"><div class="drawer-top"><span class="wedtech-label">CATÁLOGO CENTRAL</span><button class="close" data-action="close" aria-label="Fechar detalhes">×</button></div><div class="product-icon" style="width:64px;height:64px;margin-bottom:20px">${p.image ? `<img class="image-preview" src="${esc(p.image)}" alt="${esc(p.name)}">` : icon(p.icon)}</div><h1 id="detail-title">${esc(p.name)}</h1><p class="muted" style="font-size:14px;margin-top:10px">${esc(p.sku)} · ${esc(p.brand)} · ${esc(p.category)}</p><div class="detail-stats"><div><small>Preço</small><strong>${money(p.price)}</strong></div><div><small>Estoque</small><strong>${p.stock} un.</strong></div><div><small>Vendidos hoje</small><strong>${count}</strong></div></div><p style="font-size:14px">${esc(p.description)}</p><p class="caption">${esc(p.features)}</p><div class="sync-box"><div class="section-head" style="margin-bottom:10px"><h2>Estoque em tempo real</h2>${badge("Simulação", "neutral")}</div><p aria-live="polite">${syncText || "Um único saldo, atualizado em todos os canais."}</p>${channels.map((c) => `<div class="sync-channel"><span>${c.name}</span><span>${p.channels.includes(c.id) ? `<b>${p.stock}</b> ${busy ? "sincronizando…" : "✓ Publicado"}` : "Não publicado"}</span></div>`).join("")}<button class="btn primary" style="width:100%;margin-top:18px" data-action="sell" ${busy || p.stock < 1 ? "disabled" : ""}>${busy ? '<span class="spin"></span>Sincronizando estoque...' : p.stock < 1 ? "Estoque esgotado" : "Simular venda"}</button></div><div class="ai-strip" style="align-items:flex-start"><span class="spark">✧</span><div><h2>Análise do WedTech AI</h2><p>${p.stock < 20 ? "Estoque próximo da ruptura. Restam " + p.stock + " unidades. Planeje a reposição." : p.issue ? "O título na Shopee ultrapassa a recomendação desta demonstração." : p.slow ? "Vendas abaixo da média histórica. Revise o anúncio e avalie uma campanha." : "Estoque saudável. Continue acompanhando as vendas entre os canais."}</p></div></div>${p.issue ? `<button class="btn primary" data-action="fix-product" ${busy ? "disabled" : ""}>${busy ? "Corrigindo..." : "✧ Corrigir anúncio com WedTech AI"}</button>` : ""}<h3 style="margin-top:24px">Últimas vendas simuladas</h3>${
    state.orders
      .filter((o) => o.productId === p.id)
      .slice(-3)
      .reverse()
      .map(
        (o) =>
          `<div class="channel-row"><span>${o.id}<small style="display:block">${channels.find((c) => c.id === o.channel).name} · ${o.time}</small></span><b style="margin-left:auto">${money(o.amount)}</b></div>`,
      )
      .join("") ||
    '<p class="caption">Este produto ainda não recebeu vendas.</p>'
  }</section></div>`;
}
function stepbar() {
  return `<div class="steps">${["Produto original", "Preparar e validar", "Publicar nos canais"].map((s, i) => `<span class="${(oneStage === 0 ? 0 : oneStage < 4 ? 1 : 2) >= i ? "current" : ""}"><b>${i + 1}</b>${s}</span>`).join("")}</div>`;
}
// WedTech One publishing flow
function one() {
  let content =
    heading(
      "WedTech One",
      "Cadastre uma vez. Publique em qualquer lugar.",
      oneStage === 0
        ? '<button class="btn" data-action="example">Preencher exemplo</button>'
        : "",
    ) + stepbar();
  if (oneStage === 0) {
    return (
      content +
      `<form id="product-form" class="form-layout"><section class="card"><div class="section-head"><div><h2>Informações do produto</h2><p>Este é o ponto de partida para todos os seus anúncios.</p></div>${icon("produtos")}</div><div class="form-grid">${[
        ["name", "Nome do produto", "text"],
        ["brand", "Marca", "text"],
        ["sku", "SKU", "text"],
        ["category", "Categoria", "text"],
        ["price", "Preço (R$)", "number"],
        ["stock", "Estoque", "number"],
      ]
        .map(
          ([key, label, type]) =>
            `<div class="field ${key === "name" ? "full" : ""}"><label for="${key}">${label}</label><input id="${key}" name="${key}" type="${type}" value="${esc(draft[key])}" required ${type === "number" ? `min="${key === "price" ? ".01" : "0"}" max="${key === "price" ? "9999999" : "999999"}" step="${key === "price" ? ".01" : "1"}"` : 'maxlength="120"'}></div>`,
        )
        .join(
          "",
        )}<div class="field full"><label for="description">Descrição</label><textarea id="description" name="description" required maxlength="2000">${esc(draft.description)}</textarea></div><div class="field full"><label for="features">Características</label><textarea id="features" name="features" maxlength="1000">${esc(draft.features)}</textarea></div><div class="field full"><label for="image">Imagem do produto</label><input id="image" type="file" accept="image/png,image/jpeg,image/webp"><span class="help">PNG, JPG ou WebP, até 1 MB. Guardada apenas neste navegador.</span>${draft.image ? `<img src="${esc(draft.image)}" class="image-preview" alt="Prévia do produto">` : ""}</div></div></section><aside><section class="card"><h2 style="margin-bottom:8px">Onde você quer vender?</h2><p class="muted" style="font-size:14px;margin-bottom:23px">A IA adapta seu produto para cada canal selecionado.</p>${channels
        .filter((c) => c.id !== "lp")
        .map(
          (c) =>
            `<label class="check-row"><input type="checkbox" name="channel" value="${c.id}" ${selected.includes(c.id) ? "checked" : ""}>${logo(c.id)}<span>${c.name}</span></label>`,
        )
        .join(
          "",
        )}<button class="btn primary" style="width:100%;margin-top:15px" type="submit">✧ Preparar anúncios com WedTech AI</button><p class="caption">IA e publicações simuladas. Nenhum anúncio será enviado para plataformas reais.</p></section><section class="one-story"><div class="wedtech-label" style="color:#9fc7f3">MENOS REPETIÇÃO. MAIS TEMPO.</div><h2>Seu próximo anúncio começa apenas uma vez.</h2><p>Títulos, descrições e validações adaptados por canal, a partir de um catálogo central.</p><div class="flow"><span>Produto</span>→<span>WedTech AI</span>→<span>Canais</span></div></section></aside></form>`
    );
  }
  if (oneStage === 1) {
    const steps = [
      "Produto identificado",
      "Categoria analisada",
      "Características processadas",
      "Regras dos marketplaces verificadas",
      "Anúncios preparados",
    ];
    return (
      content +
      `<section class="card progress-card"><h2><span class="spin"></span>WedTech AI está analisando o produto...</h2>${steps.map((s, i) => `<div class="progress-line" style="opacity:${progress > i ? 1 : 0.35}">${progress > i ? "✓" : "○"} ${s}</div>`).join("")}<p class="caption">Preparando versões demonstrativas para ${selected.length} canais.</p></section>`
    );
  }
  return (
    content +
    (oneStage === 5
      ? '<div class="success-banner"><h2>✓ Produto distribuído com sucesso.</h2><p>O produto já está no catálogo central. Todos os canais selecionados compartilham seu estoque.</p></div>'
      : "") +
    `<section class="card" style="margin-bottom:22px"><div class="section-head" style="margin:0"><div><span class="wedtech-label">PRODUTO ORIGINAL</span><h2 style="margin:8px 0">${esc(draft.name)}</h2><p>${esc(draft.description)}</p></div><strong>${money(Number(draft.price))}</strong></div></section><div class="ad-grid">${ads.map((a, i) => `<section class="card ad-card"><div class="section-head">${logo(a.channel)}${badge(oneStage === 5 ? "✓ Publicado" : oneStage === 4 ? (progress > i ? "✓ Publicado" : "Publicando...") : "Pronto", oneStage === 4 ? "neutral" : "")}</div><small>${channels.find((c) => c.id === a.channel).name}</small><h3>${esc(a.title)}</h3><p>${esc(a.description)}</p><p style="margin-top:15px;color:#223a57;font-weight:600">${money(Number(draft.price))}</p><div class="validation ${a.fixed || !a.warning ? "ok" : ""}">${a.fixed ? "✓ " + (a.channel === "ml" ? "GTIN ajustado para demonstração: DEMO-SEM-GTIN." : a.channel === "sh" ? "Título Shopee otimizado." : "Nenhum problema identificado.") : a.warning ? "⚠ " + a.warning : "✓ Nenhum problema identificado."}</div></section>`).join("")}</div><div class="card" style="margin-top:22px"><div class="section-head" style="margin:0"><div><h2>${oneStage === 5 ? "Tudo pronto para vender." : oneStage === 4 ? "Publicando nos canais selecionados..." : ads.some((a) => a.warning && !a.fixed) ? "Validação inteligente encontrou ajustes." : "Todos os anúncios estão prontos."}</h2><p>${oneStage === 5 ? "Simule uma venda e acompanhe a sincronização." : "Validação ilustrativa, sem consulta às regras reais dos marketplaces."}</p></div><div class="actions">${oneStage === 5 ? `<button class="btn" data-action="another">Novo cadastro</button><button class="btn primary" data-product="${publishedId}">Ver produto</button>` : oneStage === 4 ? '<span class="spin"></span>' : `<button class="btn" data-action="edit-one" ${busy ? "disabled" : ""}>Editar produto</button>${ads.some((a) => a.warning && !a.fixed) ? `<button class="btn primary" data-action="fix-ads" ${busy ? "disabled" : ""}>${busy ? "Corrigindo..." : "✧ Corrigir com WedTech AI"}</button>` : '<button class="btn primary" data-action="publish">Publicar</button>'}`}</div></div></div>`
  );
}
// Marketplace management
function markets() {
  return (
    heading(
      "Marketplaces",
      "Seus canais de venda. Uma única operação.",
      badge(metrics(state).connected + " conectados"),
    ) +
    `<div class="market-grid">${channels
      .filter((c) => c.id !== "lp")
      .map(
        (c) =>
          `<section class="card"><div class="market-title">${logo(c.id)}<h2>${c.name}</h2>${badge(state.connected.includes(c.id) ? "Conectado" : "Não conectado", state.connected.includes(c.id) ? "" : "neutral")}</div><div class="market-stats"><div><strong>${state.products.filter((p) => p.channels.includes(c.id)).length}</strong><small>Produtos publicados</small></div><div><strong>${state.orders.filter((o) => o.channel === c.id).length}</strong><small>Pedidos hoje</small></div></div>${state.connected.includes(c.id) ? '<div class="validation ok">✓ Canal conectado em modo demonstração.</div>' : `<button class="btn primary" data-connect="${c.id}" ${busy ? "disabled" : ""}>${busy ? "Conectando..." : "Conectar"}</button><p class="caption">Conexão simulada, sem credenciais.</p>`}</section>`,
      )
      .join(
        "",
      )}</div><div class="ai-strip" style="margin-top:24px"><span class="spark">✧</span><div><h2>Mais canais, o mesmo catálogo.</h2><p>Ao publicar com WedTech One, os anúncios passam a compartilhar as informações e o saldo do produto.</p></div><a class="link" href="#one">Abrir WedTech One →</a></div>`
  );
}
// WedTech AI
const suggestions = [
  "Quais produtos precisam de atenção?",
  "Tenho risco de ficar sem estoque?",
  "Quais produtos estão vendendo mais?",
  "Existem erros nos meus anúncios?",
  "Resuma minha operação.",
];
function ai(m) {
  return (
    heading(
      "WedTech AI",
      "Seu copiloto inteligente para decisões do dia a dia.",
      badge("✧ Inteligência simulada", "neutral"),
    ) +
    `<div class="ai-layout"><section class="card chat"><div class="chat-hello"><span class="spark">✧</span><h2>Olá. Sou o WedTech AI.</h2><p>Analiso sua operação e posso ajudar você a entender seus produtos, estoques, vendas e marketplaces.</p></div><div class="suggestions">${suggestions.map((s, i) => `<button data-ask="${i}" ${busy ? "disabled" : ""}>${s}</button>`).join("")}</div><div class="messages" aria-live="polite">${chat.map((c) => `<div class="message ${c.role}"><small>${c.role === "user" ? "Você" : "✧ WedTech AI · análise dos dados locais"}</small>${esc(c.text)}</div>`).join("")}${busy ? '<div class="message"><span class="spin"></span>Analisando sua operação...</div>' : ""}</div><form class="chat-form" id="chat-form"><input name="question" placeholder="Pergunte sobre sua operação..." aria-label="Pergunta para WedTech AI" required maxlength="500" ${busy ? "disabled" : ""}><button class="btn primary" ${busy ? "disabled" : ""} aria-label="Enviar pergunta">Enviar ↑</button></form><p class="caption">Respostas pré-programadas com base nos dados atuais da demonstração.</p></section><aside class="card ai-context"><div class="wedtech-label">CONTEXTO DA OPERAÇÃO</div><h2>Uma visão conectada</h2>${[
      ["Vendas hoje", money(m.revenue)],
      ["Pedidos", m.orders],
      ["Produtos", m.products],
      ["Unidades em estoque", m.stock],
      ["Marketplaces", m.connected],
    ]
      .map(
        ([l, v]) => `<div class="context-item">${l}<strong>${v}</strong></div>`,
      )
      .join(
        "",
      )}<p class="caption">O copiloto acompanha as alterações simuladas no seu catálogo e estoque.</p><div class="validation ok">✓ Dados locais atualizados</div></aside></div>`
  );
}
// Form data and asynchronous actions
function readDraft(form) {
  for (const key of [
    "name",
    "brand",
    "sku",
    "category",
    "price",
    "stock",
    "description",
    "features",
  ])
    draft[key] = form.elements[key].value.trim();
}
async function prepare(form) {
  readDraft(form);
  selected = Array.from(form.querySelectorAll('[name="channel"]:checked')).map(
    (el) => el.value,
  );
  if (!selected.length) return toast("Selecione pelo menos um marketplace.");
  if (
    state.products.some((p) => p.sku.toLowerCase() === draft.sku.toLowerCase())
  )
    return toast(
      "Este SKU já existe. Use um SKU diferente para o novo produto.",
    );
  if (!draft.name || !draft.brand || !draft.sku || !draft.description)
    return toast("Preencha os campos obrigatórios.");
  busy = true;
  oneStage = 1;
  progress = 0;
  render();
  for (let i = 1; i <= 5; i++) {
    await pause(330);
    progress = i;
    render();
  }
  ads = selected.map((id) => ({
    channel: id,
    title:
      id === "ml"
        ? draft.name + " " + draft.brand + " Original"
        : id === "sh"
          ? draft.name +
            " | " +
            draft.category +
            " · Qualidade e conforto para todos os momentos do seu dia"
          : id === "tk"
            ? draft.name + " ✨ Seu novo favorito para o dia a dia"
            : draft.name + " - " + draft.brand,
    description:
      id === "ml"
        ? draft.description + " Características: " + draft.features
        : id === "sh"
          ? "Conheça " + draft.name + ". " + draft.description
          : id === "tk"
            ? "Descubra " + draft.name + "! " + draft.description
            : draft.description,
    warning:
      id === "ml"
        ? "GTIN não informado."
        : id === "sh"
          ? "Título ultrapassa o tamanho recomendado."
          : "",
    fixed: false,
  }));
  oneStage = 2;
  busy = false;
  render();
}
async function askDashboard(q) {
  if (busy || !q.trim()) return;
  busy = true;
  dashboardAiResponse = "";
  render();
  await pause(550);
  dashboardAiResponse = answer(state, q);
  busy = false;
  render();
  $("#dashboard-ai-form input")?.focus();
}
async function ask(q) {
  if (busy || !q.trim()) return;
  chat.push({ role: "user", text: q.trim() });
  busy = true;
  render();
  await pause(650);
  chat.push({ role: "assistant", text: answer(state, q) });
  busy = false;
  render();
  $("#chat-form input")?.focus();
  $(".messages")?.lastElementChild?.scrollIntoView({
    behavior: "smooth",
    block: "nearest",
  });
}
// DOM events
document.addEventListener("submit", (e) => {
  if (e.target.id === "product-form") {
    e.preventDefault();
    prepare(e.target);
  }
  if (e.target.id === "chat-form") {
    e.preventDefault();
    ask(e.target.elements.question.value);
  }
  if (e.target.id === "dashboard-ai-form") {
    e.preventDefault();
    askDashboard(e.target.elements.question.value);
  }
});
document.addEventListener("input", (e) => {
  if (e.target.id === "search") {
    query = e.target.value;
    const pos = e.target.selectionStart;
    render();
    $("#search").focus();
    if (pos !== null) $("#search").setSelectionRange(pos, pos);
  }
  if (
    e.target.closest("#product-form") &&
    e.target.name &&
    e.target.name !== "channel"
  )
    draft[e.target.name] = e.target.value;
});
document.addEventListener("change", (e) => {
  if (e.target.name === "channel") {
    selected = Array.from(
      document.querySelectorAll('[name="channel"]:checked'),
    ).map((el) => el.value);
  }
  if (e.target.id === "image") {
    const file = e.target.files[0];
    if (!file) return;
    if (
      !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
      file.size > 1024 * 1024
    ) {
      toast("Selecione uma imagem PNG, JPG ou WebP de até 1 MB.");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      draft.image = reader.result;
      render();
    };
    reader.readAsDataURL(file);
  }
});
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (modal && !busy) {
    modal = null;
    render();
    return;
  }
  if (menu) {
    menu = false;
    render();
    $(".mobile-menu")?.focus();
    return;
  }
  if (sidebarOpen) {
    sidebarOpen = false;
    render();
    $(".sidebar-toggle")?.focus();
  }
});
document.addEventListener("click", async (e) => {
  const el = e.target.closest("button");
  if (!el) return;
  const a = el.dataset.action;
  if (el.dataset.product) {
    if (busy) return;
    modal = el.dataset.product;
    syncText = "";
    render();
    return;
  }
  if (el.dataset.ask !== undefined)
    return ask(suggestions[Number(el.dataset.ask)]);
  if (el.dataset.dashboardAsk !== undefined)
    return askDashboard(suggestions[Number(el.dataset.dashboardAsk)]);
  if (el.dataset.connect) {
    if (busy) return;
    busy = true;
    render();
    await pause(900);
    state.connected.push(el.dataset.connect);
    state.history.unshift({
      text: "Magalu conectado em modo demonstração",
      time: "Agora",
    });
    save();
    busy = false;
    render();
    toast("Marketplace conectado com sucesso.");
    return;
  }
  if (a === "menu") {
    menu = !menu;
    render();
    (menu ? $(".sidebar-toggle") : $(".mobile-menu"))?.focus();
  }
  if (a === "sidebar") {
    if (menu) menu = false;
    else sidebarOpen = !sidebarOpen;
    render();
    $(".sidebar-toggle")?.focus();
  }
  if (a === "close" && !busy) {
    modal = null;
    render();
  }
  if (a === "new") {
    if (busy) return;
    draft = blank();
    oneStage = 0;
    go("one");
    render();
  }
  if (a === "example") {
    draft = {
      ...blank(),
      name: "Nike Revolution 8",
      brand: "Nike",
      sku: "NK-RV8-" + String(state.products.length + 1).padStart(3, "0"),
      category: "Calçados",
      price: 399.9,
      stock: 18,
      description:
        "Tênis masculino para corrida. Conforto e leveza para o seu dia a dia.",
      features:
        "Cabedal respirável, amortecimento em espuma, solado emborrachado",
    };
    render();
    toast("Exemplo preenchido. Você pode editar todos os campos.");
  }
  if (a === "edit-one" && !busy) {
    oneStage = 0;
    render();
  }
  if (a === "another") {
    draft = blank();
    oneStage = 0;
    ads = [];
    publishedId = null;
    render();
  }
  if (a === "fix-ads" && !busy) {
    busy = true;
    render();
    await pause(850);
    ads.forEach((ad) => {
      ad.fixed = true;
      if (ad.channel === "sh")
        ad.title = (draft.name + " | " + draft.category).slice(0, 70);
      if (ad.channel === "ml") ad.gtin = "DEMO-SEM-GTIN";
    });
    busy = false;
    oneStage = 3;
    render();
    toast("Todos os anúncios estão prontos.");
  }
  if (a === "publish" && !busy) {
    if (ads.some((ad) => ad.warning && !ad.fixed)) return;
    busy = true;
    oneStage = 4;
    progress = 0;
    render();
    for (let i = 0; i < selected.length; i++) {
      await pause(500);
      progress = i + 1;
      render();
    }
    try {
      const p = publish(state, draft, selected, ads);
      publishedId = p.id;
      for (const id of selected)
        if (!state.connected.includes(id)) state.connected.push(id);
      save();
      oneStage = 5;
      toast("Produto distribuído com sucesso. Publicação simulada.");
    } catch (err) {
      oneStage = 3;
      toast(err.message);
    }
    busy = false;
    render();
  }
  if (a === "sell" && !busy) {
    const id = modal,
      p = state.products.find((p) => p.id === id);
    if (!p || p.stock <= 0) return;
    const before = p.stock;
    busy = true;
    sell(state, id);
    save();
    syncText =
      "Nova venda recebida pelo Mercado Livre. Quantidade: 1. Estoque: " +
      before +
      " → " +
      p.stock +
      ". Sincronizando estoque...";
    render();
    toast("Nova venda recebida pelo Mercado Livre.");
    await pause(1300);
    busy = false;
    syncText =
      "✓ Estoque sincronizado. " +
      before +
      " → " +
      p.stock +
      " unidades em todos os canais publicados.";
    render();
    toast("Estoque sincronizado em todos os canais.");
  }
  if (a === "fix-product" && !busy) {
    const p = state.products.find((p) => p.id === modal);
    busy = true;
    render();
    await pause(850);
    p.issue = false;
    state.history.unshift({
      text: "Anúncio de " + p.name + " corrigido na Shopee",
      time: "Agora",
    });
    save();
    busy = false;
    render();
    toast("Título Shopee otimizado. Problema resolvido.");
  }
  if (a === "reset" && !busy) $("#reset-dialog").showModal();
  if (a === "cancel-reset") $("#reset-dialog").close();
  if (a === "confirm-reset") {
    state = seed();
    draft = blank();
    oneStage = 0;
    selected = ["ml", "sh", "tk"];
    chat = [];
    dashboardAiResponse = "";
    query = "";
    modal = null;
    syncText = "";
    save();
    go("dashboard");
    render();
    toast("Demonstração reiniciada.");
  }
});
document.addEventListener("keydown", (e) => {
  if (!modal) return;
  if (e.key === "Escape" && !busy) {
    modal = null;
    render();
  }
  if (e.key === "Tab") {
    const els = Array.from(
      document.querySelectorAll(
        ".drawer button:not(:disabled),.drawer a,.drawer input",
      ),
    );
    if (!els.length) return;
    const first = els[0],
      last = els.at(-1);
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
});
// Hash routing and optional browser-agent integration
function route() {
  const hash = location.hash.slice(1);
  page = routes[hash] ? hash : "dashboard";
  menu = false;
  modal = null;
  render();
  window.scrollTo(0, 0);
}
window.addEventListener("hashchange", route);
route();
// Optional browser agent interface; ordinary browsers do not need this API.
if (document.modelContext?.registerTool) {
  const lifecycle = new AbortController();
  try {
    Promise.resolve(
      document.modelContext.registerTool(
        {
          name: "get_wedtech_operation_summary",
          title: "Consultar operação WedTech",
          description:
            "Lê os indicadores atuais, saldos de estoque e análise local da demonstração. Não altera os dados.",
          inputSchema: {
            type: "object",
            properties: {},
            additionalProperties: false,
          },
          annotations: { readOnlyHint: true, untrustedContentHint: true },
          execute(input) {
            if (
              !input ||
              typeof input !== "object" ||
              Array.isArray(input) ||
              Object.keys(input).length
            )
              throw Error("Informe um objeto vazio.");
            return {
              metrics: metrics(state),
              products: state.products.map((p) => ({
                name: p.name,
                sku: p.sku,
                stock: p.stock,
              })),
              summary: answer(state, "Resuma minha operação."),
            };
          },
        },
        { signal: lifecycle.signal },
      ),
    ).catch(() => {});
  } catch {}
  window.addEventListener("pagehide", () => lifecycle.abort(), { once: true });
}
