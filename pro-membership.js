import { supabase } from "./script.js";

const statusBox = document.getElementById("proAccountStatus");

function showStatus(title, message, expiry = "") {
  if (!statusBox) return;
  statusBox.replaceChildren();
  const strong = document.createElement("strong");
  strong.textContent = title;
  const p = document.createElement("p");
  p.textContent = message;
  statusBox.append(strong, p);
  if (expiry) {
    const small = document.createElement("p");
    small.className = "pro-expiry";
    small.textContent = expiry;
    statusBox.append(small);
  }
}

async function loadMembership() {
  if (!statusBox) return;
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !sessionData.session) {
    showStatus("حالة عضويتك: زائر", "سجّل الدخول إلى حسابك لمعرفة حالة عضوية Medo Pro.");
    return;
  }
  const userId = sessionData.session.user.id;
  const { data, error } = await supabase
    .from("pro_memberships")
    .select("status, starts_at, ends_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Medo Pro membership lookup failed:", error.message);
    showStatus("تعذر التحقق من العضوية", "تأكد من تنفيذ ملف SQL الخاص بعضويات Pro، ثم حدّث الصفحة.");
    return;
  }
  if (!data || data.status !== "active" || !data.ends_at || new Date(data.ends_at).getTime() <= Date.now()) {
    showStatus("حالة عضويتك: Medo Free", "أنت على الخطة المجانية حاليًا. تفعيل Pro غير متاح تلقائيًا بعد.");
    return;
  }
  const endDate = new Date(data.ends_at).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" });
  showStatus("💎 عضويتك: Medo Pro نشطة", "استمتع بمميزات العضوية المتاحة حاليًا.", `تنتهي العضوية في: ${endDate}`);
}

loadMembership();
supabase.auth.onAuthStateChange(() => {
  setTimeout(loadMembership, 0);
});
