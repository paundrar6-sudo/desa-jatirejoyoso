document.addEventListener('DOMContentLoaded', () => {
    const daysContainer = document.getElementById('calendarDays');
    const monthLabel = document.getElementById('calendarMonthLabel');
    const selectedDateLabel = document.getElementById('calendarSelectedDate');
    const detailContainer = document.getElementById('calendarEventDetails');
    const agendaContainer = document.getElementById('calendarAgendaItems');
    const eventCount = document.getElementById('calendarEventCount');
    const upcomingNote = document.getElementById('calendarUpcomingNote');
    const prevButton = document.getElementById('calendarPrev');
    const nextButton = document.getElementById('calendarNext');

    if (!daysContainer || !monthLabel || !detailContainer || !agendaContainer) return;

    let events = [];
    let initialized = false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let viewYear = today.getFullYear();
    let viewMonth = today.getMonth();
    let selectedDate = null;

    const parseDate = (dateString) => {
        const [year, month, day] = dateString.split('-').map(Number);
        return new Date(year, month - 1, day);
    };

    const toDateKey = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    const formatDate = (dateString) => {
        return parseDate(dateString).toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const eventsForDate = (dateString) => events.filter((e) => e.event_date === dateString);

    const getEventTiming = (dateString) => {
        const eventDate = parseDate(dateString);
        if (eventDate < today) return { label: 'Telah Terlaksana', cls: 'past' };
        if (eventDate > today) return { label: 'Akan Datang', cls: 'upcoming' };
        return { label: 'Hari Ini', cls: 'today' };
    };

    function showDetails(dateString) {
        selectedDate = dateString;
        selectedDateLabel.textContent = formatDate(dateString);
        const dayEvents = eventsForDate(dateString);
        detailContainer.replaceChildren();

        if (!dayEvents.length) {
            const empty = document.createElement('div');
            empty.className = 'calendar-empty-state';
            empty.innerHTML = `
                <i class="fa-regular fa-calendar-xmark" style="font-size: 2.2rem; color: #94a3b8; margin-bottom: 10px; display: block;"></i>
                <p>Tidak ada kegiatan yang terjadwal pada tanggal ini.</p>
                <small style="color: #64748b;">Pilih tanggal dengan indikator titik untuk melihat rincian acara.</small>
            `;
            detailContainer.appendChild(empty);
        } else {
            dayEvents.forEach((event) => {
                const item = document.createElement('article');
                item.className = 'calendar-detail-card';

                const timing = getEventTiming(dateString);

                item.innerHTML = `
                    <div class="calendar-detail-badges">
                        <span class="badge-category">${event.category}</span>
                        <span class="badge-status status-${timing.cls}">
                            <i class="fa-solid fa-${timing.cls === 'past' ? 'check-double' : (timing.cls === 'today' ? 'bolt' : 'clock')}"></i>
                            ${timing.label}
                        </span>
                    </div>
                    <h4 class="calendar-detail-title">${event.title}</h4>
                    <p class="calendar-detail-desc">${event.description}</p>
                    <div class="calendar-detail-meta">
                        <span><i class="fa-solid fa-location-dot"></i> ${event.location || 'Balai Desa Jatirejoyoso'}</span>
                        <span><i class="fa-regular fa-clock"></i> ${event.event_time || '08.00 WIB - Selesai'}</span>
                    </div>
                `;
                detailContainer.appendChild(item);
            });
        }
        renderCalendar();
        renderAgenda();
    }

    function renderCalendar() {
        const firstDay = new Date(viewYear, viewMonth, 1);
        const mondayOffset = (firstDay.getDay() + 6) % 7;
        const gridStart = new Date(viewYear, viewMonth, 1 - mondayOffset);

        monthLabel.textContent = firstDay.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
        daysContainer.replaceChildren();

        for (let index = 0; index < 42; index += 1) {
            const date = new Date(gridStart);
            date.setDate(gridStart.getDate() + index);
            const dateKey = toDateKey(date);
            const dayEvents = eventsForDate(dateKey);
            const eventExists = dayEvents.length > 0;

            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'calendar-day';
            button.textContent = String(date.getDate());
            button.setAttribute('aria-label', `${formatDate(dateKey)}${eventExists ? ' (Ada acara)' : ''}`);

            if (date.getMonth() !== viewMonth) button.classList.add('is-outside');
            if (dateKey === toDateKey(today)) button.classList.add('is-today');
            if (dateKey === selectedDate) button.classList.add('is-selected');

            if (eventExists) {
                button.classList.add('has-event');
                const isUpcoming = parseDate(dateKey) >= today;
                button.classList.add(isUpcoming ? 'is-upcoming' : 'is-past');
            }

            button.addEventListener('click', () => showDetails(dateKey));
            daysContainer.appendChild(button);
        }
    }

    function renderAgenda() {
        agendaContainer.replaceChildren();
        const sortedEvents = [...events].sort((a, b) => a.event_date.localeCompare(b.event_date));
        const upcomingEvents = events.filter((e) => parseDate(e.event_date) >= today);
        const pastEvents = events.filter((e) => parseDate(e.event_date) < today);

        eventCount.textContent = `${events.length} Kegiatan Terdata (${upcomingEvents.length} Mendatang, ${pastEvents.length} Terlaksana)`;

        if (upcomingNote) {
            upcomingNote.innerHTML = upcomingEvents.length
                ? `<strong><i class="fa-solid fa-bullhorn text-primary"></i> ${upcomingEvents.length} agenda mendatang</strong> siap dilaksanakan di Desa Jatirejoyoso.`
                : '<i class="fa-solid fa-circle-info"></i> Seluruh agenda yang terdata telah terlaksana.';
        }

        if (!sortedEvents.length) {
            const empty = document.createElement('p');
            empty.className = 'calendar-no-events';
            empty.textContent = 'Belum ada agenda kegiatan yang dipublikasikan.';
            agendaContainer.appendChild(empty);
            return;
        }

        sortedEvents.forEach((event) => {
            const timing = getEventTiming(event.event_date);
            const card = document.createElement('button');
            card.type = 'button';
            card.className = `calendar-agenda-item ${event.event_date === selectedDate ? 'is-active' : ''}`;

            card.innerHTML = `
                <div class="agenda-item-header">
                    <span class="agenda-date"><i class="fa-regular fa-calendar"></i> ${formatDate(event.event_date)}</span>
                    <span class="agenda-timing-tag tag-${timing.cls}">${timing.label}</span>
                </div>
                <strong class="agenda-title">${event.title}</strong>
                <p class="agenda-snippet">${event.description.length > 95 ? event.description.substring(0, 95) + '...' : event.description}</p>
                <div class="agenda-footer">
                    <span><i class="fa-solid fa-tag"></i> ${event.category}</span>
                    <span><i class="fa-solid fa-location-dot"></i> ${event.location || 'Balai Desa'}</span>
                </div>
            `;

            card.addEventListener('click', () => {
                const eventDate = parseDate(event.event_date);
                viewYear = eventDate.getFullYear();
                viewMonth = eventDate.getMonth();
                showDetails(event.event_date);
            });

            agendaContainer.appendChild(card);
        });
    }

    prevButton?.addEventListener('click', () => {
        viewMonth -= 1;
        if (viewMonth < 0) {
            viewMonth = 11;
            viewYear -= 1;
        }
        renderCalendar();
    });

    nextButton?.addEventListener('click', () => {
        viewMonth += 1;
        if (viewMonth > 11) {
            viewMonth = 0;
            viewYear += 1;
        }
        renderCalendar();
    });

    async function loadEvents() {
        try {
            const response = await fetch('/api/content', { headers: { Accept: 'application/json' } });
            if (!response.ok) throw new Error('HTTP ' + response.status);
            const data = await response.json();
            events = Array.isArray(data.events) ? data.events : [];
        } catch (error) {
            eventCount.textContent = 'Data agenda gagal dimuat';
            detailContainer.replaceChildren();
            const notice = document.createElement('p');
            notice.className = 'calendar-no-events';
            notice.textContent = 'Data kalender belum dapat dimuat.';
            detailContainer.appendChild(notice);
            return;
        }

        renderCalendar();
        renderAgenda();

        const upcomingEvent = [...events].filter((e) => parseDate(e.event_date) >= today).sort((a, b) => a.event_date.localeCompare(b.event_date))[0];
        const pastEvent = [...events].filter((e) => parseDate(e.event_date) < today).sort((a, b) => b.event_date.localeCompare(a.event_date))[0];
        const initialEvent = upcomingEvent || pastEvent;

        if (initialEvent) {
            const evDate = parseDate(initialEvent.event_date);
            viewYear = evDate.getFullYear();
            viewMonth = evDate.getMonth();
            showDetails(initialEvent.event_date);
        }
        initialized = true;
    }

    loadEvents();
});
