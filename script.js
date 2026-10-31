import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
// تسجيل الدخول
// =========================npm/@supabase/supabase-js@2/+esm';

// بيانات Supabase
const SUPABASE_URL = 'https://yfktbkqerjvhgopnoowj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_DnWZ6SjWDdwZ3eNWL3MQAA_cY4CJ0mI';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// =======================

async function checkLogin() {
const { data, error } = await supabase.auth.getSession();


if (error || !data.session) {
    window.location.href = 'login.html';
    return false;
}

return true;


}

async function logout() {
const { error } = await supabase.auth.signOut();


if (error) {
    alert('حصل خطأ أثناء تسجيل الخروج.');
    return;
}

window.location.href = 'login.html';


}
async function deleteAccount() {
  const confirmed = confirm(
    "هل أنت متأكد؟ سيتم حذف حسابك وجميع مهامك نهائيًا ولا يمكن التراجع."
  );

  if (!confirmed) return;

  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();

  const session = sessionData?.session;

  if (sessionError || !session) {
    alert("جلسة تسجيل الدخول غير موجودة. سجّل الدخول مرة أخرى.");
    return;
  }

  const { data, error } = await supabase.functions.invoke(
    "delete-account",
    {
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    }
  );

  if (error || !data?.success) {
    console.error("Delete account error:", error, data);
    alert(data?.error || "حصل خطأ أثناء حذف الحساب.");
    return;
  }

  await supabase.auth.signOut();
  alert("تم حذف حسابك بنجاح.");
  window.location.href = "register.html";
}
  
  await supabase.auth.signOut();
  alert("تم حذف حسابك بنجاح.");
  window.location.href = "register.html";
}

// =========================
// المظهر والألوان
// =========================

function changeTheme() {
document.body.classList.toggle('light-mode');


const button = document.getElementById('themeBtn');

if (document.body.classList.contains('light-mode')) {
    button.textContent = '🌙 الوضع الليلي';
    localStorage.setItem('theme', 'light');
} else {
    button.textContent = '☀️ الوضع النهاري';
    localStorage.setItem('theme', 'dark');
}


}

function changeColor(color) {
document.documentElement.style.setProperty('--main-color', color);
localStorage.setItem('mainColor', color);
}

function changeBackground(color) {
document.body.style.background = color;
localStorage.setItem('backgroundColor', color);
}

function resetSettings() {
localStorage.removeItem('theme');
localStorage.removeItem('mainColor');
localStorage.removeItem('backgroundColor');
localStorage.removeItem('visitorName');


location.reload();


}

function loadSettings() {
const theme = localStorage.getItem('theme');
const color = localStorage.getItem('mainColor');
const background = localStorage.getItem('backgroundColor');


if (theme === 'light') {
    document.body.classList.add('light-mode');
    document.getElementById('themeBtn').textContent = '🌙 الوضع الليلي';
}

if (color) {
    document.documentElement.style.setProperty('--main-color', color);
}

if (background) {
    document.body.style.background = background;
}


}

// =========================
// اسم الزائر
// =========================

function changeName() {
const name = prompt('اكتب اسمك:');


if (name && name.trim()) {
    localStorage.setItem('visitorName', name.trim());
    updateGreeting();
}


}

function resetName() {
localStorage.removeItem('visitorName');
updateGreeting();
}
function updateGreeting() {
    const name = localStorage.getItem("visitorName");
    const greeting = document.getElementById("greeting");

    if (name) {
        greeting.textContent = "أهلاً بيك يا " + name + " 👋";
    } else {
        greeting.textContent = "أهلاً بيك في موقعي الشخصي ❤️";
    }



}
// =========================
// عدد الزيارات
// =========================

function updateVisits() {
let visits = Number(localStorage.getItem('visitCount') || 0);


visits++;
localStorage.setItem('visitCount', visits);

document.getElementById('visitCount').textContent = visits;


}

// =========================
// الساعة والتاريخ
// =========================

function updateClock() {
const now = new Date();


document.getElementById('time').textContent =
    now.toLocaleTimeString('ar-EG');

document.getElementById('date').textContent =
    now.toLocaleDateString('ar-EG', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });


}

// =========================
// قائمة المهام - Supabase
// =========================

let tasks = [];
let visibleTasks = [];

async function loadTasks() {
const { data, error } = await supabase
.from('tasks')
.select('*')
.order('created_at', { ascending: false });


if (error) {
    console.error('خطأ تحميل المهام:', error);
    alert('تعذر تحميل المهام. تأكد من الاتصال بـ Supabase.');
    return;
}

tasks = data || [];
applyTaskFilters();


}

async function addTask() {
const input = document.getElementById('taskInput');
const title = input.value.trim();
const priority = document.getElementById('taskPriority').value;


if (!title) {
    alert('اكتب المهمة الأول.');
    return;
}

const { data: userData, error: userError } =
    await supabase.auth.getUser();

if (userError || !userData.user) {
    alert('سجّل الدخول الأول.');
    return;
}

const { error } = await supabase
    .from('tasks')
    .insert([{
        user_id: userData.user.id,
        title: title,
        completed: false,
        priority: priority
    }]);

if (error) {
    console.error(error);
    alert('لم تتم إضافة المهمة. حاول مرة أخرى.');
    return;
}

input.value = '';
await loadTasks();


}

