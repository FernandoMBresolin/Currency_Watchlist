from flask import Flask, request, redirect
from flask_restful import Api, Resource
from flask_cors import CORS
from flask_swagger_ui import get_swaggerui_blueprint
import os
import json
from datetime import datetime
from schema.database import init_db, db
from model.currency import Currency

app = Flask(__name__)
api = Api(app)
CORS(app)  # Permite requisições do frontend

# Inicializa o banco de dados
init_db(app)

# Configuração do Swagger
SWAGGER_URL = '/swagger'
API_URL = '/static/swagger.json'
swaggerui_blueprint = get_swaggerui_blueprint(SWAGGER_URL, API_URL)
app.register_blueprint(swaggerui_blueprint, url_prefix=SWAGGER_URL)

# Lista estática de moedas permitidas
ALLOWED_CURRENCIES = [
    {"code": "USD", "name": "Dólar Americano"},
    {"code": "EUR", "name": "Euro"},
    {"code": "GBP", "name": "Libra Esterlina"},
    {"code": "CAD", "name": "Dólar Canadense"},
    {"code": "CHF", "name": "Franco Suíço"},
    {"code": "ARS", "name": "Peso Argentino"},
    {"code": "CLP", "name": "Peso Chileno"},
    {"code": "AUD", "name": "Dólar Australiano"},
    {"code": "JPY", "name": "Iene Japonês"},
    {"code": "CNY", "name": "Yuan Chinês"},
    {"code": "INR", "name": "Rúpia Indiana"},
    {"code": "MXN", "name": "Peso Mexicano"},
    {"code": "BTC", "name": "Bitcoin"},
    {"code": "ETH", "name": "Ethereum"},
    {"code": "BNB", "name": "Binance Coin"},
    {"code": "ADA", "name": "Cardano"},
    {"code": "SOL", "name": "Solana"}
]

# Rota raiz redireciona para Swagger
@app.route('/')
def home():
    return redirect('/swagger')

# Rotas da API
class CurrencyList(Resource):
    def get(self):
        """Retorna todas as moedas salvas no banco"""
        currencies = Currency.query.all()
        if not currencies:
            return {"message": "Nenhuma moeda na lista"}, 200
        return [currency.to_dict() for currency in currencies], 200

    def post(self):
        """Adiciona uma nova moeda ao banco"""
        data = request.get_json()
        if not data or 'code' not in data:
            return {"message": "Campo 'code' é obrigatório"}, 400
        
        # Validações de entrada
        code = data['code']
        if not isinstance(code, str) or len(code) != 3:
            return {"message": "Código deve ser uma string de 3 caracteres"}, 400
        
        # Valida se o código está na lista permitida e obtém o nome
        currency = next((c for c in ALLOWED_CURRENCIES if c['code'] == code), None)
        if not currency:
            return {"message": f"Código de moeda inválido. Use um dos códigos permitidos."}, 400
        
        # Verifica se a moeda já existe
        if Currency.query.filter_by(code=code).first():
            return {"message": f"Moeda {code} já existe"}, 409
        
        new_currency = Currency(
            code=code,
            name=currency['name'],
            rate=None,
            updated_at=None
        )
        db.session.add(new_currency)
        db.session.commit()
        return new_currency.to_dict(), 201

class CurrencyResource(Resource):
    def put(self, code):
        """Atualiza a taxa e o horário de uma moeda existente"""
        if not isinstance(code, str) or len(code) != 3:
            return {"message": "Código deve ser uma string de 3 caracteres"}, 400
        currency = Currency.query.filter_by(code=code).first()
        if not currency:
            return {"message": f"Moeda {code} não encontrada"}, 404
        data = request.get_json()
        if 'rate' not in data or data['rate'] is None:
            return {"message": "Campo 'rate' é obrigatório e não pode ser nulo"}, 400
        if not isinstance(data['rate'], (int, float)) or data['rate'] <= 0:
            return {"message": "Taxa deve ser um número positivo"}, 400
        currency.rate = float(data['rate'])
        currency.updated_at = datetime.utcnow()
        db.session.commit()
        return currency.to_dict(), 200

    def delete(self, code):
        """Remove uma moeda do banco"""
        if not isinstance(code, str) or len(code) != 3:
            return {"message": "Código deve ser uma string de 3 caracteres"}, 400
        currency = Currency.query.filter_by(code=code).first()
        if not currency:
            return {"message": f"Moeda {code} não encontrada"}, 404
        db.session.delete(currency)
        db.session.commit()
        return {"message": f"Moeda {code} removida"}, 200

