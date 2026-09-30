/* ===== BUSINESS NUMBER (WhatsApp + Google Pay + PhonePe) ===== */
const WHATSAPP_NUMBER = "919666338998";
const UPI_ID = "mohannunna23@ybl";  // YOUR receiving UPI ID: copy it exactly from PhonePe or Google Pay (Profile > UPI IDs)
/* ============================================================ */
const UPI_NAME = "Nunna's Pickles";
/* ================================ */

const products = [
  { id: "chicken", name: "Chicken Pickle", cat: "Non-vegetarian pickle", price: 1230, img: "images/chicken.jpg",
    desc: "Authentic homemade-style chicken pickle with a rich and spicy flavour." },
  { id: "prawns", name: "Prawns Pickle", cat: "Seafood pickle", price: 1380, img: "images/prawns.jpg",
    desc: "Rich and flavourful prawns pickle prepared with traditional Indian spices." }
];
const grams = { chicken: 0, prawns: 0 };
const $ = id => document.getElementById(id);
const rupees = n => "₹" + n.toLocaleString("en-IN");
const weight = g => g >= 1000 ? (g / 1000) + " kg" : g + " g";
const cost = p => Math.round(p.price * grams[p.id] / 1000);
const total = () => products.reduce((s, p) => s + cost(p), 0);

$("productGrid").innerHTML = products.map(p => `
  <article class="card">
    <div class="ph"><img src="${p.img}" alt="${p.name}" onerror="this.style.display='none'"><span class="tag">HOMEMADE</span></div>
    <div class="body">
      <p class="cat">${p.cat}</p><h3>${p.name}</h3><p>${p.desc}</p>
      <p class="price">${rupees(p.price)} <small>/ kg</small></p>
      <div class="step">
        <button type="button" data-id="${p.id}" data-d="-1" aria-label="Reduce ${p.name}">−</button>
        <output id="q-${p.id}">0 g</output>
        <button type="button" data-id="${p.id}" data-d="1" aria-label="Add ${p.name}">+</button>
      </div>
      <p class="min">Minimum 500 g. Adds 500 g each tap.</p>
    </div>
  </article>`).join("");

document.addEventListener("click", e => {
  const b = e.target.closest(".step button");
  if (!b) return;
  grams[b.dataset.id] = Math.max(0, grams[b.dataset.id] + 500 * Number(b.dataset.d));
  draw();
});

function draw() {
  products.forEach(p => $("q-" + p.id).textContent = grams[p.id] ? weight(grams[p.id]) : "0 g");
  const rows = products.filter(p => grams[p.id]).map(p => `<li><span>${p.name} – ${weight(grams[p.id])}</span><b>${rupees(cost(p))}</b></li>`);
  $("summary").innerHTML = rows.length ? rows.join("") : '<li class="empty">No pickles added yet.</li>';
  $("total").textContent = rupees(total());
}

function valid() {
  const err = $("error"); err.textContent = "";
  if (!total()) { err.textContent = "Please add at least 500 g of a pickle."; return false; }
  if (!$("name").value.trim() || $("phone").value.replace(/\D/g, "").length < 10 || !$("address").value.trim()) {
    err.textContent = "Please fill in your name, phone number and delivery location."; return false;
  }
  return true;
}

function pay(app) {
  if (!valid()) return;
  const lines = products.filter(p => grams[p.id]).map(p => `${p.name} – ${weight(grams[p.id])} = ${rupees(cost(p))}`);
  const msg = `*New Order – Nunna's Pickles*\n${lines.join("\n")}\n*Total: ${rupees(total())}*\nPayment: ${app} to ${UPI_ID} (screenshot attached)\n\nName: ${$("name").value.trim()}\nPhone: ${$("phone").value.trim()}\nDelivery: ${$("address").value.trim()}` +
    ($("notes").value.trim() ? `\nNotes: ${$("notes").value.trim()}` : "");
  $("waSend").href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  $("afterPay").style.display = "block";
  const q = `pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(UPI_NAME)}&am=${total().toFixed(2)}&cu=INR&tn=${encodeURIComponent("Nunna's Pickles order")}`;
  if (!/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) { showQR("upi://pay?" + q); return; }
  window.location.href = (app === "Google Pay" ? "tez://upi/pay?" : "phonepe://pay?") + q;
}
function showQR(link) {
  const box = $("qrBox"); box.style.display = "block";
  $("qrCanvas").innerHTML = "";
  new QRCode($("qrCanvas"), { text: link, width: 220, height: 220 });
  $("qrAmt").textContent = rupees(total());
  box.scrollIntoView({ behavior: "smooth", block: "center" });
}
$("gpay").onclick = () => pay("Google Pay");
$("phonepe").onclick = () => pay("PhonePe");
["waFloat", "waContact"].forEach(id => $(id).href = `https://wa.me/${WHATSAPP_NUMBER}`);
draw();