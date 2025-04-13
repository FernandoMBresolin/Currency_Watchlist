from flask_sqlalchemy import SQLAlchemy
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

db = SQLAlchemy()

def init_db(app, reset=False):
    basedir = os.path.abspath(os.path.dirname(__file__))
    db_name = os.getenv('DB_NAME', 'watchlist.db')
    db_path = os.path.join(basedir, '..', db_name)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + db_path
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)
    with app.app_context():
        if reset and os.path.exists(db_path):
            os.remove(db_path)
            logger.info("Banco de dados resetado")
        db.create_all()
        logger.info(f"Banco de dados inicializado em {db_path}")