(function (global) {
  "use strict";

  // Marketplace metadata
  const channels = [
    { id: "ml", name: "Mercado Livre", short: "ML", color: "#31866a" },
    { id: "sh", name: "Shopee", short: "S", color: "#f59d62" },
    { id: "tk", name: "TikTok Shop", short: "Tk", color: "#344e46" },
    { id: "mg", name: "Magalu", short: "M", color: "#4b9cdd" },
    { id: "lp", name: "Loja própria", short: "N", color: "#b4cfbd" },
  ];
  // Fulfillment (separation) status labels
  const fulfillmentStatus = {
    pending: "Aguardando separação",
    separating: "Em separação",
    separated: "Separado · pronto para etiqueta",
    shipped: "Saiu para entrega",
  };
  // Initial demonstration data
  function seed() {
    const items = [
      [
        "Nike Revolution 8",
        "NK-RV8-001",
        399.9,
        18,
        "Nike",
        "Calçados",
        "shoe",
      ],
      [
        "Smartwatch Fit Pro",
        "SW-FP-002",
        249.9,
        65,
        "Fit Pro",
        "Eletrônicos",
        "watch",
      ],
      [
        "Mouse Gamer G500",
        "MS-G500-003",
        129.9,
        142,
        "Logitech",
        "Informática",
        "mouse",
      ],
      [
        "Headset Gamer X200",
        "HS-X200-004",
        189.9,
        94,
        "HyperX",
        "Informática",
        "headset",
      ],
      [
        "Garrafa Térmica 750ml",
        "GT-750-005",
        89.9,
        120,
        "Termix",
        "Casa",
        "box",
      ],
      [
        "Mochila Urban 20L",
        "MC-URB-006",
        159.9,
        82,
        "Urban",
        "Acessórios",
        "bag",
      ],
      [
        "Teclado Mecânico K68",
        "TC-K68-007",
        279.9,
        76,
        "Redragon",
        "Informática",
        "keyboard",
      ],
      [
        "Camiseta Essential",
        "CM-ESS-008",
        59.9,
        136,
        "Basics",
        "Vestuário",
        "shirt",
      ],
      [
        "Caixa de Som Mini",
        "CX-MINI-009",
        119.9,
        12,
        "JBL",
        "Eletrônicos",
        "speaker",
      ],
      [
        "Suporte Notebook Alumínio",
        "SP-NB-010",
        99.9,
        97,
        "Office",
        "Informática",
        "box",
      ],
    ];
    const products = items.map((p, i) => ({
      id: "p" + i,
      name: p[0],
      sku: p[1],
      price: p[2],
      stock: p[3],
      brand: p[4],
      category: p[5],
      icon: p[6],
      // Código de barras (EAN-13 demonstrativo) usado pelo leitor IoT
      barcode: "789123450" + String(i + 1).padStart(4, "0"),
      description:
        i === 0
          ? "Tênis masculino para corrida. Conforto e leveza para acompanhar seu ritmo."
          : "Qualidade e praticidade para o dia a dia.",
      features:
        i === 0
          ? "Leve, respirável, solado emborrachado"
          : "Acabamento resistente, garantia de 90 dias",
      channels: ["ml", "sh", "tk", "lp"],
      issue: i === 1,
      slow: i === 3,
      image: "",
    }));
    const orders = Array.from({ length: 37 }, (_, i) => ({
      id: "WT-" + (1040 + i),
      productId: "p" + (i % 10),
      channel: i < 18 ? "ml" : i < 29 ? "sh" : "tk",
      quantity: 1,
      amount: i === 36 ? 170 : 130,
      time:
        "Hoje, " +
        String(8 + Math.floor(i / 6)).padStart(2, "0") +
        ":" +
        String((i % 6) * 9).padStart(2, "0"),
    }));
    return {
      version: 1,
      products,
      orders,
      connected: ["ml", "sh", "tk"],
      history: [
        { text: "Catálogo central sincronizado", time: "Há 2 minutos" },
        { text: "WedTech AI analisou 10 produtos", time: "Há 5 minutos" },
        { text: "Anúncio da Shopee precisa de atenção", time: "Há 12 minutos" },
      ],
      salesWeek: [2350, 3180, 2780, 3920, 3540, 4200],
      shareBase: { ml: 10424.4, sh: 7694.2, tk: 4219.4, lp: 2482 },
      // Dados da empresa (painel de configurações)
      company: {
        name: "WedTech Comércio de Produtos Ltda",
        cnpj: "48.123.456/0001-09",
        ie: "148.256.987.114",
      },
      // Lojas e centros de distribuição cadastrados
      stores: [
        {
          id: "st1",
          name: "Loja Tatuapé",
          type: "loja",
          cnpj: "48.123.456/0001-09",
          address: "Rua Serra de Bragança, 1000 — Tatuapé, São Paulo/SP",
          active: true,
        },
        {
          id: "st2",
          name: "CD Guarulhos",
          type: "cd",
          cnpj: "48.123.456/0002-80",
          address: "Rod. Hélio Smidt, 500 — Cumbica, Guarulhos/SP",
          active: true,
        },
      ],
      // Registro de leituras do leitor IoT (entrada, saída e separação)
      scanLog: [],
      // Pedidos de marketplace aguardando separação/expedição no estoque físico
      fulfillments: [
        {
          id: "SEP-2201",
          channel: "ml",
          createdAt: "Hoje, 09:10",
          status: "pending",
          items: [
            {
              productId: "p2",
              sku: "MS-G500-003",
              name: "Mouse Gamer G500",
              qty: 2,
              scanned: false,
            },
            {
              productId: "p6",
              sku: "TC-K68-007",
              name: "Teclado Mecânico K68",
              qty: 1,
              scanned: false,
            },
          ],
        },
        {
          id: "SEP-2202",
          channel: "sh",
          createdAt: "Hoje, 10:35",
          status: "pending",
          items: [
            {
              productId: "p3",
              sku: "HS-X200-004",
              name: "Headset Gamer X200",
              qty: 1,
              scanned: false,
            },
          ],
        },
      ],
    };
  }
  // Derived operational metrics
  function metrics(s) {
    return {
      revenue:
        Math.round(s.orders.reduce((a, o) => a + o.amount, 0) * 100) / 100,
      orders: s.orders.length,
      products: s.products.length,
      stock: s.products.reduce((a, p) => a + p.stock, 0),
      connected: s.connected.length,
      alerts:
        s.products.filter((p) => p.stock < 20).length +
        s.products.filter((p) => p.issue).length +
        s.products.filter((p) => p.slow).length +
        2,
      pendingSeparations: s.fulfillments.filter(
        (f) => f.status === "pending" || f.status === "separating",
      ).length,
    };
  }
  // State mutations used by the demonstration
  function sell(s, id) {
    const p = s.products.find((p) => p.id === id);
    if (!p || p.stock < 1) throw Error("Produto sem estoque disponível.");
    p.stock--;
    const o = {
      id: "WT-" + (1040 + s.orders.length),
      productId: id,
      channel: "ml",
      quantity: 1,
      amount: p.price,
      time: "Agora",
    };
    s.orders.push(o);
    s.shareBase.ml += p.price;
    s.history.unshift({
      text: "Venda de " + p.name + " • estoque sincronizado: " + p.stock,
      time: "Agora",
    });
    return o;
  }
  function publish(s, draft, selected, ads) {
    if (!selected.length) throw Error("Selecione pelo menos um canal.");
    if (s.products.some((p) => p.sku.toLowerCase() === draft.sku.toLowerCase()))
      throw Error("Este SKU já existe no catálogo. Use outro SKU.");
    const p = {
      ...draft,
      id: "p" + Date.now(),
      price: Number(draft.price),
      stock: Number(draft.stock),
      barcode: draft.barcode || "",
      channels: [...selected],
      icon: "box",
      issue: false,
      slow: false,
      ads,
    };
    s.products.push(p);
    s.history.unshift({
      text: p.name + " publicado em " + selected.length + " canais (simulação)",
      time: "Agora",
    });
    return p;
  }
  // Encontra um produto pelo SKU ou pelo código de barras (leitura do leitor IoT)
  function findByCode(s, code) {
    const c = String(code || "")
      .trim()
      .toLowerCase();
    if (!c) throw Error("Informe um código de barras ou SKU.");
    const p = s.products.find(
      (p) =>
        p.sku.toLowerCase() === c || (p.barcode || "").toLowerCase() === c,
    );
    if (!p) throw Error("Código não reconhecido no catálogo.");
    return p;
  }
  // Leitura de SAÍDA na loja física: bipar = venda imediata e baixa de estoque
  function scanSale(s, code, storeId) {
    const p = findByCode(s, code);
    if (p.stock < 1) throw Error(p.name + " está sem estoque disponível.");
    const store =
      s.stores.find((st) => st.id === storeId) || s.stores[0] || null;
    p.stock--;
    const o = {
      id: "WT-" + (1040 + s.orders.length),
      productId: p.id,
      channel: "lp",
      quantity: 1,
      amount: p.price,
      time: "Agora",
    };
    s.orders.push(o);
    s.shareBase.lp = (s.shareBase.lp || 0) + p.price;
    s.scanLog.unshift({
      id: "SC-" + (s.scanLog.length + 1),
      type: "saida",
      sku: p.sku,
      product: p.name,
      store: store ? store.name : "Loja",
      time: "Agora",
    });
    s.history.unshift({
      text:
        "Leitor IoT: venda de " +
        p.name +
        (store ? " na " + store.name : "") +
        " • estoque sincronizado: " +
        p.stock,
      time: "Agora",
    });
    return { product: p, order: o };
  }
  // Leitura de ENTRADA na loja física: bipar = soma ao estoque (recebimento/reposição)
  function scanReceive(s, code, qty, storeId) {
    const p = findByCode(s, code);
    const n = Math.max(1, Math.min(9999, Math.round(Number(qty) || 1)));
    const store =
      s.stores.find((st) => st.id === storeId) || s.stores[0] || null;
    p.stock += n;
    s.scanLog.unshift({
      id: "SC-" + (s.scanLog.length + 1),
      type: "entrada",
      sku: p.sku,
      product: p.name,
      store: store ? store.name : "Loja",
      time: "Agora",
    });
    s.history.unshift({
      text:
        "Leitor IoT: entrada de " +
        n +
        " un. de " +
        p.name +
        (store ? " na " + store.name : ""),
      time: "Agora",
    });
    return p;
  }
  // Gera um novo pedido de marketplace aguardando separação (simulação de entrada de venda)
  function newFulfillment(s, channel) {
    const c = channels.find((c) => c.id === channel) || channels[0];
    const pool = s.products.filter((p) => p.stock > 0);
    if (!pool.length)
      throw Error("Nenhum produto com estoque disponível para gerar pedido.");
    const idx = s.fulfillments.length % pool.length;
    const first = pool[idx];
    const items = [
      {
        productId: first.id,
        sku: first.sku,
        name: first.name,
        qty: 1,
        scanned: false,
      },
    ];
    if (pool.length > 1) {
      const second = pool[(idx + 3) % pool.length];
      if (second.id !== first.id)
        items.push({
          productId: second.id,
          sku: second.sku,
          name: second.name,
          qty: 1,
          scanned: false,
        });
    }
    const f = {
      id: "SEP-" + (2200 + s.fulfillments.length + 1),
      channel: c.id,
      createdAt: "Agora",
      status: "pending",
      items,
    };
    s.fulfillments.unshift(f);
    s.history.unshift({
      text: "Novo pedido do " + c.name + " aguardando separação (" + f.id + ")",
      time: "Agora",
    });
    return f;
  }
  // Bipagem de um item durante a separação de um pedido: confere se o código pertence ao pedido
  function scanFulfillmentItem(s, fulfillmentId, code) {
    const f = s.fulfillments.find((f) => f.id === fulfillmentId);
    if (!f) throw Error("Pedido não encontrado.");
    if (f.status === "separated" || f.status === "shipped")
      throw Error("Este pedido já foi separado.");
    const c = String(code || "")
      .trim()
      .toLowerCase();
    if (!c) throw Error("Informe um código de barras ou SKU.");
    const product = s.products.find(
      (p) =>
        p.sku.toLowerCase() === c || (p.barcode || "").toLowerCase() === c,
    );
    const item = f.items.find(
      (it) =>
        !it.scanned &&
        (it.sku.toLowerCase() === c ||
          (product && it.productId === product.id)),
    );
    if (!item)
      throw Error(
        "Este código não pertence a este pedido ou o item já foi separado.",
      );
    f.status = "separating";
    item.scanned = true;
    s.scanLog.unshift({
      id: "SC-" + (s.scanLog.length + 1),
      type: "separacao",
      sku: item.sku,
      product: item.name,
      store: "Separação " + f.id,
      time: "Agora",
    });
    return f;
  }
  // Confirma a separação: baixa o estoque de cada item e libera o pedido para etiqueta
  function confirmSeparation(s, fulfillmentId) {
    const f = s.fulfillments.find((f) => f.id === fulfillmentId);
    if (!f) throw Error("Pedido não encontrado.");
    if (f.items.some((it) => !it.scanned))
      throw Error("Bipe todos os itens antes de confirmar a separação.");
    for (const it of f.items) {
      const p = s.products.find((p) => p.id === it.productId);
      if (p && p.stock < it.qty)
        throw Error("Estoque insuficiente para " + p.name + ".");
    }
    for (const it of f.items) {
      const p = s.products.find((p) => p.id === it.productId);
      if (!p) continue;
      p.stock -= it.qty;
      s.orders.push({
        id: "WT-" + (1040 + s.orders.length),
        productId: p.id,
        channel: f.channel,
        quantity: it.qty,
        amount: Math.round(p.price * it.qty * 100) / 100,
        time: "Agora",
      });
    }
    f.status = "separated";
    s.history.unshift({
      text: "Pedido " + f.id + " separado e pronto para etiqueta",
      time: "Agora",
    });
    return f;
  }
  // Despacha um pedido já separado
  function dispatchFulfillment(s, fulfillmentId) {
    const f = s.fulfillments.find((f) => f.id === fulfillmentId);
    if (!f) throw Error("Pedido não encontrado.");
    if (f.status !== "separated")
      throw Error("Separe todos os itens do pedido antes de despachar.");
    f.status = "shipped";
    s.history.unshift({
      text: "Pedido " + f.id + " saiu para entrega",
      time: "Agora",
    });
    return f;
  }
  // Cadastra uma nova loja/centro de distribuição (painel de configurações)
  function addStore(s, draft) {
    const name = (draft.name || "").trim(),
      cnpj = (draft.cnpj || "").trim();
    if (!name || !cnpj) throw Error("Informe nome e CNPJ da loja.");
    if (s.stores.some((st) => st.cnpj === cnpj))
      throw Error("Já existe uma loja cadastrada com este CNPJ.");
    const store = {
      id: "st" + (s.stores.length + 1) + "-" + Date.now(),
      name,
      type: draft.type === "cd" ? "cd" : "loja",
      cnpj,
      address: (draft.address || "").trim(),
      active: true,
    };
    s.stores.push(store);
    s.history.unshift({
      text: "Nova loja cadastrada nas configurações: " + store.name,
      time: "Agora",
    });
    return store;
  }
  // Local WedTech AI response engine
  function answer(s, q) {
    const m = metrics(s),
      low = s.products.filter((p) => p.stock < 20),
      issues = s.products.filter((p) => p.issue);
    q = q
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    if (/estoque|ruptura/.test(q))
      return low.length
        ? "Identifiquei " +
            low.length +
            " produtos com estoque baixo:\n\n" +
            low.map((p) => p.name + " — " + p.stock + " unidades.").join("\n") +
            "\n\nRecomendo planejar a reposição antes de ampliar os anúncios. O saldo é compartilhado entre os canais."
        : "Todos os produtos estão acima do limite de 20 unidades.";
    if (/erro|anuncio/.test(q))
      return issues.length
        ? issues
            .map(
              (p) =>
                p.name +
                " — o título do anúncio da Shopee precisa de revisão. Abra o produto para corrigir com WedTech AI.",
            )
            .join("\n")
        : "Nenhum erro pendente nos anúncios do catálogo.";
    if (/separa|expedi|despach/.test(q)) {
      const open = s.fulfillments.filter((f) => f.status !== "shipped");
      return open.length
        ? "Você tem " +
            open.length +
            " pedido(s) aguardando separação ou despacho:\n\n" +
            open
              .map(
                (f) =>
                  f.id +
                  " — " +
                  f.items.length +
                  " item(ns) — " +
                  fulfillmentStatus[f.status],
              )
              .join("\n") +
            "\n\nAbra o Estoque Inteligente para bipar os itens e liberar o despacho."
        : "Nenhum pedido pendente de separação no momento.";
    }
    if (/mais|giro|vendendo/.test(q)) {
      const ranked = s.products
        .map((p) => ({
          ...p,
          sold: s.orders
            .filter((o) => o.productId === p.id)
            .reduce((a, o) => a + o.quantity, 0),
        }))
        .sort((a, b) => b.sold - a.sold);
      return (
        "Produtos com mais unidades vendidas hoje:\n\n" +
        ranked
          .slice(0, 3)
          .map((p, i) => i + 1 + ". " + p.name + " — " + p.sold + " unidades.")
          .join("\n") +
        "\n\nO Mouse Gamer G500 também apresenta crescimento nesta semana. O Headset Gamer X200 está com giro abaixo da média histórica."
      );
    }
    if (/atencao|problema/.test(q))
      return (
        "Estas situações merecem atenção:\n\n" +
        low
          .map((p) => p.name + " — estoque baixo: " + p.stock + " unidades.")
          .concat(
            issues.map((p) => p.name + " — anúncio da Shopee com erro."),
            s.products
              .filter((p) => p.slow)
              .map((p) => p.name + " — vendas abaixo da média histórica."),
          )
          .join("\n") +
        "\n\nComece pela reposição dos produtos com estoque baixo."
      );
    if (/resum|operacao|hoje|vendas/.test(q))
      return (
        "Hoje sua operação registrou " +
        m.orders +
        " pedidos e " +
        new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(m.revenue) +
        " em vendas.\n\nO Mercado Livre continua sendo seu principal canal. Seu catálogo possui " +
        m.products +
        " produtos e " +
        m.stock +
        " unidades, com " +
        m.connected +
        " marketplaces conectados.\n\nIdentifiquei " +
        low.length +
        " produtos com estoque baixo, " +
        issues.length +
        " anúncio(s) que precisam de correção e " +
        m.pendingSeparations +
        " pedido(s) aguardando separação."
      );
    return "Nesta demonstração, consigo analisar estoque, produtos que precisam de atenção, vendas, erros nos anúncios e pedidos aguardando separação. Escolha uma sugestão ou peça: “Resuma minha operação.”";
  }
  // Public API for the interface and automated tests
  const api = {
    seed,
    metrics,
    sell,
    publish,
    answer,
    channels,
    fulfillmentStatus,
    findByCode,
    scanSale,
    scanReceive,
    newFulfillment,
    scanFulfillmentItem,
    confirmSeparation,
    dispatchFulfillment,
    addStore,
  };
  if (typeof module !== "undefined") module.exports = api;
  global.WedTech = api;
})(typeof window !== "undefined" ? window : globalThis);
