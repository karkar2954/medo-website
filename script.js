import { supabase } from "./supabase.js";

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
console.log("هل الجلسة موجودة؟", !!session, "هل التوكن موجود؟", !!session?.access_token);
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
  

// =========================
// المظهر والألوان
// =========================
function changeTheme() {
    document.body.classList.toggle('light');

    const button = document.getElementById('themeBtn');

    if (document.body.classList.contains('light')) {
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

    const themeBtn = document.getElementById('themeBtn');

    if (theme === 'light') {
        document.body.classList.add('light');
        themeBtn.textContent = '🌙 الوضع الليلي';
    } else {
        document.body.classList.remove('light');
        themeBtn.textContent = '☀️ الوضع النهاري';
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
        const newName = name.trim();

        localStorage.setItem('visitorName', newName);

        const greeting = document.getElementById('greeting');

        if (greeting) {
            greeting.textContent = "أهلاً بيك يا " + newName + " 👋";
        }
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
window.getMedoTasks = () => tasks.map(task => ({ ...task }));

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
updateDashboard();
applyTaskFilters();


}
async function updateDashboard() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;

    document.getElementById("dashTasks").textContent = total;
    document.getElementById("dashCompleted").textContent = completed;
    document.getElementById("dashAccount").textContent = "نشط";

    const { data: userData, error: userError } =
        await supabase.auth.getUser();

    if (userError || !userData.user) return;

    const { data, error } = await supabase
        .from("user_points")
        .select("points")
        .eq("user_id", userData.user.id)
        .maybeSingle();

    if (error) {
        console.error("خطأ تحميل النقاط:", error);
        return;
    }

    const points = data ? data.points : 0;
    const level = Math.floor(points / 100) + 1;
    const progress = points % 100;

    document.getElementById("dashPoints").textContent = points;
    document.getElementById("dashLevel").textContent =
        "المستوى " + level;

    document.getElementById("levelProgress").style.width =
        progress + "%";

    document.getElementById("nextLevel").textContent =
        "باقي " + (100 - progress) + " نقطة للمستوى التالي";
}
async function addTask() {
const input = document.getElementById('taskInput');
const title = input.value.trim();
const priority = document.getElementById('taskPriority').value;
const dueDate = document.getElementById('taskDueDate').value;

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
        priority: priority,
due_date: dueDate
    }]);

if (error) {
    console.error(error);
    alert('لم تتم إضافة المهمة. حاول مرة أخرى.');
    return;
}

input.value = '';
await loadTasks();
await loadAchievements();

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

    // تسجيل الإنجاز عند إكمال المهمة فقط
    if (!completed) {
    const now = new Date();
    const dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const idsKey = 'medo-challenge-tasks-' + dateKey;
    const countKey = 'medo-challenge-' + dateKey;

    const ids = JSON.parse(localStorage.getItem(idsKey) || '[]');

    if (!ids.includes(String(id))) {
        ids.push(String(id));
        localStorage.setItem(idsKey, JSON.stringify(ids));
    }

    localStorage.setItem(countKey, String(ids.length));
}
    await loadTasks();
    await loadAchievements();

    if (!completed) {
        showNotification("🎉 مبروك! كسبت 10 نقاط.");
    } else {
        showNotification("تم إلغاء إكمال المهمة.");
    }
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
    {
if (task.due_date) {
    const dueDate = document.createElement('small');
    const today = new Date();
    const todayString = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, '0'),
        String(today.getDate()).padStart(2, '0')
    ].join('-');

    if (task.completed) {
        dueDate.textContent = ' 📅 موعد التسليم: ' + task.due_date;
    } else if (task.due_date < todayString) {
        dueDate.textContent = ' 🔴 متأخرة';
    } else if (task.due_date === todayString) {
        dueDate.textContent = ' 🟠 موعدها النهارده';
    } else {
        dueDate.textContent = ' 🟢 موعد التسليم: ' + task.due_date;
    }

    li.appendChild(dueDate);
}
}
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
    completeButton.onclick = () => {

    toggleTask(task.id, task.completed);
};

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
await loadAchievements();

}

