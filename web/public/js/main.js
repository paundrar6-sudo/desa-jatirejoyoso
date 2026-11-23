/**
 * WEBSITE RESMI DESA JATIREJOYOSO
 * Interaktivitas, Efek Sentuhan / Klik, & Animasi Transisi Latar Belakang
 */

let toastContainer = null;

document.addEventListener('DOMContentLoaded', () => {

    // ====================================================================
    // 1. SISTEM NOTIFIKASI TOAST INTERAKTIF
    // ====================================================================
    toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }

    // ====================================================================
    // 2. TACTILE CLICK / RIPPLE EFFECT UNTUK SEMUA TOMBOL INTERAKTIF
    // ====================================================================
    document.addEventListener('click', (e) => {
        const targetBtn = e.target.closest('.btn, .pill, .slider-dot, .nav-link, .catalog-card, .stat-card');
        if (!targetBtn) return;

        // Efek ripple gelombang sentuh
        const circle = document.createElement('span');
        circle.classList.add('ripple-circle');

        const rect = targetBtn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        circle.style.width = circle.style.height = `${size}px`;

        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        circle.style.left = `${x}px`;
        circle.style.top = `${y}px`;

        // Bersihkan ripple lama jika ada
        const existingRipple = targetBtn.querySelector('.ripple-circle');
        if (existingRipple) {
            existingRipple.remove();
        }

        targetBtn.appendChild(circle);
        setTimeout(() => circle.remove(), 650);
    });

    // ====================================================================
    // 3. INTERAKSI AJUKAN SURAT MENUJU WHATSAPP ADMIN DESA
    // ====================================================================
    const waServiceBtns = document.querySelectorAll('.btn-ajukan-wa');
    waServiceBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            const serviceName = this.getAttribute('data-service') || 'Layanan Surat';
            
            // Berikan feedback instan ke user
            showToast(
                'Mengarahkan ke WhatsApp',
                `Membuka chat WhatsApp Admin Desa Jatirejoyoso untuk permohonan <strong>${serviceName}</strong>...`,
                'fa-whatsapp',
                'wa',
                4500
            );
        });
    });

    // Feedback instan untuk tombol tunggal WhatsApp di kontak
    const singleWaBtn = document.querySelector('.btn-single-wa');
    if (singleWaBtn) {
        singleWaBtn.addEventListener('click', function() {
            showToast(
                'Menghubungi Admin Desa',
                'Membuka chat WhatsApp resmi dengan Ibu <strong>Vio Lita Dewi Islamia</strong>...',
                'fa-whatsapp',
                'wa',
                4000
            );
        });
    }

    // ====================================================================
    // 5. ANIMASI BACKGROUND MULTI-SLIDE & CROSSFADE (BERANDA & TRANSISI)
    // ====================================================================
    const bgSlides = document.querySelectorAll('.bg-slide');
    const sliderDots = document.querySelectorAll('.slider-dot');
    const currentPage = document.body.getAttribute('data-page') || 'beranda';
    
    let currentSlideIndex = 0;
    let autoSlideInterval = null;
    const slideDuration = 6000;

    const pageToSlideMap = {
        'beranda': 0,
        'profil': 1,
        'informasi': 2,
        'statistik': 0,
        'layanan': 1,
        'kontak': 2
    };

    function switchSlide(targetIndex) {
        if (!bgSlides || bgSlides.length === 0) return;

        currentSlideIndex = (targetIndex + bgSlides.length) % bgSlides.length;

        bgSlides.forEach((slide, idx) => {
            if (idx === currentSlideIndex) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
            }
        });

        if (sliderDots && sliderDots.length > 0) {
            sliderDots.forEach((dot, idx) => {
                if (idx === currentSlideIndex) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }
    }

    function startAutoSlide() {
        if (currentPage === 'beranda' && bgSlides.length > 1) {
            stopAutoSlide();
            autoSlideInterval = setInterval(() => {
                switchSlide(currentSlideIndex + 1);
            }, slideDuration);
        }
    }

    function stopAutoSlide() {
        if (autoSlideInterval) {
            clearInterval(autoSlideInterval);
            autoSlideInterval = null;
        }
    }

    if (pageToSlideMap.hasOwnProperty(currentPage)) {
        switchSlide(pageToSlideMap[currentPage]);
    }

    startAutoSlide();

    sliderDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            switchSlide(index);
            startAutoSlide();
        });
    });

    // ====================================================================
    // 6. STICKY NAVBAR & MOBILE NAVIGATION
    // ====================================================================
    const header = document.getElementById('siteHeader');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 30) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    const mobileToggle = document.getElementById('mobileToggle');
    const mainNav = document.getElementById('mainNav');

    if (mobileToggle && mainNav) {
        mobileToggle.addEventListener('click', () => {
            mainNav.classList.toggle('show');
            const spans = mobileToggle.querySelectorAll('span');
            if (mainNav.classList.contains('show')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 6px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(5px, -6px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });

        // Tutup otomatis menu mobile saat link diklik
        const navItems = mainNav.querySelectorAll('.nav-link');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    mainNav.classList.remove('show');
                    const spans = mobileToggle.querySelectorAll('span');
                    spans[0].style.transform = 'none';
                    spans[1].style.opacity = '1';
                    spans[2].style.transform = 'none';
                }
            });
        });
    }

    // ====================================================================
    // 7. SMOOTH TRANSITION KETIKA BERPINDAH HALAMAN
    // ====================================================================
    const navLinks = document.querySelectorAll('.nav-link, .brand-logo, .footer-links a, .feature-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && !href.startsWith('#') && !href.startsWith('javascript:') && !this.target) {
                const pageContent = document.getElementById('pageContent');
                if (pageContent) {
                    pageContent.style.transition = 'opacity 0.28s ease, transform 0.28s ease';
                    pageContent.style.opacity = '0';
                    pageContent.style.transform = 'translateY(8px)';
                }
            }
        });
    });
});


