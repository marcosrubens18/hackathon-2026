# WedTech — Protótipo Hackathon

Central Inteligente de E-commerce e Marketplaces da WedTech.
**Um produto. Todos os canais. Uma única inteligência.**

Identidade visual baseada em azul-marinho, azul tecnológico, grafite e superfícies claras. Slogan institucional: **Tecnologia e conexão para o futuro.**

## Abrir

Abra `dist/index.html` no navegador. Não precisa instalar dependências, criar conta, informar chave ou conectar serviços.

Alternativamente, com Node.js instalado, execute `npm start` nesta pasta e abra http://127.0.0.1:4173. Para encerrar, use Ctrl+C no terminal.

## Roteiro de apresentação (3 a 5 minutos)

1. **Dashboard (30 s):** apresente indicadores, gráfico e recomendações do copiloto.
2. **Produtos (30 s):** mostre o catálogo único e abra Nike Revolution 8.
3. **WedTech One (90 s):** clique em “Preencher exemplo”, altere os dados se desejar e prepare os anúncios. Compare as versões por canal, corrija os avisos com WedTech AI e publique.
4. **Estoque (40 s):** abra Produtos → Nike Revolution 8 → Simular venda. Mostre 18 → 17 e os canais sincronizados.
5. **Marketplaces (20 s):** simule a conexão do Magalu.
6. **WedTech AI (30 s):** clique em “Resuma minha operação.” O resumo incorpora a venda e a publicação.

Use **Reiniciar demonstração** no rodapé da barra lateral antes da próxima apresentação.

## Dados e limites

- 10 produtos completos, estoque total de 842 unidades, 37 pedidos e R$ 4.850 em vendas iniciais.
- Os indicadores e quantidades de produtos por canal são calculados a partir do catálogo, em vez de exibir os totais ilustrativos de 128/97/84/42 do briefing.
- `dist/state.js` é a fonte única de regras e dados. `localStorage` guarda alterações por navegador/origem; se indisponível, a sessão continua em memória.
- O gráfico semanal e a participação por canal representam histórico fictício; novos pedidos também atualizam esses indicadores.
- A IA usa respostas locais pré-programadas e os dados atuais. Avisos de GTIN e título são exemplos didáticos, não validações reais de marketplaces.
- GTIN demonstrativo não é um código comercial válido.
- Publicações, conexões e vendas não fazem nenhuma chamada a APIs externas. Uploads de imagem ficam locais, limitados a 1 MB por imagem.
- Protótipo sem backend, autenticação, pagamentos ou integrações. HTML, CSS e JavaScript sem dependências; funciona offline.

## Verificação

Execute `npm run check` para verificar sintaxe e testes de consistência: estoque, vendas, publicação, correção de anúncio, persistência e renderização das cinco áreas.

A interface opcional WebMCP expõe apenas consulta ao resumo da operação, com detecção de suporte. Não foi validada em um navegador com WebMCP disponível. A navegação e os fluxos principais não dependem desse recurso. A validação realizada foi por testes locais de estado e renderização, sem automação visual do navegador.
