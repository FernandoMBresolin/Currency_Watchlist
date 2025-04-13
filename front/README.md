# Currency Watchlist Frontend
Este é o frontend da aplicação Currency Watchlist, uma ferramenta para acompanhar taxas 
de câmbio de moedas fiduciárias e criptomoedas. Ele permite adicionar moedas a uma watchlist, 
atualizar taxas em tempo real e exibir valores em USD ou BRL.

## Tecnologias Utilizadas
- HTML: Estrutura da página.
- CSS: Estilização com cards responsivos e gradientes.
- JavaScript: Lógica para interagir com a API externa de taxas e o backend Flask.
- Nginx (com Docker): Servidor para hospedar os arquivos estáticos.

## Pré-requisitos
Para rodar o frontend localmente ou com Docker, você precisa de:
- Navegador web moderno (ex.: Chrome, Firefox).
- Node.js (opcional, apenas se usar Live Server para desenvolvimento local).
- Docker e Docker Compose (se usar containers).
- Backend rodando em http://127.0.0.1:5000 (veja o repositório do backend para instruções).

## Estrutura do Projeto
frontend/
- ├── index.html        # Página principal
- ├── styles.css        # Estilos da interface
- ├── script.js         # Lógica de interação com APIs
- ├── Dockerfile        # Configuração para Docker
- └── README.md         # Este arquivo

## Como Executar
Opção 1: Com Docker (Recomendado)
1. Certifique-se de que o Docker e o Docker Compose estão instalados.
2. No diretório raiz do projeto (onde está o docker-compose.yml), execute:
docker-compose up --build
3. Acesse o frontend em http://localhost:8080.
4. Para parar:
docker-compose down

Opção 2: Localmente com Live Server
1. Instale a extensão Live Server no VS Code.
2. Abra o diretório frontend/ no VS Code.
3. Clique com o botão direito em index.html e selecione "Open with Live Server".
4. Acesse em http://localhost:5500 (ou a porta configurada).
5. Nota: Certifique-se de que o backend está rodando em http://127.0.0.1:5000.

Opção 3: Localmente com Navegador
1. Abra o arquivo index.html diretamente no navegador (ex.: file:///caminho/para/frontend/index.html).
2. Limitação: Algumas funcionalidades (como chamadas à API) podem não funcionar devido a 
restrições de CORS, então use esta opção apenas para visualizar a interface estática.

## Integração com o Backend
- O frontend se comunica com o backend Flask em http://127.0.0.1:5000 para:
 - Listar moedas salvas (GET /currencies).
 - Adicionar moedas (POST /currencies).
 - Atualizar taxas (PUT /currencies/<code>).
 - Remover moedas (DELETE /currencies/<code>).
- Certifique-se de que o backend está rodando antes de usar o frontend.

## Integração com API Externa
- Usa a API Currency Freaks para obter taxas de câmbio em tempo real.
- https://currencyfreaks.com/
- Esta API está sendo utilizada no modo FREE, é necessário apenas um cadastro para liberar 1000
consultas por mês.
- Endpoint utilizado: Get Rates of Desired Currencies Only, retorna a última taxa disponível 
da moeda escolhida.
- A chave da API está configurada no script.js. Substitua-a por sua própria chave, se necessário.

## Desenvolvimento
- Para modificar o frontend:
 1. Edite index.html, styles.css ou script.js.
 2. Teste localmente com Live Server ou rebuild com Docker.
- Para adicionar novas moedas, atualize a lista currencies em script.js e sincronize com o backend.

## Problemas Comuns
- CORS Error: Certifique-se de que o backend está rodando e acessível em http://127.0.0.1:5000.
- Taxas não atualizam: Verifique se a chave da API externa é válida e se o backend 
está salvando as taxas corretamente.
- Live Server não abre: Pare outras instâncias do Live Server no VS Code 
(Port: 5500 na barra inferior).
