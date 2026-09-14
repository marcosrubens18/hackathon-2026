# WedTech — Protótipo Hackathon

Central Inteligente de E-commerce e Marketplaces da WedTech.
**Um produto. Todos os canais. Uma única inteligência.**

Identidade visual baseada em azul-marinho, azul tecnológico, grafite e superfícies claras. Slogan institucional: **Tecnologia e conexão para o futuro.**

## Abrir

Abra `dist/index.html` no navegador. Não precisa instalar dependências, criar conta, informar chave ou conectar serviços.

Alternativamente, com Node.js instalado, execute `npm start` nesta pasta e abra http://127.0.0.1:4173. Para encerrar, use Ctrl+C no terminal.

## Roteiro de apresentação (7 a 10 minutos)

1. **Dashboard (40 s):** apresente indicadores, gráfico e recomendações do copiloto. Clique no sino de **notificações** para mostrar o histórico de eventos ("Nova venda no Mercado Livre..."). Ative **"Operação ao vivo"** para a demo gerar novos pedidos sozinha em segundo plano.
2. **Produtos (30 s):** mostre o catálogo único (com código de barras por produto) e abra Nike Revolution 8.
3. **WedTech One (90 s):** clique em “Preencher exemplo”, altere os dados se desejar e prepare os anúncios. Compare as versões por canal, corrija os avisos com WedTech AI e publique.
4. **Estoque Inteligente (2 min):** abra **Estoque Inteligente**.
   - Bipe o SKU `NK-RV8-001` em modo Saída (venda balcão) — mostra a sincronização e a **NF simulada** gerada.
   - Abra o pedido **SEP-2201**, bipe `MS-G500-003` e `TC-K68-007` (ou seus códigos de barras), confirme a separação e despache — mostrando o fluxo “venda no marketplace → separação física → baixa → NF/etiqueta → despacho”.
   - Mostre a seção **Previsão de ruptura** (estimativa de dias até esgotar) e clique em **"Gerar pedidos automaticamente"** para criar um pedido de compra a um fornecedor a partir dessa previsão — a peça de automação da Dor 1.
   - Clique em **"Simular contagem física"** para mostrar uma divergência de inventário e corrigi-la com um clique ("Corrigir com WedTech AI").
5. **Marketplaces (20 s):** simule a conexão do Magalu.
6. **Financeiro (30 s):** mostre receita, custo das vendas, lucro bruto/líquido e a margem por produto. Registre uma despesa ao vivo.
7. **Configurações (30 s):** mostre os dados da empresa, as lojas/CDs (usados pelo leitor IoT) e os fornecedores (usados na reposição automática). Cadastre uma nova loja ou fornecedor ao vivo.
8. **WedTech AI (30 s):** clique em “Resuma minha operação.” O resumo incorpora vendas, separações, pedidos de compra em aberto e mais. Pergunte também “Qual meu lucro hoje?” ou “Tenho pedidos de compra em aberto?”.

Use **Reiniciar demonstração** no rodapé da barra lateral antes da próxima apresentação (também desliga a operação ao vivo, se estiver ativa).

## Dados e limites

- 10 produtos completos, estoque total de 842 unidades, 37 pedidos e R$ 4.850 em vendas iniciais.
- Os indicadores e quantidades de produtos por canal são calculados a partir do catálogo, em vez de exibir os totais ilustrativos de 128/97/84/42 do briefing.
- `dist/state.js` é a fonte única de regras e dados. `localStorage` guarda alterações por navegador/origem; se indisponível, a sessão continua em memória.
- O gráfico semanal e a participação por canal representam histórico fictício; novos pedidos também atualizam esses indicadores.
- A IA usa respostas locais pré-programadas e os dados atuais. Avisos de GTIN e título são exemplos didáticos, não validações reais de marketplaces.
- GTIN/EAN demonstrativo não é um código comercial válido.
- **Estoque Inteligente:** cada produto tem um código de barras (EAN) demonstrativo além do SKU. O leitor de código de barras é simulado por um campo de texto — digite o SKU ou o código para "bipar". Saída = venda imediata na loja física; Entrada = soma ao estoque (recebimento/reposição). Pedidos de marketplace entram numa fila de separação; cada item precisa ser bipado e conferido contra o pedido antes de liberar a baixa de estoque e o despacho. Todas as leituras ficam no histórico de rastreabilidade.
- **Previsão de ruptura:** estimativa de dias até esgotar calculada a partir da velocidade de venda de hoje de cada produto (não é uma previsão estatística real). Produtos abaixo do estoque mínimo (20 unidades, configurável no código) entram automaticamente na previsão.
- **Fornecedores e pedidos de compra:** cada produto tem um fornecedor vinculado. "Gerar pedidos automaticamente" cria pedidos de compra para produtos abaixo do mínimo que ainda não têm um pedido em aberto — a quantidade sugerida considera o estoque mínimo e o prazo de entrega do fornecedor. Não há envio real a nenhum fornecedor.
- **Divergência de inventário:** "Simular contagem física" gera uma pequena diferença determinística entre o estoque do sistema e uma contagem física fictícia, para demonstrar o fluxo de correção assistida pela WedTech AI.
- **NF e etiqueta:** geradas automaticamente a cada venda física ou despacho de pedido. São documentos demonstrativos (inclusive a "chave de acesso" e o código de rastreio) e **não têm validade fiscal ou logística real**.
- **Financeiro:** custo de aquisição por produto e despesas operacionais são estimativas simuladas (despesas com rateio diário, comparável à receita "de hoje" exibida no restante do app), não dados contábeis reais.
- **Notificações e operação ao vivo:** o sino no topo mostra os últimos eventos (vendas, separações, despachos, reposições) e zera o contador ao abrir. "Operação ao vivo" gera novos pedidos de marketplace periodicamente enquanto ativado, só para manter a demonstração em movimento.
- **Configurações:** dados da empresa (razão social/CNPJ/IE), lojas/centros de distribuição e fornecedores são editáveis e ficam salvos como os demais dados da demonstração. Operadores são ilustrativos, sem autenticação real.
- Publicações, conexões, vendas, leituras do leitor IoT, pedidos de compra, NF e etiquetas não fazem nenhuma chamada a APIs externas ou hardware/serviços reais. Uploads de imagem ficam locais, limitados a 1 MB por imagem.
- Protótipo sem backend, autenticação, pagamentos ou integrações. HTML, CSS e JavaScript sem dependências; funciona offline.

## Verificação

Execute `npm run check` para verificar sintaxe e testes de consistência: estoque, vendas, publicação, correção de anúncio, leitor IoT (entrada/saída), separação e despacho de pedidos com NF/etiqueta, previsão de ruptura, pedidos de compra a fornecedores, divergência de inventário, financeiro (lucro/despesas), notificações, cadastro de lojas/fornecedores, persistência e renderização das oito áreas.

A interface opcional WebMCP expõe apenas consulta ao resumo da operação, com detecção de suporte. Não foi validada em um navegador com WebMCP disponível. A navegação e os fluxos principais não dependem desse recurso. A validação realizada foi por testes locais de estado e renderização, sem automação visual do navegador.
