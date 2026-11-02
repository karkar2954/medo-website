import { loadStudyData, saveStudyData } from './study-cloud.js';

(() => {
    const KEY = 'medo-weekly-schedule-v1';
    const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

    const $ = id => document.getElementById(id);
    const form = $('weeklyForm');

    if (!form) return;

    let entries = [];

    const save = () => saveStudyData(KEY, entries);

    const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[c]));

    const endTime = (time, duration) => {
        const [h, m] = time.split(':').map(Number);
        const total = h * 60 + m + duration;

        return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
    };

    const render = () => {
        $('weeklySchedule').innerHTML = days.map((day, i) => {
            const list = entries
                .filter(x => Number(x.day) === i)
                .sort((a, b) => a.time.localeCompare(b.time));

            return `
                <section class="weekly-day">
                    <h3>${day}</h3>
                    ${list.length
                        ? list.map(x => `
                            <article class="weekly-item">
                                <strong>${esc(x.subject)}</strong>
                                <small>
                                    ⏰ ${esc(x.time)} – ${endTime(x.time, Number(x.duration))}
                                    · ${esc(x.duration)} دقيقة
                                </small>
                                <button type="button" data-remove="${esc(x.id)}">حذف</button>
                            </article>
                        `).join('')
                        : '<p class="weekly-empty">لا توجد جلسات</p>'
                    }
                </section>
            `;
        }).join('');
    };

    form.addEventListener('submit', async e => {
        e.preventDefault();

        const subject = $('weeklySubject').value.trim();
        const time = $('weeklyTime').value;
        const duration = Number($('weeklyDuration').value);

        if (!subject || !time || !Number.isFinite(duration) || duration <= 0) return;

        const entry = {
            id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
            subject,
            day: $('weeklyDay').value,
            time,
            duration
        };

        entries.push(entry);

        if (!await save()) {
            entries.pop();
            alert('فشل حفظ الجلسة. تأكد من اتصالك بالإنترنت وحاول تاني.');
            return;
        }

        form.reset();
        $('weeklyDuration').value = '60';
        render();
    });

    $('weeklySchedule').addEventListener('click', async e => {
        const button = e.target.closest('[data-remove]');
        if (!button) return;

        const oldEntries = [...entries];
        entries = entries.filter(x => x.id !== button.dataset.remove);

        if (!await save()) {
            entries = oldEntries;
            alert('فشل حذف الجلسة من السحابة. حاول تاني.');
            render();
            return;
        }

        render();
    });

    loadStudyData(KEY).then(data => {
        entries = Array.isArray(data) ? data : [];
        render();
    }).catch(error => {
        console.error('خطأ تحميل الجدول الأسبوعي:', error);
        alert('حصلت مشكلة أثناء تحميل الجدول الأسبوعي.');
    });
})();