(function () {
  'use strict';

  const state = {
    csrfToken: '',
    authenticated: false,
    type: 'articles',
    editingId: null,
    records: [],
  };

  const els = {
    loginCard: document.getElementById('adminLoginCard'),
    loginForm: document.getElementById('adminLoginForm'),
    loginStatus: document.getElementById('adminLoginStatus'),
    dashboard: document.getElementById('adminDashboard'),
    tabs: document.getElementById('adminTabs'),
    reloadBtn: document.getElementById('adminReloadBtn'),
    logoutBtn: document.getElementById('adminLogoutBtn'),
    form: document.getElementById('adminContentForm'),
    formTitle: document.getElementById('adminFormTitle'),
    formStatus: document.getElementById('adminFormStatus'),
    submitBtn: document.getElementById('adminSubmitBtn'),
    resetBtn: document.getElementById('adminResetBtn'),
    listTitle: document.getElementById('adminListTitle'),
    tableHead: document.getElementById('adminTableHead'),
    tableBody: document.getElementById('adminTableBody'),
    listStatus: document.getElementById('adminListStatus'),
  };

  const TYPE_LABELS = {
    articles: 'Berita',
    officials: 'Aparatur',
    events: 'Agenda',
  };

  const TABLE_COLUMNS = {
    articles: ['ID', 'Judul', 'Tanggal', 'Penempatan', 'Grup', 'Status', 'Aksi'],
    officials: ['ID', 'Nama', 'Jabatan', 'Tier', 'Unit/Dusun', 'Foto', 'Urutan', 'Aksi'],
    events: ['ID', 'Tanggal', 'Judul', 'Kategori', 'Lokasi', 'Waktu', 'Aksi'],
  };

  function cell(text) {
    const td = document.createElement('td');
    td.textContent = text === undefined || text === null ? '' : String(text);
    return td;
  }

  function actionCell(id) {
    const td = document.createElement('td');
    const edit = document.createElement('button');
    edit.type = 'button';
    edit.className = 'admin-btn admin-btn-ghost';
    edit.textContent = 'Edit';
    edit.dataset.action = 'edit';
    edit.dataset.id = String(id);

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'admin-btn admin-btn-danger';
    remove.textContent = 'Hapus';
    remove.dataset.action = 'delete';
    remove.dataset.id = String(id);

    const wrap = document.createElement('div');
    wrap.style.display = 'flex';
    wrap.style.gap = '6px';
    wrap.style.flexWrap = 'wrap';
    wrap.append(edit, remove);
    td.appendChild(wrap);
    return td;
  }

  function showStatus(element, message, type) {
    if (!element) return;
    element.textContent = message;
    element.className = 'admin-status show ' + (type || 'success');
  }

  function hideStatus(element) {
    if (!element) return;
    element.className = 'admin-status';
  }

  async function api(url, options = {}) {
    const headers = new Headers(options.headers || {});
    if (options.body) {
      headers.set('content-type', 'application/json');
    }
    if (options.method && options.method !== 'GET') {
      headers.set('x-csrf-token', state.csrfToken);
    }
    const response = await fetch(url, { ...options, headers, credentials: 'same-origin' });
    let data = null;
    try {
      data = await response.json();
    } catch (error) {
      data = null;
    }
    return { ok: response.ok, status: response.status, data };
  }

  function applyAuthState() {
    if (state.authenticated) {
      els.loginCard.classList.add('admin-hidden');
      els.dashboard.classList.remove('admin-hidden');
    } else {
      els.loginCard.classList.remove('admin-hidden');
      els.dashboard.classList.add('admin-hidden');
    }
  }

  async function loadAuthStatus() {
    try {
      const result = await api('/api/admin/auth');
      if (!result.ok || !result.data) {
        showStatus(els.loginStatus, 'Gagal memeriksa status sesi.', 'error');
        return;
      }
      state.csrfToken = result.data.csrfToken || '';
      state.authenticated = Boolean(result.data.authenticated);
      applyAuthState();
      if (state.authenticated) await loadList();
    } catch (error) {
      showStatus(els.loginStatus, 'Gagal terhubung ke server.', 'error');
    }
  }

  function setFormFieldsEnabled(type) {
    els.form.querySelectorAll('[data-type-fields]').forEach((group) => {
      const isActive = group.dataset.typeFields === type;
      group.classList.toggle('admin-hidden', !isActive);
      // Disable input di kelompok non-aktif agar tidak memicu validasi native
      // (input required yang tersembunyi display:none memblokir submit diam-diam).
      group.querySelectorAll('input, select, textarea, button').forEach((field) => {
        field.disabled = !isActive;
      });
    });
  }

  function resetForm() {
    state.editingId = null;
    els.form.reset();
    setFormFieldsEnabled(state.type);
    const labels = {
      articles: 'Tambah Berita',
      officials: 'Tambah Aparatur',
      events: 'Tambah Agenda',
    };
    els.formTitle.textContent = labels[state.type];
    els.submitBtn.textContent = 'Simpan';
    hideStatus(els.formStatus);
  }

  function setListTitle() {
    els.listTitle.textContent = 'Daftar ' + TYPE_LABELS[state.type];
  }

  function renderTable() {
    els.tableHead.replaceChildren();
    els.tableBody.replaceChildren();

    const headRow = document.createElement('tr');
    TABLE_COLUMNS[state.type].forEach((column) => {
      const th = document.createElement('th');
      th.textContent = column;
      headRow.appendChild(th);
    });
    els.tableHead.appendChild(headRow);

    state.records.forEach((record) => {
      const row = document.createElement('tr');
      if (state.type === 'articles') {
        let groups = [];
        try {
          groups = JSON.parse(record.filter_groups || '[]');
        } catch (error) {
          groups = [];
        }
        row.append(
          cell(record.id),
          cell(record.title),
          cell(record.published_at),
          cell(record.placement),
          cell(groups.join(', ')),
          cell(Number(record.is_published) === 1 ? 'Terbit' : 'Draft'),
          actionCell(record.id)
        );
      } else if (state.type === 'officials') {
        row.append(
          cell(record.id),
          cell(record.name),
          cell(record.role),
          cell(record.tier),
          cell(record.unit),
          cell(record.photo),
          cell(record.sort_order),
          actionCell(record.id)
        );
      } else {
        row.append(
          cell(record.id),
          cell(record.event_date),
          cell(record.title),
          cell(record.category),
          cell(record.location),
          cell(record.event_time),
          actionCell(record.id)
        );
      }
      els.tableBody.appendChild(row);
    });

    if (!state.records.length) {
      const emptyRow = document.createElement('tr');
      const emptyCell = document.createElement('td');
      emptyCell.colSpan = TABLE_COLUMNS[state.type].length;
      emptyCell.textContent = 'Belum ada data.';
      emptyRow.appendChild(emptyCell);
      els.tableBody.appendChild(emptyRow);
    }
  }

  async function loadList() {
    hideStatus(els.listStatus);
    setListTitle();
    try {
      const result = await api('/api/admin/content?type=' + state.type);
      if (result.status === 401) {
        state.authenticated = false;
        applyAuthState();
        return;
      }
      if (!result.ok || !Array.isArray(result.data)) {
        showStatus(els.listStatus, (result.data && result.data.error) || 'Gagal memuat data.', 'error');
        return;
      }
      state.records = result.data;
      renderTable();
    } catch (error) {
      showStatus(els.listStatus, 'Gagal terhubung ke server.', 'error');
    }
  }

  function switchType(type) {
    state.type = type;
    els.tabs.querySelectorAll('.admin-tab').forEach((tab) => {
      tab.classList.toggle('active', tab.dataset.type === type);
    });
    resetForm();
    loadList();
  }

  function fillForm(record) {
    els.form.reset();

    if (state.type === 'articles') {
      let groups = [];
      try {
        groups = JSON.parse(record.filter_groups || '[]');
      } catch (error) {
        groups = [];
      }
      els.form.elements.namedItem('title').value = record.title || '';
      els.form.elements.namedItem('category').value = record.category || '';
      els.form.elements.namedItem('badge').value = record.badge || '';
      els.form.elements.namedItem('author').value = record.author || '';
      els.form.elements.namedItem('published_at').value = record.published_at || '';
      els.form.elements.namedItem('placement').value = record.placement || 'info';
      els.form.elements.namedItem('excerpt').value = record.excerpt || '';
      els.form.querySelectorAll('input[name="filter_groups"]').forEach((checkbox) => {
        checkbox.checked = groups.includes(checkbox.value);
      });
      els.form.elements.namedItem('is_published').checked = Number(record.is_published) === 1;
    } else if (state.type === 'officials') {
      els.form.elements.namedItem('official_name').value = record.name || '';
      els.form.elements.namedItem('role').value = record.role || '';
      els.form.elements.namedItem('tier').value = record.tier;
      els.form.elements.namedItem('unit').value = record.unit || '';
      els.form.elements.namedItem('photo').value = record.photo || '';
      els.form.elements.namedItem('sort_order').value = record.sort_order;
    } else {
      els.form.elements.namedItem('event_date').value = record.event_date || '';
      els.form.elements.namedItem('event_title').value = record.title || '';
      els.form.elements.namedItem('event_category').value = record.category || '';
      els.form.elements.namedItem('location').value = record.location || '';
      els.form.elements.namedItem('event_time').value = record.event_time || '';
      els.form.elements.namedItem('description').value = record.description || '';
    }

    state.editingId = record.id;
    els.formTitle.textContent =
      'Edit ' + TYPE_LABELS[state.type] + ' #' + record.id;
    els.submitBtn.textContent = 'Perbarui';
  }

  function buildPayload() {
    if (state.type === 'articles') {
      return {
        title: els.form.elements.namedItem('title').value,
        category: els.form.elements.namedItem('category').value,
        badge: els.form.elements.namedItem('badge').value,
        author: els.form.elements.namedItem('author').value,
        published_at: els.form.elements.namedItem('published_at').value,
        placement: els.form.elements.namedItem('placement').value,
        excerpt: els.form.elements.namedItem('excerpt').value,
        filter_groups: Array.from(
          els.form.querySelectorAll('input[name="filter_groups"]:checked')
        ).map((checkbox) => checkbox.value),
        is_published: els.form.elements.namedItem('is_published').checked,
      };
    }

    if (state.type === 'officials') {
      return {
        name: els.form.elements.namedItem('official_name').value,
        role: els.form.elements.namedItem('role').value,
        tier: Number(els.form.elements.namedItem('tier').value),
        unit: els.form.elements.namedItem('unit').value,
        photo: els.form.elements.namedItem('photo').value,
        sort_order: Number(els.form.elements.namedItem('sort_order').value),
      };
    }

    return {
      event_date: els.form.elements.namedItem('event_date').value,
      title: els.form.elements.namedItem('event_title').value,
      category: els.form.elements.namedItem('event_category').value,
      location: els.form.elements.namedItem('location').value,
      event_time: els.form.elements.namedItem('event_time').value,
      description: els.form.elements.namedItem('description').value,
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();
    hideStatus(els.formStatus);
    els.submitBtn.disabled = true;
    els.submitBtn.textContent = state.editingId ? 'Memperbarui...' : 'Menyimpan...';

    try {
      const payload = buildPayload();
      const url = state.editingId
        ? '/api/admin/content?type=' + state.type + '&id=' + state.editingId
        : '/api/admin/content?type=' + state.type;

      const result = await api(url, {
        method: state.editingId ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      });

      if (result.status === 401) {
        state.authenticated = false;
        applyAuthState();
        return;
      }
      if (result.status === 403) {
        await loadAuthStatus();
        showStatus(els.formStatus, 'Sesi/CSRF diperbarui. Silakan coba lagi.', 'error');
        return;
      }
      if (!result.ok) {
        showStatus(els.formStatus, (result.data && result.data.error) || 'Gagal menyimpan data.', 'error');
        return;
      }

      showStatus(els.formStatus, state.editingId ? 'Data diperbarui.' : 'Data ditambahkan.');
      resetForm();
      await loadList();
    } catch (error) {
      showStatus(els.formStatus, 'Gagal terhubung ke server.', 'error');
    } finally {
      els.submitBtn.disabled = false;
      els.submitBtn.textContent = state.editingId ? 'Perbarui' : 'Simpan';
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Hapus data #' + id + '? Tindakan ini tidak dapat dibatalkan.')) return;
    hideStatus(els.listStatus);
    try {
      const result = await api('/api/admin/content?type=' + state.type + '&id=' + id, {
        method: 'DELETE',
      });
      if (result.status === 401) {
        state.authenticated = false;
        applyAuthState();
        return;
      }
      if (!result.ok) {
        showStatus(els.listStatus, (result.data && result.data.error) || 'Gagal menghapus data.', 'error');
        return;
      }
      await loadList();
    } catch (error) {
      showStatus(els.listStatus, 'Gagal terhubung ke server.', 'error');
    }
  }

  els.loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    hideStatus(els.loginStatus);
    const password = els.loginForm.elements.namedItem('password').value;
    try {
      const result = await api('/api/admin/auth', {
        method: 'POST',
        body: JSON.stringify({ password }),
      });
      if (!result.ok) {
        showStatus(els.loginStatus, (result.data && result.data.error) || 'Login gagal.', 'error');
        return;
      }
      els.loginForm.reset();
      state.authenticated = true;
      applyAuthState();
      await loadList();
    } catch (error) {
      showStatus(els.loginStatus, 'Gagal terhubung ke server.', 'error');
    }
  });

  els.logoutBtn.addEventListener('click', async () => {
    try {
      await api('/api/admin/auth', { method: 'DELETE' });
    } catch (error) {
      // ignore
    }
    state.authenticated = false;
    applyAuthState();
  });

  els.tabs.addEventListener('click', (event) => {
    const tab = event.target.closest('.admin-tab');
    if (!tab) return;
    switchType(tab.dataset.type);
  });

  els.reloadBtn.addEventListener('click', loadList);
  els.resetBtn.addEventListener('click', resetForm);
  els.form.addEventListener('submit', handleSubmit);

  els.tableBody.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const id = Number(button.dataset.id);
    if (button.dataset.action === 'edit') {
      const record = state.records.find((item) => Number(item.id) === id);
      if (record) fillForm(record);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (button.dataset.action === 'delete') {
      handleDelete(id);
    }
  });

  loadAuthStatus();
})();
