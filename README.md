# 🏅 Atlética Shop (A.A.A.A.C.H)

Sistema full-stack robusto desenvolvido para a gestão de vendas e controle de estoque de produtos da atlética universitária. O projeto oferece uma experiência completa desde a vitrine de produtos até o painel administrativo para controle financeiro e automação de pagamentos.

---

## 🚀 Tecnologias

* **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
* **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
* **Estilização**: [Tailwind CSS](https://tailwindcss.com/)
* **Banco de Dados**: [Supabase](https://supabase.com/) (PostgreSQL)
* **Pagamentos**: [Mercado Pago SDK](https://www.mercadopago.com.br/developers/)
* **Infraestrutura**: [Vercel](https://vercel.com/)

---

## 🛠️ Funcionalidades

### 🛒 Área do Cliente (Storefront)
- **Vitrine Dinâmica**: Listagem de produtos em tempo real sincronizada com o estoque do banco de dados.
- **Gestão de Carrinho**: Drawer interativo para gerenciamento de itens com persistência local.
- **Notificação Visual**: Feedback instantâneo (Toasts) ao adicionar ou remover itens.
- **Checkout PIX Automatizado**: Geração de QR Code dinâmico e código "Copia e Cola" via API oficial.
- **Histórico de Compras**: Área logada para acompanhar o status (Pendente/Pago) e detalhes dos itens adquiridos.

### 🛡️ Painel Administrativo (Dashboard)
- **Gestão de Pedidos**: Painel centralizado para visualização de faturamento e fluxo de vendas.
- **Controle de Status**: Monitoramento em tempo real de pagamentos aprovados.
- **Gestão de Estoque**: CRUD completo para produtos, preços e controle de inventário.

### ⚙️ Regras de Negócio & Segurança
- **Webhooks de Pagamento**: Integração com o Mercado Pago que valida o recebimento do dinheiro e atualiza o banco de dados automaticamente, garantindo a entrega mesmo se o cliente sair da página.
- **Validação de Estoque**: Trava de segurança que impede vendas acima do saldo disponível.
- **Integridade do Histórico (Snapshots)**: O sistema grava o preço e nome do produto no ato da compra, protegendo o histórico financeiro de alterações futuras no catálogo.
- **Atomicidade**: Processamento backend que garante que o pedido só seja concluído se todas as etapas (registro, baixa no estoque e limpeza do carrinho) ocorrerem com sucesso.

---

## 🔌 Integração de Pagamento (Backend)

O projeto utiliza uma arquitetura de **API Routes** do Next.js para manter a segurança das chaves privadas:

* `/api/checkout/pix`: Valida o carrinho e solicita a geração do pagamento ao Mercado Pago.
* `/api/webhooks/mercadopago`: Recebe notificações IPN/Webhook para confirmar o pagamento e liberar o pedido de forma automatizada.

---

## 📸 Preview

**Catálogo**
<img width="1285" height="743" alt="AtleticaShop" src="https://github.com/user-attachments/assets/823e1583-db2d-4c03-85ae-9bc60bbff721" />

**Histórico de Compras**
<img width="1263" height="431" alt="image" src="https://github.com/user-attachments/assets/cb5e7953-be6e-4075-925d-a84473a7143a" />


---

## 🔧 Como Rodar o Projeto

- **Acessar a versão de produção**:
   [Atletica Shop](https://atletica-shop.vercel.app/)
