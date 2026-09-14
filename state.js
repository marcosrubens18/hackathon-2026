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
        " produtos com estoque baixo e " +
        issues.length +
        " anúncio(s) que precisam de correção."
      );
    return "Nesta demonstração, consigo analisar estoque, produtos que precisam de atenção, vendas e erros nos anúncios. Escolha uma sugestão ou peça: “Resuma minha operação.”";
  }
  // Public API for the interface and automated tests
  const api = { seed, metrics, sell, publish, answer, channels };
  if (typeof module !== "undefined") module.exports = api;
  global.WedTech = api;
})(typeof window !== "undefined" ? window : globalThis);
