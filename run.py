from app import create_app

app = create_app()

if __name__ == '__main__':
    # Mode debug aktif untuk kemudahan pengembangan
    app.run(debug=True, host='127.0.0.1', port=5000)