// ====================================================================
// 8. SISTEM NOTIFIKASI TOAST (DIPAKAI JUGA OLEH KONTEN DINAMIS)
// ====================================================================
function showToast(title, message, icon = 'fa-circle-check', type = 'success', duration = 4000) {
    if (!toastContainer) {
        toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
        }
    }

    const toast = document.createElement('div');
    toast.className = 'site-toast';

    const isWA = type === 'wa';
    toast.innerHTML = `
        <div class="site-toast-icon ${isWA ? 'wa' : ''}">
            <i class="fa-solid ${icon}"></i>
        </div>
        <div class="site-toast-body">
            <div class="site-toast-title">${title}</div>
            <div class="site-toast-text">${message}</div>
        </div>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('toast-closing');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, duration);
}


// ====================================================================
// 9. INTERAKSI KARTU APARATUR STRUKTUR ORGANISASI (POP UP & DETAIL)
// ====================================================================
document.addEventListener('touchstart', (event) => {
    const card = event.target.closest('.team-spotlight-card');
    if (!card) return;
    document.querySelectorAll('.team-spotlight-card.touch-active').forEach((item) => {
        item.classList.remove('touch-active');
    });
    card.classList.add('touch-active');
}, { passive: true });

document.addEventListener('click', (event) => {
    const card = event.target.closest('.team-spotlight-card');
    if (!card) return;
    const name = card.querySelector('.team-name')?.innerText || 'Aparatur Desa';
    const role = card.querySelector('.role')?.innerText || '';
    showToast(
        name,
        `Jabatan: <strong>${role}</strong>. Melayani warga di Kantor Balai Desa Jatirejoyoso.`,
        'fa-user-tie',
        'info',
        3500
    );
});


// ====================================================================
// 10. MODAL LIGHTBOX FULLSCREEN UNTUK PETA & FOTO RESOLUSI TINGGI
// ====================================================================
const lightboxModal = document.getElementById('imageLightboxModal');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxTitle = document.getElementById('lightboxTitle');
const lightboxCloseBtn = document.getElementById('lightboxCloseBtn');
const lightboxOverlay = document.getElementById('lightboxOverlay');

function openLightbox(imgSrc, title = 'Peta Wilayah Desa Jatirejoyoso') {
    if (!lightboxModal || !lightboxImg) return;
    lightboxImg.src = imgSrc;
    if (lightboxTitle) lightboxTitle.innerHTML = `<i class="fa-solid fa-map-location-dot"></i> ${title}`;
    lightboxModal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Kunci scroll halaman saat modal aktif
}

function closeLightbox() {
    if (!lightboxModal) return;
    lightboxModal.classList.remove('active');
    document.body.style.overflow = '';
    if (lightboxImg) lightboxImg.classList.remove('zoomed');
}

// Buka saat tombol zoom peta atau gambar peta diklik
document.querySelectorAll('.btn-zoom-map').forEach(el => {
    el.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const imgSrc = this.getAttribute('data-image') || this.querySelector('img')?.src;
        const title = this.getAttribute('data-title') || 'Peta Wilayah Desa Jatirejoyoso';
        if (imgSrc) openLightbox(imgSrc, title);
    });
});

if (lightboxCloseBtn) lightboxCloseBtn.addEventListener('click', closeLightbox);
if (lightboxOverlay) lightboxOverlay.addEventListener('click', closeLightbox);

// Toggle zoom in/out saat klik gambar di dalam modal
if (lightboxImg) {
    lightboxImg.addEventListener('click', () => {
        lightboxImg.classList.toggle('zoomed');
    });
}

// Tutup dengan tombol keyboard ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightboxModal && lightboxModal.classList.contains('active')) {
        closeLightbox();
    }
});
