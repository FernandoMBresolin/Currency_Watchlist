from schema.database import db

class Currency(db.Model):
    __tablename__ = 'currencies'
    code = db.Column(db.String(3), primary_key=True, index=True)  # Adiciona índice
    name = db.Column(db.String(50), nullable=False)
    rate = db.Column(db.Float, nullable=True)
    updated_at = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            'code': self.code,
            'name': self.name,
            'rate': self.rate,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }