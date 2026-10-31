// منع فتح الموقع بدون تسجيل الدخول
if (localStorage.getItem("isLoggedIn") !== "true") {
    window.location.href = "login.html";
}
// رسالة ترحيب
function sayHello() {
    alert("أهلاً بيك في موقعي الشخصي ❤️");
}

// تغيير الوضع الليلي والنهاري
function changeTheme() {
    document.body.classList.toggle("light");

    let btn = document.getElementById("themeBtn");

    if (document.body.classList.contains("light")) {
        btn.innerText = "🌙 الوضع الليلي";
    } else {
        btn.innerText = "☀️ الوضع النهاري";
    }
}

// عداد الزيارات
let visits = Number(localStorage.getItem("visits")) || 0;
visits++;
localStorage.setItem("visits", visits);
document.getElementById("visitCount").innerText = visits;

// حفظ اسم الزائر
let visitorName = localStorage.getItem("visitorName");

if (visitorName === null) {
    visitorName = prompt("أهلاً بيك! ممكن أعرف اسمك؟");

    if (visitorName !== null && visitorName.trim() !== "") {
        localStorage.setItem("visitorName", visitorName);
    }
}

if (visitorName && visitorName.trim() !== "") {
    document.getElementById("welcome").innerText =
        "أهلاً بيك يا " + visitorName + " ❤️";
}

// تغيير الاسم
function changeName() {
    let newName = prompt("اكتب اسمك الجديد");

    if (newName !== null && newName.trim() !== "") {
        localStorage.setItem("visitorName", newName);
        document.getElementById("welcome").innerText =
            "أهلاً بيك يا " + newName + " ❤️";
    }
}

// مسح الاسم
function resetName() {
    localStorage.removeItem("visitorName");

    let visitorName = prompt("اكتب اسمك من جديد");

    if (visitorName !== null && visitorName.trim() !== "") {
        localStorage.setItem("visitorName", visitorName);
        document.getElementById("welcome").innerText =
            "أهلاً بيك يا " + visitorName + " ❤️";
    } else {
        document.getElementById("welcome").innerText =
            "أهلاً بيكم، أنا Medo 👋";
    }
}

// الساعة والتاريخ
function updateClock() {
    let now = new Date();

    document.getElementById("time").innerText =
        now.toLocaleTimeString("ar-EG");

    document.getElementById("date").innerText =
        now.toLocaleDateString("ar-EG");
}

updateClock();
setInterval(updateClock, 1000);

// تغيير لون الموقع
function changeColor(color) {
    document.querySelector(".card").style.borderTop =
        "5px solid " + color;

    document.querySelectorAll("h2").forEach(function(title) {
        title.style.color = color;
    });

    localStorage.setItem("siteColor", color);
}

// استرجاع اللون
let savedColor = localStorage.getItem("siteColor");

if (savedColor !== null) {
    changeColor(savedColor);
}

// رسالة الترحيب حسب الوقت
function updateGreeting() {
    let hour = new Date().getHours();
    let message = "";

    if (hour >= 5 && hour < 12) {
        message = "صباح الخير ☀️";
    } else if (hour >= 12 && hour < 18) {
        message = "مساء الخير 🌤️";
    } else {
        message = "مساء الخير 🌙";
    }

    document.getElementById("greeting").innerText = message;
}

updateGreeting();

// تغيير الخلفية
function changeBackground(color) {
    document.body.style.backgroundColor = color;
    localStorage.setItem("backgroundColor", color);
}

// استرجاع الخلفية
let savedBackground = localStorage.getItem("backgroundColor");

if (savedBackground !== null) {
    changeBackground(savedBackground);
}

// إعادة ضبط الإعدادات
function resetSettings() {
    localStorage.removeItem("siteColor");
    localStorage.removeItem("backgroundColor");

    document.querySelector(".card").style.borderTop = "";

    document.querySelectorAll("h2").forEach(function(title) {
        title.style.color = "";
    });

    document.body.style.backgroundColor = "";

    alert("تمت إعادة الإعدادات للوضع الأصلي ❤️");
}

