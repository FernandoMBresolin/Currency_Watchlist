## Currency Watchlist API
Esta é a API backend da aplicação Currency Watchlist, construída com Flask para gerenciar uma watchlist de moedas fiduciárias e criptomoedas. Ela armazena moedas em um banco SQLite, permite adicionar, atualizar e remover moedas, e fornece documentação interativa via Swagger.

# Tecnologias Utilizadas
- Python 3.11: Linguagem principal.
- Flask: Framework web para a API.
- Flask-RESTful: Estruturação de endpoints.
- Flask-SQLAlchemy: ORM para o banco SQLite.
- Flask-CORS: Suporte a requisições cross-origin.
- Flask-Swagger-UI: Documentação OpenAPI/Swagger.
- SQLite: Banco de dados leve.

# Pré-requisitos
Para rodar a API localmente ou com Docker, você precisa de:
- Python 3.11 (para execução local).
- pip (para instalar dependências).
- Docker e Docker Compose (se usar containers).
- Opcional: Frontend rodando em http://localhost:8080 para integração completa (veja o repositório do frontend).

# Estrutura do Projeto
backend/
- ├── app.py            # Arquivo principal da API
- ├── schema/
- │   └── database.py   # Configuração do banco SQLite
- ├── model/
- │   └── currency.py   # Modelo da entidade Currency
- ├── static/
- │   └── swagger.json  # Documentação Swagger
- ├── requirements.txt  # Dependências do Python
- ├── Dockerfile        # Configuração para Docker
- └── README.md         # Este arquivo

# Como Executar
Opção 1: Com Docker (Recomendado)
1. Certifique-se de que o Docker e o Docker Compose estão instalados.
2. No diretório raiz do projeto (onde está o docker-compose.yml), execute:
docker-compose up --build
3. Acesse a API em http://localhost:5000 (redireciona para Swagger).
4. Acesse a documentação em http://localhost:5000/swagger.
5. Para parar:
docker-compose down

Opção 2: Localmente
1. Clone o repositório e entre no diretório backend/:
cd backend
2. Crie um ambiente virtual:
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
3. Instale as dependências:
pip install -r requirements.txt
4. Execute a API:
python app.py
5. Acesse a API em http://localhost:5000 (redireciona para Swagger).

# Endpoints da API
A API oferece os seguintes endpoints:

- GET /currencies
  - Retorna a lista de moedas na watchlist.
  - Resposta: Array de moedas ou {"message": "Nenhuma moeda na lista"}.
  - Exemplo: [{"code": "USD", "name": "Dólar Americano", "rate": 5.5, "updated_at": "2025-04-12T00:00:00"}]
- POST /currencies
  - Adiciona uma nova moeda.
  - Corpo: {"code": "USD", "name": "Dólar Americano", "rate": null}
  - Resposta: Moeda adicionada ou erro (400, 409).
  - Restrição: Apenas códigos permitidos (ex.: USD, EUR, BTC).
- PUT /currencies/<code>
  - Atualiza a taxa de uma moeda.
  - Corpo: {"rate": 5.6}
  - Resposta: Moeda atualizada ou erro 404.
- DELETE /currencies/<code>
  - Remove uma moeda.
  - Resposta: {"message": "Moeda removida"} ou erro 404.
Explore todos os endpoints em http://localhost:5000/swagger.

# Integração com o Frontend
- O frontend (rodando em http://localhost:8080) consome esta API para gerenciar a watchlist e atualizar taxas.
- Certifique-se de que a API está rodando antes de iniciar o frontend.
- A API suporta CORS, permitindo requisições do frontend.

# Banco de Dados
- Usa SQLite (watchlist.db) para armazenar moedas.
- Campos: code (ex.: "USD"), name (ex.: "Dólar Americano"), rate (float ou null), updated_at (timestamp ou null).
- O banco é inicializado automaticamente com BRL incluído.

# Desenvolvimento
- Para adicionar novas moedas permitidas, edite ALLOWED_CURRENCIES em app.py.
- Para modificar endpoints, edite as classes CurrencyList e CurrencyResource em app.py.
- Para atualizar a documentação, modifique swagger_config em app.py e rebuild o projeto.
- Use o Swagger (/swagger) para testar endpoints durante o desenvolvimento.

# Problemas Comuns
- Erro 500 no banco: Verifique se watchlist.db tem permissões de escrita no diretório backend/.
- CORS bloqueado: Confirme que o frontend está acessando http://127.0.0.1:5000.
- Swagger não carrega: Certifique-se de que static/swagger.json foi gerado corretamente.
- Taxas não persistem: Verifique se as chamadas PUT estão atualizando rate e updated_at no banco.
