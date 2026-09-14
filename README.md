# WedTech — Protótipo Hackathon

Central Inteligente de E-commerce e Marketplaces da WedTech.
**Um produto. Todos os canais. Uma única inteligência.**

Identidade visual baseada em azul-marinho, azul tecnológico, grafite e superfícies claras. Slogan institucional: **Tecnologia e conexão para o futuro.**

## Abrir

Abra `dist/index.html` no navegador. Não precisa instalar dependências, criar conta, informar chave ou conectar serviços.

Alternativamente, com Node.js instalado, execute `npm start` nesta pasta e abra http://127.0.0.1:4173. Para encerrar, use Ctrl+C no terminal.

## Roteiro de apresentação (5 a 7 minutos)

1. **Dashboard (30 s):** apresente indicadores, gráfico e recomendações do copiloto.
2. **Produtos (30 s):** mostre o catálogo único (com código de barras por produto) e abra Nike Revolution 8.
3. **WedTech One (90 s):** clique em “Preencher exemplo”, altere os dados se desejar e prepare os anúncios. Compare as versões por canal, corrija os avisos com WedTech AI e publique.
4. **Estoque Inteligente (90 s):** abra **Estoque Inteligente**. Bipe o SKU `NK-RV8-001` em modo Saída (venda balcão) e mostre a sincronização. Abra o pedido **SEP-2201**, bipe `MS-G500-003` e `TC-K68-007` (ou seus códigos de barras), confirme a separação e despache — mostrando o fluxo “venda no marketplace → separação física → baixa → despacho”. Clique em “+ Simular pedido de marketplace” para gerar um novo pedido na fila ao vivo.
5. **Marketplaces (20 s):** simule a conexão do Magalu.
6. **Configurações (20 s):** mostre os dados da empresa, as lojas/CDs cadastrados (usados pelo leitor IoT) e cadastre uma nova loja ao vivo.
7. **WedTech AI (30 s):** clique em “Resuma minha operação.” O resumo incorpora a venda, a publicação e os pedidos aguardando separação.

Use **Reiniciar demonstração** no rodapé da barra lateral antes da próxima apresentação.

## Dados e limites

- 10 produtos completos, estoque total de 842 unidades, 37 pedidos e R$ 4.850 em vendas iniciais.
- Os indicadores e quantidades de produtos por canal são calculados a partir do catálogo, em vez de exibir os totais ilustrativos de 128/97/84/42 do briefing.
- `dist/state.js` é a fonte única de regras e dados. `localStorage` guarda alterações por navegador/origem; se indisponível, a sessão continua em memória.
- O gráfico semanal e a participação por canal representam histórico fictício; novos pedidos também atualizam esses indicadores.
- A IA usa respostas locais pré-programadas e os dados atuais. Avisos de GTIN e título são exemplos didáticos, não validações reais de marketplaces.
- GTIN/EAN demonstrativo não é um código comercial válido.
- **Estoque Inteligente:** cada produto tem um código de barras (EAN) demonstrativo além do SKU. O leitor de código de barras é simulado por um campo de texto — digite o SKU ou o código para "bipar". Saída = venda imediata na loja física; Entrada = soma ao estoque (recebimento/reposição). Pedidos de marketplace entram numa fila de separação; cada item precisa ser bipado e conferido contra o pedido antes de liberar a baixa de estoque e o despacho. Todas as leituras ficam no histórico de rastreabilidade.
- **Configurações:** dados da empresa (razão social/CNPJ/IE) e lojas/centros de distribuição são editáveis e ficam salvos como os demais dados da demonstração. Operadores são ilustrativos, sem autenticação real.
- Publicações, conexões, vendas e leituras do leitor IoT não fazem nenhuma chamada a APIs externas ou hardware real. Uploads de imagem ficam locais, limitados a 1 MB por imagem.
- Protótipo sem backend, autenticação, pagamentos ou integrações. HTML, CSS e JavaScript sem dependências; funciona offline.

## Verificação

Execute `npm run check` para verificar sintaxe e testes de consistência: estoque, vendas, publicação, correção de anúncio, leitor IoT (entrada/saída), separação e despacho de pedidos, cadastro de lojas, persistência e renderização das sete áreas.

A interface opcional WebMCP expõe apenas consulta ao resumo da operação, com detecção de suporte. Não foi validada em um navegador com WebMCP disponível. A navegação e os fluxos principais não dependem desse recurso. A validação realizada foi por testes locais de estado e renderização, sem automação visual do navegador.
