# 🏅 Atlética Shop (A.A.A.A.C.H)

Sistema full-stack robusto desenvolvido para a gestão de vendas e controle de estoque de produtos da atlética universitária. O projeto oferece uma experiência completa desde a vitrine de produtos até o painel administrativo para controle financeiro.

---

## 🚀 Tecnologias

* **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
* **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
* **Estilização**: [Tailwind CSS](https://tailwindcss.com/)
* **Banco de Dados**: [Supabase](https://supabase.com/) (PostgreSQL)
* **UI/UX**: Headless UI & Heroicons

---

## 🛠️ Funcionalidades

### 🛒 Área do Cliente (Storefront)
- **Vitrine Dinâmica**: Listagem de produtos em tempo real com integração direta ao banco de dados.
- **Gestão de Carrinho**: Drawer interativo que permite adicionar, remover e gerenciar quantidades antes da compra.
- **Notificação Visual**: Quando adicionado um produto ao carrinho é carregado uma notificação visual para confirmar.
- **Checkout PIX**: Fluxo de pagamento focado em agilidade com geração de código "Copia e Cola".
- **Histórico de Compras**: Página exclusiva para o usuário acompanhar o status (Pendente/Pago) e os detalhes de seus pedidos.

### 🛡️ Painel Administrativo (Dashboard)
- **Gestão de Pedidos**: Visualização centralizada de todas as vendas realizadas.
- **Controle de Status**: Alteração manual de status de pagamento (ex: validar o PIX e marcar como 'Pago').
- **Gestão de Estoque**: Interface para controle de quantidades e preços dos produtos.

### ⚙️ Regras de Negócio & Segurança
- **Validação de Estoque**: Sistema que impede o usuário de adicionar ao carrinho ou finalizar uma compra se a quantidade desejada for superior ao saldo em estoque.
- **Integridade do Histórico**: O sistema salva um "snapshot" do nome e preço do produto no momento da compra, garantindo que o histórico do usuário não mude caso o produto seja alterado futuramente na vitrine.
- **Atomicidade em Transações**: Processamento que garante a criação do pedido, registro dos itens e limpeza do carrinho em uma única operação lógica.

---

## 🔧 Como Rodar o Projeto

- **Acessar o site via link**:
   [Atletica Shop](https://atletica-shop.vercel.app/)
