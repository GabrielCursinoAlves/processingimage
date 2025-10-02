# 🚀 Sistema de Processamento Assíncrono Confiável (Padrão Outbox)

## Visão Geral

Este projeto demonstra uma solução de **Engenharia de Software de Nível Intermediário** para o desafio de **Consistência de Dados** em arquiteturas de Microsserviços.

O software foi criado para resolver um problema comum em sistemas que lidam com **grande volume de processos simultâneos** (como o registro de novos uploads ou eventos complexos). A alta demanda exigiu uma solução que pudesse **desacoplar** a API principal do processamento demorado. Para isso, escolhemos o **RabbitMQ**, um serviço de mensageria que oferece **durabilidade, armazenamento confiável e escalabilidade** através do padrão **Publish/Subscribe**.

Para garantir que a comunicação com essa mensageria seja 100% segura, o sistema utiliza o **Padrão Outbox Transacional**. Isso garante que a alteração no banco de dados e a emissão de um evento para o RabbitMQ sejam operações atômicas, eliminando a possibilidade de perda de mensagens.

O sistema é composto por três processos desacoplados, todos gerenciados pelo PM2 para máxima robustez e disponibilidade.

---

## Arquitetura e Conceitos Chave

A arquitetura resolve o problema do "duplo-write" (escrever no DB e na fila) usando três componentes distintos:

1.  **Produtor (API):**
    * Recebe a requisição (ex: upload de imagem).
    * Executa uma **Transação Atômica**: salva o dado principal **e** um registro na tabela `Outbox` na mesma operação.
    * Não se comunica diretamente com o RabbitMQ.

2.  **Relayer (Worker):**
    * Um processo de *background* separado, gerenciado pelo PM2.
    * Faz o **polling** da tabela `Outbox` a cada 5 segundos buscando registros `sent: false`.
    * Envia a mensagem para o RabbitMQ e, **somente após o sucesso**, atualiza o registro para `sent: true`.

3.  **Consumer (Worker):**
    * Um processo de *background* dedicado que escuta a fila do RabbitMQ.
    * Processa a mensagem e registra o histórico de consumo.
    * É completamente **desacoplado** do servidor API.

---

## Tecnologias Utilizadas

* **Backend:** Node.js, TypeScript
* **Banco de Dados:** PostgreSQL (Prisma ORM)
* **Mensageria:** RabbitMQ
* **Gerenciamento de Processos:** PM2 (para gerenciar Workers e garantir o *uptime*)
* **Execução:** TSX (para rodar arquivos `.ts` diretamente)

---

## ⚙️ Instalação e Configuração

### Pré-requisitos

Você precisa ter instalado e configurado em sua máquina:

1.  Node.js (versão LTS)
2.  PostgreSQL
3.  RabbitMQ (ou um container Docker em execução)

### Passos

1.  **Clone o Repositório:**
    ```bash
    git clone [LINK DO SEU REPOSITÓRIO]
    cd [NOME DA PASTA]
    ```

2.  **Instale as Dependências:**
    ```bash
    npm install
    npm install -g pm2 # Instalação global do PM2
    npm install -g pm2-windows-service # Necessário se estiver no Windows
    ```

3.  **Variáveis de Ambiente:**
    Crie o arquivo `.env` na raiz do projeto com as suas credenciais de banco de dados e RabbitMQ.

4.  **Crie o `ecosystem.config.js`:**
    Use o comando `npx pm2 init` para gerar o arquivo de configuração e personalize-o para incluir os scripts da **API**, do **Relayer** e do **Consumer**, garantindo que usem o `tsx` como `interpreter`.

---

## ▶️ Como Executar o Projeto

### Execução em Produção (Com PM2)

Utilizamos o PM2 para gerenciar todos os processos de uma vez, garantindo robustez.

1.  **Inicie Todos os Serviços:**
    Execute o comando configurado para iniciar a API, o Relayer e o Consumer simultaneamente:

    ```bash
    npm run pm2-start
    ```

2.  **Verifique o Status:**
    Confirme que todos os processos estão rodando e online:

    ```bash
    npx pm2 list
    ```

3.  **Monitore os Logs:**
    Para ver a saída do Relayer (confirmando o envio das mensagens) ou do Consumer (confirmando o processamento):

    ```bash
    # Logs em tempo real de todos os processos
    npx pm2 logs

    # Logs apenas do Relayer
    npx pm2 logs producerQueueSend
    npx pm2 logs listenQueueCallback
    ```

---

## 💻 Scripts de Desenvolvimento Local

Para desenvolvimento e inspeção de dados, você pode usar os seguintes scripts:

1.  **Rodar a API em Modo `Watch` (Desenvolvimento):**
    Inicia o servidor em modo de observação (`--watch`), reiniciando automaticamente em caso de alteração no código. Útil para testar a API rapidamente.

    ```bash
    npm run dev
    ```

2.  **Acessar o Prisma Studio (Debug/Inspeção):**
    Inicia a interface gráfica do Prisma para que você possa inspecionar visualmente os dados das tabelas, incluindo o status `sent: false` da tabela `Outbox`.

    ```bash
    npm run prisma-studio
    ```

---

## 🛡️ Gerenciamento de Processos

Se você instalou o PM2 como um serviço (recomendado para produção), o sistema irá iniciar automaticamente com o seu servidor.

* **Parar Tudo:** `npx pm2 stop all`
* **Reiniciar Tudo:** `npx pm2 restart all`
* **Desinstalar o Serviço:** `npx pm2-service-uninstall` (no Windows)

---

## Status do Projeto

✅ **Funcionalidade Principal:** Concluída (Outbox Pattern implementado e funcionando de ponta a ponta).

### Próximos Passos (Próximas Features)

* [ ] Implementar o **Padrão SAGA** para transações de compensação.
* [ ] Adicionar **Observabilidade** (Prometheus e Grafana) para monitorar o *lag* da fila Outbox em tempo real.