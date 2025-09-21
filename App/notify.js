export function notify(msg, type="success") {
  const box = document.getElementById("notify");
  const el = document.createElement("div");
  el.className = "notify " + type;
  el.textContent = msg;
  box.appendChild(el);
  setTimeout(()=> el.remove(), 4000);
}