async function toggleTask(id, completed) {
const { error } = await supabase
.from('tasks')
.update({ completed: !completed })
.eq('id', id);


if (error) {
    alert('تعذر تحديث المهمة.');
    console.error(error);
    return;
}

await loadTasks();


}

async function deleteTask(id) {
if (!confirm('هل تريد حذف المهمة؟')) return;


const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);

if (error) {
    alert('تعذر حذف المهمة.');
    console.error(error);
    return;
}

await loadTasks();


}

async function editTask(id) {
const task = tasks.find(item => item.id === id);
if (!task) return;


const newTitle = prompt('اكتب اسم المهمة الجديد:', task.title);

if (!newTitle || !newTitle.trim()) return;

const { error } = await supabase
    .from('tasks')
    .update({ title: newTitle.trim() })
    .eq('id', id);

if (error) {
    alert('تعذر تعديل المهمة.');
    console.error(error);
    return;
}

await loadTasks();


}

async function clearTasks() {
if (!confirm('هل أنت متأكد من مسح كل المهام؟')) return;


const { error } = await supabase
    .from('tasks')
    .delete()
    .not('id', 'is', null);

if (error) {
    alert('تعذر مسح المهام.');
    console.error(error);
    return;
}

await loadTasks();


}

async function clearCompletedTasks() {
if (!confirm('هل تريد مسح المهام المكتملة؟')) return;


const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('completed', true);

if (error) {
    alert('تعذر مسح المهام المكتملة.');
    console.error(error);
    return;
}

await loadTasks();


}

// =========================
// عرض المهام والإحصائيات
// =========================

function renderTasks() {
const list = document.getElementById('taskList');
list.innerHTML = '';


visibleTasks.forEach(task => {
    const li = document.createElement('li');

    const title = document.createElement('span');
    title.textContent = task.title;

    if (task.completed) {
        title.style.textDecoration = 'line-through';
    }

    const priorityNames = {
        low: '🟢 منخفضة',
        medium: '🟡 متوسطة',
        high: '🔴 عالية'
    };

    const priority = document.createElement('small');
    priority.textContent = ` ${priorityNames[task.priority] || ''} `;

    const completeButton = document.createElement('button');
    completeButton.textContent = task.completed ? 'إلغاء الإكمال' : 'إكمال';
    completeButton.onclick = () => toggleTask(task.id, task.completed);

    const editButton = document.createElement('button');
    editButton.textContent = 'تعديل ✏️';
    editButton.onclick = () => editTask(task.id);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'حذف 🗑️';
    deleteButton.onclick = () => deleteTask(task.id);

    li.append(title, priority, completeButton, editButton, deleteButton);
    list.appendChild(li);
});

updateTaskStats();


}

function updateTaskStats() {
const total = tasks.length;
const completed = tasks.filter(task => task.completed).length;
const remaining = total - completed;
const percentage = total ? Math.round((completed / total) * 100) : 0;


document.getElementById('totalTasks').textContent = total;
document.getElementById('completedTasks').textContent = completed;
document.getElementById('remainingTasks').textContent = remaining;
document.getElementById('progressBar').style.width = percentage + '%';
document.getElementById('progressText').textContent =
    `نسبة الإنجاز: ${percentage}%`;


}

// =========================
// البحث والفلاتر والترتيب
// =========================

function applyTaskFilters() {
const search = document.getElementById('searchTask').value.toLowerCase();
const filter = document.getElementById('taskFilter').value;
const priority = document.getElementById('priorityFilter').value;


visibleTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(search);

    const matchesStatus =
        filter === 'all' ||
        (filter === 'completed' && task.completed) ||
        (filter === 'uncompleted' && !task.completed);

    const matchesPriority =
        priority === 'all' || task.priority === priority;

    return matchesSearch && matchesStatus && matchesPriority;
});

sortTasks(false);


}

function searchTasks() {
applyTaskFilters();
}

function clearSearch() {
document.getElementById('searchTask').value = '';
applyTaskFilters();
}

function showAllTasks() {
document.getElementById('searchTask').value = '';
document.getElementById('taskFilter').value = 'all';
document.getElementById('priorityFilter').value = 'all';
applyTaskFilters();
}

function sortTasks(applyFilters = true) {
if (applyFilters) {
applyTaskFilters();
return;
}


const sort = document.getElementById('taskSort').value;

visibleTasks.sort((a, b) => {
    const dateA = new Date(a.created_at);
    const dateB = new Date(b.created_at);

    return sort === 'oldest' ? dateA - dateB : dateB - dateA;
});

renderTasks();


}

// =========================
// تشغيل وظائف الموقع
// =========================

Object.assign(window, {
changeTheme,
changeColor,
changeBackground,
resetSettings,
changeName,
resetName,
logout,
deleteAccount,
addTask,
clearTasks,
clearCompletedTasks,
searchTasks,
clearSearch,
showAllTasks,
applyTaskFilters,
sortTasks
});

async function startWebsite() {
const loggedIn = await checkLogin();


if (!loggedIn) return;

document.getElementById('logoutBtn').style.display = 'inline-block';
document.getElementById('deleteAccountBtn').style.display = 'inline-block';

loadSettings();
updateGreeting();
updateVisits();
updateClock();
setInterval(updateClock, 1000);

await loadTasks();


}

startWebsite();