// حفظ المهام
function saveTasks() {
    let tasks = [];

    document.querySelectorAll("#taskList li").forEach(function(li) {
        tasks.push({
            text: li.firstChild.textContent,
            completed: li.classList.contains("completed"),
            createdAt: li.dataset.createdAt,
            priority: li.dataset.priority || "medium"
        });
    });

    localStorage.setItem("myTasks", JSON.stringify(tasks));
}

// تحديث إحصائيات المهام
function updateTaskStats() {
    let tasks = document.querySelectorAll("#taskList li");

    let total = tasks.length;

    let completed = document.querySelectorAll(
        "#taskList li.completed"
    ).length;

    let remaining = total - completed;

    document.getElementById("totalTasks").innerText = total;
    document.getElementById("completedTasks").innerText = completed;
    document.getElementById("remainingTasks").innerText = remaining;

    let percentage = total === 0 ? 0 :
        Math.round((completed / total) * 100);

    document.getElementById("progressBar").style.width =
        percentage + "%";

    document.getElementById("progressText").innerText =
        "نسبة الإنجاز: " + percentage + "%";
}

// إنشاء مهمة
function createTask(
    text,
    completed = false,
    createdAt = null,
    priority = "medium"
) {
    let li = document.createElement("li");

    let taskText = document.createTextNode(text);
    li.appendChild(taskText);

    li.dataset.priority = priority;

    let priorityText = document.createElement("small");

    let priorityNames = {
        low: "🟢 أولوية منخفضة",
        medium: "🟡 أولوية متوسطة",
        high: "🔴 أولوية عالية"
    };

    priorityText.innerText =
        " - " + (priorityNames[priority] || priorityNames.medium);

    li.appendChild(priorityText);

    let date = createdAt ? new Date(createdAt) : new Date();

    li.dataset.createdAt = date.toISOString();

    let taskDate = document.createElement("small");

    taskDate.innerText =
        " - أُضيفت: " + date.toLocaleString("ar-EG");

    li.appendChild(taskDate);

    if (completed) {
        li.classList.add("completed");
    }

    li.onclick = function() {
        li.classList.toggle("completed");
        saveTasks();
        updateTaskStats();
    };

    // زر التعديل
    let editBtn = document.createElement("button");
    editBtn.innerText = "تعديل ✏️";

    editBtn.onclick = function(event) {
        event.stopPropagation();

        let newText = prompt(
            "اكتب اسم المهمة الجديد:",
            taskText.textContent
        );

        if (newText !== null && newText.trim() !== "") {
            taskText.textContent = newText.trim();
            saveTasks();
        }
    };

    li.appendChild(editBtn);

    // زر الحذف
    let deleteBtn = document.createElement("button");
    deleteBtn.innerText = "حذف ❌";

    deleteBtn.onclick = function(event) {
        event.stopPropagation();

        li.remove();
        saveTasks();
        updateTaskStats();
    };

    li.appendChild(deleteBtn);

    document.getElementById("taskList").appendChild(li);
}

// إضافة مهمة
function addTask() {
    let input = document.getElementById("taskInput");
    let task = input.value.trim();

    let priority = document.getElementById("taskPriority").value;

    if (task === "") {
        alert("اكتب المهمة الأول!");
        return;
    }

    createTask(task, false, null, priority);

    saveTasks();
    updateTaskStats();

    input.value = "";
}

// إضافة المهمة بزر Enter
document.getElementById("taskInput").addEventListener(
    "keydown",
    function(event) {
        if (event.key === "Enter") {
            addTask();
        }
    }
);

// تحميل المهام المحفوظة
function loadTasks() {
    let tasks = JSON.parse(localStorage.getItem("myTasks")) || [];

    tasks.forEach(function(task) {
        createTask(
            task.text,
            task.completed,
            task.createdAt,
            task.priority || "medium"
        );
    });

    updateTaskStats();
}

