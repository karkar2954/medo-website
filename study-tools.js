import { loadStudyData, saveStudyData } from './study-cloud.js';

(() => {
    const KEY = 'medo-study-plan-v1';
    const $ = id => document.getElementById(id);
    const form = $('studyForm');

    if (!form) return;

    let items = [];

    const save = () => saveStudyData(KEY, items);

    const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[c]));

    const render = () => {
        const filter = $('studyFilter').value;

        const shown = items
            .filter(x => filter === 'الكل' || x.type === filter)
            .sort((a, b) =>
                (a.date + ' ' + (a.time || '')).localeCompare(
                    b.date + ' ' + (b.time || '')
                )
            );

        $('studyCount').textContent =
            `${items.length} ${items.length === 1 ? 'موعد' : 'مواعيد'}`;

        const box = $('studyEvents');

        if (!shown.length) {
            box.innerHTML = '<p class="study-empty">' +
                (items.length
                    ? 'مفيش مواعيد من النوع ده.'
                    : 'لسه مفيش مواعيد. أضف أول مادة أو موعد دراسي 👆') +
                '</p>';
            return;
        }

        box.innerHTML = shown.map(x => `
            <article class="study-event">
                <div class="study-event-top">
                    <span class="study-event-type">${esc(x.type)}</span>
                    <small>${esc(x.date)}${x.time ? ' • ' + esc(x.time) : ''}</small>
                </div>
                <h4>${esc(x.subject)}</h4>
                ${x.notes ? `<p>${esc(x.notes)}</p>` : ''}
                <button type="button" data-delete="${esc(x.id)}">
                    حذف الموعد
                </button>
            </article>
        `).join('');
    };

    form.addEventListener('submit', async e => {
        e.preventDefault();

        const subject = $('studySubject').value.trim();
        const date = $('studyDate').value;

        if (!subject || !date) return;

        const item = {
            id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
            subject,
            type: $('studyType').value,
            date,
            time: $('studyTime').value,
            notes: $('studyNotes').value.trim()
        };

        items.push(item);

        if (!await save()) {
            items.pop();
            alert('فشل حفظ الموعد. تأكد من اتصالك بالإنترنت وحاول تاني.');
            return;
        }

        form.reset();
        render();
    });

    $('studyFilter').addEventListener('change', render);

    $('studyEvents').addEventListener('click', async e => {
        const button = e.target.closest('[data-delete]');
        if (!button) return;

        const oldItems = [...items];
        items = items.filter(x => x.id !== button.dataset.delete);

        if (!await save()) {
            items = oldItems;
            alert('فشل حذف الموعد من السحابة. حاول تاني.');
            render();
            return;
        }

        render();
    });

    loadStudyData(KEY).then(data => {
        items = Array.isArray(data) ? data : [];
        render();
    }).catch(error => {
        console.error('خطأ تحميل الخطة الدراسية:', error);
        alert('حصلت مشكلة أثناء تحميل الخطة الدراسية.');
    });
})();