startWebsite();
// تحميل بيانات الملف الشخصي
async function loadProfileSection() {
    console.log("بدأ تحميل الملف الشخصي");

    const { data, error } = await supabase.auth.getUser();

    console.log("نتيجة تحميل المستخدم:", data, error);

    if (error || !data.user) {
        console.log("لم يتم العثور على مستخدم مسجل الدخول");
        return;
    }

    document.getElementById("profileName").textContent =
        data.user.user_metadata?.username || "بدون اسم";

    document.getElementById("profileEmail").textContent =
        data.user.email || "غير متاح";

    document.getElementById("profileDate").textContent =
        new Date(data.user.created_at).toLocaleDateString("ar-EG");
        // تحميل الصورة الشخصية المحفوظة
const avatarUrl = data.user.user_metadata?.avatar_url;

if (avatarUrl) {
    document.getElementById("profileAvatar").src = avatarUrl;
}
}


// تعديل اسم المستخدم
async function editProfileName() {
    const newName = prompt("اكتب الاسم الجديد:");

    if (!newName || !newName.trim()) return;

    const { error } = await supabase.auth.updateUser({
        data: { username: newName.trim() }
    });

    if (error) {
        alert("حصل خطأ أثناء تعديل الاسم.");
        console.error(error);
        return;
    }

    await loadProfileSection();
    alert("تم تعديل الاسم بنجاح!");
}

// إتاحة الوظيفة لزر HTML
window.editProfileName = editProfileName;

// تحميل البيانات
loadProfileSection();
// رفع الصورة الشخصية وحفظها
async function uploadAvatar() {
    const input = document.getElementById("avatarInput");
    const file = input.files[0];

    if (!file) {
        alert("اختار صورة الأول.");
        return;
    }

    if (!file.type.startsWith("image/")) {
        alert("اختار ملف صورة صالح.");
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        alert("حجم الصورة لازم يكون أقل من 5 ميجابايت.");
        return;
    }

    const { data: { user }, error: userError } =
        await supabase.auth.getUser();

    if (userError || !user) {
        alert("سجّل الدخول الأول.");
        return;
    }

    const filePath = `${user.id}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

    if (uploadError) {
        console.error(uploadError);
        alert("حصل خطأ أثناء رفع الصورة.");
        return;
    }

    const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

    const imageUrl = urlData.publicUrl;

    const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: imageUrl }
    });

    if (updateError) {
        console.error(updateError);
        alert("الصورة اترفعت لكن حصل خطأ في حفظ رابطها.");
        return;
    }

    document.getElementById("profileAvatar").src = imageUrl;

    alert("تم تغيير الصورة الشخصية بنجاح! 🎉");
}

window.uploadAvatar = uploadAvatar;
let knownAchievementIds = null;

async function loadAchievements() {
    const list = document.getElementById("achievementsList");

    const { data: userData, error: userError } =
        await supabase.auth.getUser();

    if (userError || !userData.user) {
        list.textContent = "سجّل الدخول لعرض إنجازاتك.";
        return;
    }

    const { data, error } = await supabase
        .from("user_achievements")
        .select("*")
        .eq("user_id", userData.user.id)
        .order("achieved_at", { ascending: false });

    if (error) {
        console.error(error);
        list.textContent = "تعذر تحميل الإنجازات.";
        return;
    }

    const currentIds = new Set((data || []).map(item => item.id));

    if (knownAchievementIds !== null) {
        (data || []).forEach(item => {
            if (!knownAchievementIds.has(item.id)) {
                showNotification("🏆 إنجاز جديد: " + item.achievement_name);
            }
        });
    }

    knownAchievementIds = currentIds;

    if (!data || data.length === 0) {
        list.textContent = "لسه مفيش إنجازات. ابدأ أكمل مهامك! 💪";
        return;
    }

    list.innerHTML = "";

    data.forEach(item => {
        const card = document.createElement("div");
        card.className = "achievement-card";

        const title = document.createElement("h3");
        title.textContent = item.achievement_name;

        const date = document.createElement("small");
        date.textContent = new Date(item.achieved_at)
            .toLocaleDateString("ar-EG");

        card.append(title, date);
        list.appendChild(card);
    });
}
function showNotification(message) {
    const box = document.getElementById("notificationBox");

    if (!box) return;

    const notification = document.createElement("div");
    notification.className = "notification";
    notification.textContent = message;

    box.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 4000);
}

window.showNotification = showNotification;
window.toggleTask = toggleTask;
// تشغيل Medo كتطبيق PWA
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("./service-worker.js")
            .then(() => {
                console.log("Medo PWA is ready!");
            })
            .catch((error) => {
                console.error("PWA registration failed:", error);
            });
    });
}