class AllowedCurrencies(Resource):
    def get(self):
        """Retorna a lista de moedas permitidas"""
        return ALLOWED_CURRENCIES, 200

# Define as rotas
api.add_resource(CurrencyList, '/currencies')
api.add_resource(CurrencyResource, '/currencies/<string:code>')
api.add_resource(AllowedCurrencies, '/allowed-currencies')

# Documentação Swagger
swagger_config = {
    "openapi": "3.0.0",
    "info": {
        "title": "Currency Watchlist API",
        "description": "API para gerenciar uma watchlist de moedas com SQLite",
        "version": "1.0.0"
    },
    "paths": {
        "/currencies": {
            "get": {
                "summary": "Lista todas as moedas",
                "responses": {
                    "200": {
                        "description": "Lista de moedas ou mensagem se vazia",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "oneOf": [
                                        {
                                            "type": "array",
                                            "items": {
                                                "type": "object",
                                                "properties": {
                                                    "code": {"type": "string"},
                                                    "name": {"type": "string"},
                                                    "rate": {"type": "number", "nullable": True},
                                                    "updated_at": {"type": "string", "format": "date-time", "nullable": True}
                                                }
                                            }
                                        },
                                        {
                                            "type": "object",
                                            "properties": {
                                                "message": {"type": "string", "example": "Nenhuma moeda na lista"}
                                            }
                                        }
                                    ]
                                }
                            }
                        }
                    }
                }
            },
            "post": {
                "summary": "Adiciona uma nova moeda",
                "requestBody": {
                    "required": True,
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "code": {"type": "string", "example": "USD"}
                                },
                                "required": ["code"]
                            }
                        }
                    }
                },
                "responses": {
                    "201": {"description": "Moeda adicionada"},
                    "400": {"description": "Dados inválidos"},
                    "409": {"description": "Moeda já existe"}
                }
            }
        },
        "/currencies/{code}": {
            "put": {
                "summary": "Atualiza a taxa e o horário de uma moeda",
                "parameters": [
                    {"name": "code", "in": "path", "required": True, "schema": {"type": "string"}, "example": "USD"}
                ],
                "requestBody": {
                    "required": True,
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "rate": {"type": "number", "example": 5.5}
                                },
                                "required": ["rate"]
                            }
                        }
                    }
                },
                "responses": {
                    "200": {"description": "Moeda atualizada"},
                    "400": {"description": "Dados inválidos"},
                    "404": {"description": "Moeda não encontrada"}
                }
            },
            "delete": {
                "summary": "Remove uma moeda",
                "parameters": [
                    {"name": "code", "in": "path", "required": True, "schema": {"type": "string"}, "example": "USD"}
                ],
                "responses": {
                    "200": {"description": "Moeda removida"},
                    "400": {"description": "Código inválido"},
                    "404": {"description": "Moeda não encontrada"}
                }
            }
        },
        "/allowed-currencies": {
            "get": {
                "summary": "Lista todas as moedas permitidas",
                "responses": {
                    "200": {
                        "description": "Lista de moedas permitidas",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "array",
                                    "items": {
                                        "type": "object",
                                        "properties": {
                                            "code": {"type": "string", "example": "USD"},
                                            "name": {"type": "string", "example": "Dólar Americano"}
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

if __name__ == '__main__':
    # Salva o Swagger JSON
    os.makedirs('static', exist_ok=True)
    with open('static/swagger.json', 'w') as f:
        json.dump(swagger_config, f)
    app.run(debug=False, host='0.0.0.0', port=5000)  # Desative debug em produção