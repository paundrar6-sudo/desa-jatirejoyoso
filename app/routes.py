from flask import Blueprint, render_template

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def beranda():
    return render_template(
        'index.html',
        page_title='Beranda',
        active_page='beranda',
        bg_theme='beranda'
    )

@main_bp.route('/profil')
def profil():
    return render_template(
        'profil.html',
        page_title='Profil Desa',
        active_page='profil',
        bg_theme='profil'
    )

@main_bp.route('/informasi')
def informasi():
    return render_template(
        'informasi.html',
        page_title='Informasi & Berita',
        active_page='informasi',
        bg_theme='informasi'
    )

@main_bp.route('/statistik')
def statistik():
    return render_template(
        'statistik.html',
        page_title='Statistik Desa',
        active_page='statistik',
        bg_theme='statistik'
    )

@main_bp.route('/layanan')
def layanan():
    return render_template(
        'layanan.html',
        page_title='Layanan Masyarakat',
        active_page='layanan',
        bg_theme='layanan'
    )

@main_bp.route('/kontak')
def kontak():
    return render_template(
        'kontak.html',
        page_title='Kontak & Lokasi',
        active_page='kontak',
        bg_theme='kontak'
    )

