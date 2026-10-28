# API Testes de Produtos

Projeto de testes automatizados de integração para validar os endpoints de autenticação e gerenciamento de produtos de uma API REST. As requisições são enviadas à API configurada no ambiente e as respostas são verificadas por meio de asserções.

**Aplicação testada:** [API de Gestão de Produtos](https://github.com/iagosantini7/api-gestao-produtos).

## Tecnologias

| Tecnologia | Uso |
| --- | --- |
| [Node.js](https://nodejs.org/) | Ambiente de execução JavaScript |
| [npm](https://www.npmjs.com/) | Instalação de dependências e execução de scripts |
| [Mocha](https://mochajs.org/) | Organização e execução dos testes |
| [Chai](https://www.chaijs.com/) | Asserções sobre respostas da API |
| [Supertest](https://github.com/ladjs/supertest) | Envio de requisições HTTP para os testes |
| [Mochawesome](https://github.com/adamgruber/mochawesome) | Geração de relatório HTML para a suíte completa |
| [dotenv](https://github.com/motdotla/dotenv) | Carregamento de variáveis do arquivo `.env` |

## Requisitos

- Node.js e npm instalados. É necessária uma versão do Node.js com suporte a ES Modules e à sintaxe de importação de JSON usada pelo projeto.
- A API em execução e acessível pela URL definida em `BASE_URL`.
- O banco de dados da aplicação inicializado pelo script de criação do banco. Esse script cria o usuário utilizado nos testes que exigem autenticação; as credenciais esperadas estão em `fixtures/postLogin.json`.

## Configuração

1. Instale as dependências do projeto:

   ```bash
   npm ci
   ```

   `npm install` também pode ser usado para instalar ou atualizar dependências.

2. Crie o arquivo `.env` a partir do exemplo:

   ```bash
   cp .env.example .env
   ```

   No PowerShell:

   ```powershell
   Copy-Item .env.example .env
   ```

3. Confira a URL da API em `.env`:

   ```env
   BASE_URL=http://localhost:3000
   ```

   Se a API estiver em outro endereço, atualize o valor de `BASE_URL`. O arquivo `.env` é local e não deve ser versionado.

4. Configure e inicialize o banco de dados da aplicação executando o script de criação do banco. O usuário de teste usado nos cenários autenticados é criado por esse script; não é necessário cadastrá-lo manualmente.

5. Inicie a API em um terminal separado. Este projeto executa os testes, mas não inicia o servidor da API.

## Execução

Execute os comandos a partir da raiz do projeto.

### Suíte completa

```bash
npm test
```

Executa os testes de autenticação e produtos. O Mocha gera um relatório Mochawesome no diretório `mochawesome-report/`.

### Somente autenticação

```bash
npm run test:login
```

Executa os testes definidos em `test/login.test.js`.

### Somente produtos

```bash
npm run test:produto
```

Executa os testes definidos em `test/produto.test.js`.

> **Atenção:** os testes de cadastro criam usuários e produtos na API. Execute-os em um ambiente de teste com dados descartáveis.

## Estrutura do projeto

```text
.
├── fixtures/       # Dados de entrada para os testes
├── helpers/        # Funções auxiliares, como autenticação
└── test/           # Testes de integração da API
```
