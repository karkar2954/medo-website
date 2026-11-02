
const $ = (id) => document.getElementById(id);
const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};
const readTasks = () => typeof window.getMedoTasks === 'function' ? window.getMedoTasks() : [];
const panel = document.createElement('section');
panel.id = 'medo-tools';
panel.className = 'medo-tools';
panel.innerHTML = `
  <h2>🚀 أدوات Medo الإضافية</h2>
  <div class="medo-grid">
    <article class="medo-box">
      <h3>⏱️ مؤقت التركيز</h3>
      <div id="focus-clock" class="focus-clock">25:00</div>
      <p id="focus-state">جلسة تركيز — 25 دقيقة</p>
      <div class="medo-actions">
        <button id="focus-start">ابدأ</button><button id="focus-pause">إيقاف مؤقت</button><button id="focus-reset">إعادة</button>
      </div>
    </article>
    <article class="medo-box">
      <h3>📊 إحصائيات المهام</h3>
      <p id="stats-summary">جاري تحميل الإحصائيات…</p>
      <div class="medo-bar"><span id="stats-bar"></span></div>
      <p id="stats-detail"></p>
    </article>
    <article class="medo-box">
      <h3>🏆 تحدي اليوم</h3>
      <p id="daily-challenge"></p>
      <p id="daily-progress"></p>
    </article>
    <article class="medo-box">
      <h3>📅 تقويم المواعيد</h3>
      <div class="calendar-head"><button id="cal-prev">‹</button><strong id="cal-title"></strong><button id="cal-next">›</button></div>
      <div class="calendar-grid" id="calendar-grid"></div>
      <p id="calendar-detail">اختار يوم لعرض مهامه.</p>
    </article>
    <article class="medo-box assistant-box">
      <h3>🤖 مساعد تنظيم المهام</h3>
      <p>المساعد بيرتب مهامك محليًا حسب التأخير والأولوية وموعد التسليم.</p>
      <button id="assistant-run">اقترح عليّ أبدأ بإيه</button>
      <div id="assistant-result" aria-live="polite"></div>
    </article>
  </div>`;
const taskSection = document.querySelector('.todo');
if (taskSection) taskSection.insertAdjacentElement('afterend', panel);
else document.body.append(panel);

const style = document.createElement('link');
style.rel='stylesheet'; style.href='features.css'; document.head.append(style);

let seconds=1500, timer=null, focusMode='focus';
const clock=$('focus-clock'), state=$('focus-state');
function paintTimer(){clock.textContent=`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;}
$('focus-start').onclick=()=>{if(timer)return;timer=setInterval(()=>{seconds--;paintTimer();if(seconds<=0){clearInterval(timer);timer=null;if(focusMode==='focus'){focusMode='break';seconds=300;state.textContent='استراحة — 5 دقائق';}else{focusMode='focus';seconds=1500;state.textContent='جلسة تركيز — 25 دقيقة';}paintTimer();}},1000);};
$('focus-pause').onclick=()=>{clearInterval(timer);timer=null;};
$('focus-reset').onclick=()=>{clearInterval(timer);timer=null;focusMode='focus';seconds=1500;state.textContent='جلسة تركيز — 25 دقيقة';paintTimer();};

function updateStats(){
 const t=readTasks(), done=t.filter(x=>x.completed).length, total=t.length, pct=total?Math.round(done/total*100):0;
 $('stats-summary').textContent=`${done} من ${total} مهمة مكتملة (${pct}٪)`;
 $('stats-bar').style.width=pct+'%';
 $('stats-detail').textContent=`متبقي ${total-done} مهمة`;
 const key='medo-challenge-'+todayISO(), count=Number(localStorage.getItem(key)||0);
 const goal=3, reward=count>=goal?'🏅 حصلت على شارة بطل اليوم!':'🎯 أكمل 3 مهام النهارده وافتح شارة بطل اليوم.';
 $('daily-challenge').textContent=reward;
 $('daily-progress').textContent=`إنجازاتك المسجلة النهارده: ${Math.min(count,goal)} / ${goal}`;
 }
let calDate=new Date(); calDate.setDate(1);
function renderCalendar(){
 const y=calDate.getFullYear(),m=calDate.getMonth();
 $('cal-title').textContent=calDate.toLocaleDateString('ar-EG',{month:'long',year:'numeric'});
 const first=new Date(y,m,1).getDay(), days=new Date(y,m+1,0).getDate(), t=readTasks();
 const grid=$('calendar-grid');grid.innerHTML='';
 ['ح','ن','ث','ر','خ','ج','س'].forEach(x=>{const e=document.createElement('b');e.textContent=x;grid.append(e);});
 for(let i=0;i<first;i++)grid.append(document.createElement('span'));
 for(let day=1;day<=days;day++){
  const date=`${y}-${String(m+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
  const b=document.createElement('button');b.textContent=day;
  const due=t.filter(x=>x.due_date===date);if(due.length)b.classList.add('has-due');
  b.onclick=()=>{$('calendar-detail').textContent=due.length?due.map(x=>(x.completed?'✓ ':'• ')+x.title).join(' — '):'مفيش مهام بموعد تسليم في اليوم ده.';};
  grid.append(b);
 }
}
$('cal-prev').onclick=()=>{calDate.setMonth(calDate.getMonth()-1);renderCalendar();};
$('cal-next').onclick=()=>{calDate.setMonth(calDate.getMonth()+1);renderCalendar();};
$('assistant-run').onclick=()=>{
 const t=readTasks().filter(x=>!x.completed);
 t.sort((a,b)=>{
  const today=todayISO();
  const score=x=>(x.due_date&&x.due_date<today?100:0)+(x.priority==='high'?30:x.priority==='medium'?20:10)+(x.due_date?Math.max(0,20-Math.max(0,(new Date(x.due_date)-new Date(today))/(86400000))):0);
  return score(b)-score(a);
 });
 if(!t.length){$('assistant-result').textContent='مفيش مهام مفتوحة حاليًا. أضف مهمة جديدة أو استمتع بوقتك!';return;}
 const first=t[0], today=todayISO();
 const why=first.due_date&&first.due_date<today?'لأن موعدها فات':first.priority==='high'?'لأن أولويتها عالية':first.due_date===today?'لأن موعدها النهارده':'لأنها الأعلى أولوية بين مهامك';
 $('assistant-result').innerHTML='';
 const lead=document.createElement('p');lead.textContent=`ابدأ بـ «${first.title}» — ${why}.`; $('assistant-result').append(lead);
 const list=document.createElement('ol');
 t.slice(0,3).forEach(task=>{const li=document.createElement('li');li.textContent=task.title+(task.due_date?' — '+task.due_date:'');list.append(li);});
 $('assistant-result').append(list);
};
const observer=new MutationObserver(()=>{updateStats();renderCalendar();});
const taskList=$('taskList');if(taskList)observer.observe(taskList,{childList:true,subtree:true});
setTimeout(()=>{updateStats();renderCalendar();},500);


