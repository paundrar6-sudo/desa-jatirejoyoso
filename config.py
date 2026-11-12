import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'kunci-rahasia-desa-jatirejoyoso-2026'
    VILLAGE_NAME = 'DESA JATIREJOYOSO'
    TAGLINE = 'Maju, Mandiri, dan Sejahtera'