// مسح كل المهام
function clearTasks() {
    let confirmDelete = confirm(
        "متأكد إنك عايز تمسح كل المهام؟"
    );

    if (confirmDelete) {
        document.getElementById("taskList").innerHTML = "";
        localStorage.removeItem("myTasks");
        updateTaskStats();
    }
}

// مسح المهام المكتملة فقط
function clearCompletedTasks() {
    let confirmDelete = confirm(
        "متأكد إنك عايز تمسح المهام المكتملة؟"
    );

    if (confirmDelete) {
        document.querySelectorAll(
            "#taskList li.completed"
        ).forEach(function(task) {
            task.remove();
        });

        saveTasks();
        updateTaskStats();
    }
}

// البحث والفلترة مع بعض
function applyTaskFilters() {
    let searchValue = document.getElementById(
        "searchTask"
    ).value.toLowerCase();

    let filterValue = document.getElementById(
        "taskFilter"
    ).value;

    let priorityValue = document.getElementById(
        "priorityFilter"
    ).value;

    document.querySelectorAll("#taskList li").forEach(
        function(task) {
            let taskName = task.firstChild.textContent.toLowerCase();

            let isCompleted = task.classList.contains("completed");

            let taskPriority = task.dataset.priority || "medium";

            let matchesSearch = taskName.includes(searchValue);

            let matchesFilter =
                filterValue === "all" ||
                (filterValue === "completed" && isCompleted) ||
                (filterValue === "uncompleted" && !isCompleted);

            let matchesPriority =
                priorityValue === "all" ||
                taskPriority === priorityValue;

            task.style.display =
                matchesSearch && matchesFilter && matchesPriority
                ? ""
                : "none";
        }
    );
}

// البحث
function searchTasks() {
    applyTaskFilters();
}

// الفلترة
function filterTasks() {
    applyTaskFilters();
}

// مسح البحث
function clearSearch() {
    document.getElementById("searchTask").value = "";
    applyTaskFilters();
}

// عرض كل المهام
function showAllTasks() {
    document.getElementById("searchTask").value = "";
    document.getElementById("taskFilter").value = "all";
    document.getElementById("priorityFilter").value = "all";

    applyTaskFilters();
}

// ترتيب المهام حسب التاريخ
function sortTasks() {
    let taskList = document.getElementById("taskList");
    let tasks = Array.from(taskList.children);

    let sortValue = document.getElementById("taskSort").value;

    tasks.sort(function(a, b) {
        let dateA = new Date(a.dataset.createdAt);
        let dateB = new Date(b.dataset.createdAt);

        if (sortValue === "newest") {
            return dateB - dateA;
        } else {
            return dateA - dateB;
        }
    });

    tasks.forEach(function(task) {
        taskList.appendChild(task);
    });
}

// تشغيل تحميل المهام
loadTasks();
const backToTop = document.getElementById("backToTop");

backToTop.style.display = "none";

window.addEventListener("scroll", function () {
    if (window.scrollY > 300) {
        backToTop.style.display = "block";
    } else {
        backToTop.style.display = "none";
    }
});// إظهار زر تسجيل الخروج عند تسجيل الدخول
const logoutBtn = document.getElementById("logoutBtn");

if (localStorage.getItem("isLoggedIn") === "true" && logoutBtn) {
    logoutBtn.style.display = "inline-block";
}

// تسجيل الخروج
function logout() {
    localStorage.removeItem("isLoggedIn");
    window.location.href = "login.html";
}
// حذف الحساب
function deleteAccount() {
    let confirmDelete = confirm("هل أنت متأكد من حذف حسابك نهائيًا؟");

    if (confirmDelete) {
        localStorage.removeItem("registeredUsername");
        localStorage.removeItem("registeredPassword");
        localStorage.removeItem("isLoggedIn");

        alert("تم حذف الحساب بنجاح 🗑️");

        window.location.href = "register.html";
    }
}