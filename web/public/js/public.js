(function () {
  'use strict';

  const CONTENT_URL = '/api/content';

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  function icon(classes) {
    const node = document.createElement('i');
    node.className = classes;
    return node;
  }

  function formatIdDate(dateString) {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  function badgeClass(badge) {
    if (badge === 'Agenda') return 'info';
    if (badge === 'Kesehatan') return 'success';
    return '';
  }

  function renderError(container, message) {
    if (!container) return;
    container.replaceChildren();
    const notice = el('p', 'news-empty-state', message);
    container.appendChild(notice);
  }

  function renderHomeNews(articles) {
    const grid = document.getElementById('homeNewsGrid');
    if (!grid) return;
    const items = articles.filter((a) => a.placement === 'home').slice(0, 3);
    grid.replaceChildren();

    if (!items.length) {
      renderError(grid, 'Belum ada berita untuk ditampilkan.');
      return;
    }

    items.forEach((article) => {
      const card = el('article', 'news-card');
      const badge = el('div', 'news-badge', article.badge || 'Berita');
      const body = el('div', 'news-content');
      const date = el('span', 'news-date');
      date.appendChild(icon('fa-regular fa-calendar'));
      date.appendChild(document.createTextNode(' ' + formatIdDate(article.published_at)));
      const title = el('h3', null, article.title);
      const excerpt = el('p', null, article.excerpt);
      const link = el('a', 'read-more', 'Selengkapnya →');
      link.href = '/informasi';

      body.append(date, title, excerpt, link);
      card.append(badge, body);
      grid.appendChild(card);
    });
  }

  function renderNewsList(articles, filter) {
    const list = document.getElementById('newsList');
    if (!list) return;

    const infoArticles = articles.filter((a) => a.placement === 'info');
    let items = infoArticles;
    if (filter !== 'all') {
      items = infoArticles.filter((a) => (a.filter_groups || []).includes(filter));
    }
    list.replaceChildren();

    if (!items.length) {
      renderError(list, 'Belum ada berita untuk kategori ini.');
      return;
    }

    items.forEach((article) => {
      const card = el('article', 'news-card-horizontal');
      const badge = el('div', 'news-card-badge ' + badgeClass(article.badge), article.badge || 'Berita');
      const body = el('div', 'news-card-body');
      const date = el('span', 'news-date');
      date.appendChild(icon('fa-regular fa-calendar'));
      date.appendChild(document.createTextNode(' ' + formatIdDate(article.published_at)));
      const title = el('h2', null, article.title);
      const excerpt = el('p', null, article.excerpt);

      const meta = el('div', 'news-meta');
      if (article.author) {
        const author = el('span');
        author.appendChild(icon('fa-solid fa-user'));
        author.appendChild(document.createTextNode(' Oleh: ' + article.author));
        meta.appendChild(author);
      }
      if (article.category) {
        const category = el('span');
        category.appendChild(icon('fa-solid fa-tag'));
        category.appendChild(document.createTextNode(' ' + article.category));
        meta.appendChild(category);
      }

      body.append(date, title, excerpt, meta);
      card.append(badge, body);
      list.appendChild(card);
    });
  }

  function bindNewsFilterPills(articles) {
    const pills = document.querySelectorAll('.category-pills .pill');
    if (!pills.length) return;
    pills.forEach((pill) => {
      pill.addEventListener('click', () => {
        pills.forEach((item) => item.classList.remove('active'));
        pill.classList.add('active');
        renderNewsList(articles, pill.dataset.filter || 'all');
      });
    });
  }

  function renderOfficials(officials) {
    const wrapper = document.getElementById('orgStructure');
    if (!wrapper) return;
    wrapper.replaceChildren();

    const tiers = [1, 2, 3, 4, 5, 6];
    tiers.forEach((tier, index) => {
      const members = officials.filter((o) => o.tier === tier);
      if (!members.length) return;

      const block = el('div', 'org-tier-block');
      const rowClass =
        tier === 1 || tier === 2 || tier === 6
          ? 'org-row-flex row-center'
          : 'org-row-grid grid-' + (tier === 3 || tier === 4 ? 3 : 5);
      const row = el('div', rowClass);

      members.forEach((official) => {
        const card = el('article', 'team-card team-spotlight-card');
        if (tier === 1) card.classList.add('featured-kades');
        if (tier === 2) card.classList.add('featured-sekdes');
        if (tier === 6) card.classList.add('featured-staff');

        const avatarWrap = el('div', 'avatar-photo-wrap');
        const img = document.createElement('img');
        img.src = official.photo;
        img.alt = 'Foto ' + official.name;
        img.className = 'avatar-photo';
        avatarWrap.appendChild(img);

        const name = el('h3', 'team-name', official.name);
        const role = el('span', 'role', official.role);
        card.append(avatarWrap, name, role);

        if (official.unit) {
          const unit = el('small', 'text-muted', official.unit);
          unit.style.fontWeight = '700';
          unit.style.fontSize = '0.78rem';
          card.appendChild(unit);
        }

        row.appendChild(card);
      });

      block.appendChild(row);
      wrapper.appendChild(block);

      if (index < tiers.length - 1) {
        const connector = el('div', 'org-connector-vertical');
        const line = el('span');
        connector.appendChild(line);
        wrapper.appendChild(connector);
      }
    });
  }

  async function loadContent() {
    const needsContent =
      document.getElementById('homeNewsGrid') ||
      document.getElementById('newsList') ||
      document.getElementById('orgStructure');
    if (!needsContent) return;

    try {
      const response = await fetch(CONTENT_URL, { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const data = await response.json();

      const articles = Array.isArray(data.articles) ? data.articles : [];
      const officials = Array.isArray(data.officials) ? data.officials : [];
      const events = Array.isArray(data.events) ? data.events : [];

      window.__villageContent = data;
      document.documentElement.dataset.contentLoaded = 'true';

      renderHomeNews(articles);
      renderNewsList(articles, 'all');
      bindNewsFilterPills(articles);
      renderOfficials(officials);
      window.__villageEvents = events;
      document.dispatchEvent(new CustomEvent('village:content', { detail: data }));
    } catch (error) {
      renderError(document.getElementById('homeNewsGrid'), 'Gagal memuat berita.');
      renderError(document.getElementById('newsList'), 'Gagal memuat berita.');
      renderError(document.getElementById('orgStructure'), 'Gagal memuat struktur organisasi.');
      document.documentElement.dataset.contentLoaded = 'error';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadContent);
  } else {
    loadContent();
  }
})();
