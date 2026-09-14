const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const N = require("../dist/state.js");
test("dados iniciais e soma única do estoque", () => {
  const s = N.seed();
  assert.deepEqual(N.metrics(s), {
    revenue: 4850,
    orders: 37,
    products: 10,
    stock: 842,
    connected: 3,
    alerts: 6,
  });
  assert.equal(s.orders.filter((o) => o.channel === "ml").length, 18);
  assert.equal(s.orders.filter((o) => o.channel === "sh").length, 11);
  assert.equal(s.orders.filter((o) => o.channel === "tk").length, 8);
});
test("venda atualiza estoque, pedidos, receita e resposta da IA", () => {
  const s = N.seed();
  N.sell(s, "p0");
  assert.equal(s.products[0].stock, 17);
  assert.equal(N.metrics(s).stock, 841);
  assert.equal(N.metrics(s).revenue, 5249.9);
  assert.equal(N.metrics(s).orders, 38);
  assert.match(N.answer(s, "Tenho risco de ficar sem estoque?"), /17 unidades/);
  assert.match(N.answer(s, "Resuma minha operação."), /38 pedidos/);
  assert.equal(s.history[0].time, "Agora");
});
test("estoque nunca fica negativo", () => {
  const s = N.seed();
  for (let i = 0; i < 18; i++) N.sell(s, "p0");
  const before = N.metrics(s);
  assert.throws(() => N.sell(s, "p0"), /sem estoque/);
  assert.equal(s.products[0].stock, 0);
  assert.deepEqual(N.metrics(s), before);
});
test("publicação alimenta o catálogo e não aceita SKU repetido", () => {
  const s = N.seed();
  const d = { name: "Produto teste", sku: "TESTE-01", price: 79.9, stock: 20 };
  const p = N.publish(s, d, ["ml", "sh"], []);
  assert.equal(p.stock, 20);
  assert.equal(N.metrics(s).products, 11);
  assert.equal(N.metrics(s).stock, 862);
  assert.throws(() => N.publish(s, d, ["ml"], []), /SKU/);
  assert.throws(() => N.publish(s, { ...d, sku: "TESTE-02" }, [], []), /canal/);
});
test("correção de anúncio reflete na análise e alertas", () => {
  const s = N.seed();
  s.products[1].issue = false;
  assert.match(N.answer(s, "Existem erros nos meus anúncios?"), /Nenhum erro/);
  assert.equal(N.metrics(s).alerts, 5);
});
test("persistência serializa todos os dados e reset é independente", () => {
  const s = N.seed();
  N.sell(s, "p0");
  assert.equal(JSON.parse(JSON.stringify(s)).products[0].stock, 17);
  assert.equal(N.seed().products[0].stock, 18);
});
test("cinco áreas e etapas de anúncio renderizam sem erro", () => {
  const app = { innerHTML: "" };
  const doc = {
    querySelector: (s) => (s === "#app" ? app : null),
    body: { style: {} },
    addEventListener() {},
  };
  const context = {
    WedTech: N,
    document: doc,
    localStorage: {
      getItem() {
        return null;
      },
      setItem() {},
    },
    location: { hash: "" },
    window: { addEventListener() {}, scrollTo() {} },
    setTimeout,
    clearTimeout,
    console,
    FileReader: class {},
  };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync("dist/app.js", "utf8"), context);
  for (const route of ["dashboard", "produtos", "one", "marketplaces", "ai"]) {
    vm.runInContext(`page='${route}';render()`, context);
    assert.ok(app.innerHTML.includes("WedTech"));
    assert.ok(!app.innerHTML.includes("undefined"));
  }
  vm.runInContext("modal='p0';render()", context);
  assert.ok(app.innerHTML.includes("18"));
  vm.runInContext(
    "modal=null;page='one';draft={name:'Teste',description:'Descrição',price:100};selected=['ml'];ads=[{channel:'ml',title:'Teste',description:'Descrição',warning:'GTIN não informado.',fixed:false}];oneStage=2;render()",
    context,
  );
  assert.ok(app.innerHTML.includes("Corrigir com WedTech AI"));
  vm.runInContext("ads[0].fixed=true;oneStage=3;render()", context);
  assert.ok(app.innerHTML.includes('data-action="publish"'));
});
test("dashboard destaca o WedTech AI e oferece navegação acessível", () => {
  const app = { innerHTML: "" };
  const doc = {
    querySelector: (s) => (s === "#app" ? app : null),
    body: { style: {} },
    addEventListener() {},
  };
  const context = {
    WedTech: N,
    document: doc,
    localStorage: {
      getItem() {
        return null;
      },
      setItem() {},
    },
    location: { hash: "#dashboard" },
    window: { addEventListener() {}, scrollTo() {} },
    setTimeout,
    clearTimeout,
    console,
    FileReader: class {},
  };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync("dist/app.js", "utf8"), context);
  assert.match(app.innerHTML, /WEDTECH AI · COPILOTO DA OPERAÇÃO/);
  assert.match(app.innerHTML, /id="dashboard-ai-form"/);
  assert.match(app.innerHTML, /37 pedidos/);
  assert.match(app.innerHTML, /Pular para o conteúdo principal/);
  assert.match(app.innerHTML, /aria-label="Navegação principal"/);
  assert.match(app.innerHTML, /id="main-content" tabindex="-1"/);
  assert.match(app.innerHTML, /for="dashboard-ai-question"/);
});
