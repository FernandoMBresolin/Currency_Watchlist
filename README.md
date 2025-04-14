# Currency Watchlist

**Watchlist de Taxas de Câmbio**, um projeto para acompanhar taxas de câmbio de moedas fiduciárias e criptomoedas em tempo real. Esta aplicação permite adicionar moedas a uma watchlist, atualizar suas taxas usando uma API externa, e exibir os valores em USD ou BRL.

## Visão Geral
O projeto é composto por dois componentes principais:
- **Frontend**: Uma interface web para visualizar e gerenciar a watchlist de moedas, comunicando com API externa.
- **Backend**: Uma API RESTful para armazenar moedas e gerenciar taxas.

A aplicação usa **Docker** para facilitar a execução em diferentes ambientes, garantindo consistência entre desenvolvimento e produção.

## Tecnologias Utilizadas
- **Frontend**:
  - HTML, CSS, JavaScript
  - Nginx (servidor web)
- **Backend**:
  - Python com Flask
  - SQLite (banco de dados)
  - Swagger (documentação da API)
- **Infraestrutura**:
  - Docker e Docker Compose
  - API externa: [Currency Freaks](https://currencyfreaks.com/)
