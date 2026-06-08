// ==============================
// VICKEN BOOTH FINANCE - V1
// ==============================

document.addEventListener("DOMContentLoaded", () => {
  initializeSettings();
  initializeDate();

  setupSidebar();
  setupNavigation();
  setupOwnerMode();

  showPage("incomePage");
});

// ==============================
// INITIAL DATA
// ==============================

function initializeSettings() {
  const defaultSettings = {
    ownerPassword: "admin123",
    normalPrice: 25000,
    voucherDiscount: 5000,
    extraStripPrice: 4000,
  };

  if (!localStorage.getItem("settings")) {
    localStorage.setItem("settings", JSON.stringify(defaultSettings));
  }

  if (!localStorage.getItem("transactions")) {
    localStorage.setItem("transactions", JSON.stringify([]));
  }

  if (!localStorage.getItem("paperStock")) {
    localStorage.setItem("paperStock", JSON.stringify(0));
  }

  if (!localStorage.getItem("paperHistory")) {
    localStorage.setItem("paperHistory", JSON.stringify([]));
  }
}

// ==============================
// DATE
// ==============================

function initializeDate() {
  const dateElement = document.getElementById("todayDate");

  const today = new Date();

  const formatted = today.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  dateElement.textContent = formatted;
}

// ==============================
// SIDEBAR MOBILE
// ==============================

function setupSidebar() {
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");

  hamburgerBtn.addEventListener("click", () => {
    sidebar.classList.add("show");
    overlay.classList.add("show");
  });

  overlay.addEventListener("click", () => {
    sidebar.classList.remove("show");
    overlay.classList.remove("show");
  });
}

// ==============================
// NAVIGATION
// ==============================

function setupNavigation() {
  document.addEventListener("click", (e) => {
    const button = e.target.closest("[data-page]");

    if (!button) return;

    const pageId = button.dataset.page;

    showPage(pageId);
  });
}

function showPage(pageId) {
  document.querySelectorAll(".page").forEach((page) => {
    page.classList.remove("active-page");
  });

  document.getElementById(pageId).classList.add("active-page");

  document.querySelectorAll(".menu-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  document.querySelectorAll(`[data-page="${pageId}"]`).forEach((btn) => {
    btn.classList.add("active");
  });

  updatePageTitle(pageId);

  closeSidebarMobile();
}

function updatePageTitle(pageId) {
  const titles = {
    incomePage: "Pendapatan",
    dashboardPage: "Dashboard",
    expensePage: "Pengeluaran",
    historyPage: "Riwayat",
    reportPage: "Laporan",
    paperPage: "Stok Kertas",
    settingPage: "Pengaturan",
    backupPage: "Backup",
  };

  document.getElementById("pageTitle").textContent =
    titles[pageId] || "Vicken Booth";
}

// ==============================
// OWNER MODE
// ==============================

function setupOwnerMode() {
  const ownerLoginBtn = document.getElementById("ownerLoginBtn");

  const ownerModal = document.getElementById("ownerModal");

  const cancelOwnerBtn = document.getElementById("cancelOwnerBtn");

  const confirmOwnerBtn = document.getElementById("confirmOwnerBtn");

  const logoutOwnerBtn = document.getElementById("logoutOwnerBtn");

  ownerLoginBtn.addEventListener("click", () => {
    ownerModal.style.display = "flex";

    document.getElementById("ownerPassword").value = "";
  });

  cancelOwnerBtn.addEventListener("click", () => {
    ownerModal.style.display = "none";
  });

  confirmOwnerBtn.addEventListener("click", loginOwner);

  logoutOwnerBtn.addEventListener("click", logoutOwner);
}

function loginOwner() {
  const password = document.getElementById("ownerPassword").value;

  const settings = JSON.parse(localStorage.getItem("settings"));

  if (password === settings.ownerPassword) {
    localStorage.setItem("ownerMode", "true");

    activateOwnerMode();

    document.getElementById("ownerModal").style.display = "none";

    showToast("Mode owner aktif.");
  } else {
    showToast("Password owner salah.");
  }
}

function logoutOwner() {
  localStorage.setItem("ownerMode", "false");

  activateCashierMode();

  showPage("incomePage");

  showToast("Kembali ke mode kasir.");
}

function activateOwnerMode() {
  document.getElementById("cashierMenu").style.display = "none";

  document.getElementById("ownerMenu").style.display = "block";

  document.getElementById("roleBadge").textContent = "MODE OWNER";
}

function activateCashierMode() {
  document.getElementById("cashierMenu").style.display = "block";

  document.getElementById("ownerMenu").style.display = "none";

  document.getElementById("roleBadge").textContent = "MODE KASIR";
}

window.addEventListener("load", () => {
  const ownerMode = localStorage.getItem("ownerMode");

  if (ownerMode === "true") {
    activateOwnerMode();
  } else {
    activateCashierMode();
  }
});

// ==============================
// TOAST
// ==============================

function showToast(message) {
  const toast = document.getElementById("toast");

  const toastMessage = document.getElementById("toastMessage");

  toastMessage.textContent = message;

  toast.style.display = "block";

  setTimeout(() => {
    toast.style.display = "none";
  }, 3000);
}

// ==============================
// UTILITIES
// ==============================

function closeSidebarMobile() {
  document.getElementById("sidebar").classList.remove("show");

  document.getElementById("overlay").classList.remove("show");
}

// ==============================
// V2 - INCOME MODULE
// ==============================

let tempIncomeData = null;

document
  .getElementById("continueIncomeBtn")
  .addEventListener("click", prepareIncome);

document.getElementById("backIncomeBtn").addEventListener("click", () => {
  document.getElementById("incomeFormCard").style.display = "block";
  document.getElementById("incomeSummaryCard").style.display = "none";
});

document
  .getElementById("saveIncomeBtn")
  .addEventListener("click", saveIncomeTransaction);

// ==============================
// STEP 1 - PREPARE DATA
// ==============================

function prepareIncome() {
  const settings = JSON.parse(localStorage.getItem("settings"));

  const voucher = document.querySelector('input[name="voucher"]:checked').value;
  const extraStrip = parseInt(document.getElementById("extraStrip").value || 0);
  const brokenPaper = parseInt(
    document.getElementById("brokenPaper").value || 0
  );
  const note = document.getElementById("incomeNote").value;

  let basePrice = settings.normalPrice;
  let discount = 0;

  if (voucher === "yes") {
    discount = settings.voucherDiscount;
  }

  const extraCost = extraStrip * settings.extraStripPrice;

  const total = basePrice - discount + extraCost;

  const paperUsed = 1 + extraStrip + brokenPaper;

  tempIncomeData = {
    voucher,
    extraStrip,
    brokenPaper,
    note,
    basePrice,
    discount,
    extraCost,
    total,
    paperUsed,
  };

  // Update UI
  document.getElementById("summaryBasePrice").innerText =
    formatRupiah(basePrice);
  document.getElementById("summaryVoucher").innerText =
    "-" + formatRupiah(discount);
  document.getElementById("summaryExtra").innerText =
    "+" + formatRupiah(extraCost);
  document.getElementById("summaryTotal").innerText = formatRupiah(total);
  document.getElementById("summaryPaper").innerText = paperUsed + " lembar";
  document.getElementById("summaryNote").innerText = note || "-";

  document.getElementById("incomeFormCard").style.display = "none";
  document.getElementById("incomeSummaryCard").style.display = "block";
}

// ==============================
// STEP 2 - SAVE TRANSACTION
// ==============================

function saveIncomeTransaction() {
  const transactions = JSON.parse(localStorage.getItem("transactions"));
  const paperStock = parseInt(localStorage.getItem("paperStock"));

  const now = new Date();

  const newTransaction = {
    id: "TRX-" + now.getTime(),
    tanggal: now.toLocaleDateString("id-ID"),
    waktu: now.toLocaleTimeString("id-ID"),

    tipe: "pendapatan",

    voucher: tempIncomeData.voucher,
    extraStrip: tempIncomeData.extraStrip,
    brokenPaper: tempIncomeData.brokenPaper,

    nominal: tempIncomeData.total,

    paperUsed: tempIncomeData.paperUsed,

    note: tempIncomeData.note,

    status: "selesai",
    cancelReason: "",
  };

  // Simpan transaksi
  transactions.push(newTransaction);
  localStorage.setItem("transactions", JSON.stringify(transactions));

  // Update stok kertas (OPSION A: boleh minus)
  const newStock = paperStock - tempIncomeData.paperUsed;
  localStorage.setItem("paperStock", newStock);

  // Reset form
  resetIncomeForm();

  // Toast
  showToast("Transaksi berhasil disimpan");

  // Kembali ke form
  document.getElementById("incomeFormCard").style.display = "block";
  document.getElementById("incomeSummaryCard").style.display = "none";
}

// ==============================
// RESET FORM
// ==============================

function resetIncomeForm() {
  document.getElementById("extraStrip").value = 0;
  document.getElementById("brokenPaper").value = 0;
  document.getElementById("incomeNote").value = "";

  document.querySelector('input[name="voucher"][value="no"]').checked = true;
}

// ==============================
// FORMAT RUPIAH
// ==============================

function formatRupiah(number) {
  return "Rp" + number.toLocaleString("id-ID");
}

// ==============================
// V3 - DASHBOARD ENGINE
// ==============================

// Trigger update saat buka dashboard
document.addEventListener("click", (e) => {
  const btn = e.target.closest('[data-page="dashboardPage"]');
  if (btn) {
    updateDashboard();
  }
});

// Update setelah transaksi disimpan
const originalSaveIncome = window.saveIncomeTransaction;

window.saveIncomeTransaction = function () {
  if (originalSaveIncome) originalSaveIncome();
  setTimeout(updateDashboard, 300);
};

// ==============================
// DASHBOARD MAIN FUNCTION
// ==============================

function updateDashboard() {
  const transactions = JSON.parse(localStorage.getItem("transactions")) || [];
  const paperStock = parseInt(localStorage.getItem("paperStock")) || 0;

  const today = new Date().toLocaleDateString("id-ID");

  let incomeToday = 0;
  let expenseToday = 0;
  let sessionToday = 0;

  transactions.forEach((trx) => {
    if (trx.tanggal === today && trx.status === "selesai") {
      if (trx.tipe === "pendapatan") {
        incomeToday += trx.nominal;
        sessionToday += 1;
      }

      if (trx.tipe === "pengeluaran") {
        expenseToday += trx.nominal;
      }
    }
  });

  const profitToday = incomeToday - expenseToday;

  // ==============================
  // UPDATE UI DASHBOARD
  // ==============================

  const incomeEl = document.getElementById("todayIncome");
  const expenseEl = document.getElementById("todayExpense");
  const profitEl = document.getElementById("todayProfit");
  const sessionEl = document.getElementById("todaySession");
  const paperEl = document.getElementById("paperStock");

  if (incomeEl) incomeEl.innerText = formatRupiah(incomeToday);
  if (expenseEl) expenseEl.innerText = formatRupiah(expenseToday);
  if (profitEl) profitEl.innerText = formatRupiah(profitToday);
  if (sessionEl) sessionEl.innerText = sessionToday;
  if (paperEl) paperEl.innerText = paperStock;
}

// ==============================
// AUTO INIT DASHBOARD
// ==============================

setTimeout(() => {
  updateDashboard();
}, 500);

// ==============================
// V3 FIX PATCH - GLOBAL EXPORT
// ==============================

// Pastikan function tersedia global
window.updateDashboard = updateDashboard;
window.saveIncomeTransaction = saveIncomeTransaction;

// ==============================
// V4 - EXPENSE MODULE
// ==============================

document.getElementById("expensePage").innerHTML = `
<div class="card">
    <h2>Input Pengeluaran</h2>

    <div class="form-group">
        <label>Nama Barang</label>
        <input type="text" id="expenseName">
    </div>

    <div class="form-group">
        <label>Harga</label>
        <input type="number" id="expensePrice">
    </div>

    <div class="form-group">
        <label>Keterangan</label>
        <textarea id="expenseNote"></textarea>
    </div>

    <button class="primary-btn" onclick="saveExpense()">SIMPAN PENGELUARAN</button>
</div>
`;

window.saveExpense = function () {
  const name = document.getElementById("expenseName").value;
  const price = parseInt(document.getElementById("expensePrice").value || 0);
  const note = document.getElementById("expenseNote").value;

  if (!name || price <= 0) {
    showToast("Data pengeluaran tidak valid");
    return;
  }

  const transactions = JSON.parse(localStorage.getItem("transactions")) || [];

  const now = new Date();

  const expense = {
    id: "EXP-" + now.getTime(),
    tanggal: now.toLocaleDateString("id-ID"),
    waktu: now.toLocaleTimeString("id-ID"),

    tipe: "pengeluaran",
    nominal: price,

    name,
    note,

    status: "selesai",
  };

  transactions.push(expense);
  localStorage.setItem("transactions", JSON.stringify(transactions));

  showToast("Pengeluaran disimpan");

  document.getElementById("expenseName").value = "";
  document.getElementById("expensePrice").value = "";
  document.getElementById("expenseNote").value = "";

  updateDashboard();
};

// ==============================
// V4 - HISTORY MODULE
// ==============================

document.getElementById("historyPage").innerHTML = `
<div class="card">
    <h2>Riwayat Transaksi</h2>
    <div id="historyList"></div>
</div>
`;

function loadHistory() {
  const container = document.getElementById("historyList");
  const transactions = JSON.parse(localStorage.getItem("transactions")) || [];

  container.innerHTML = "";

  transactions
    .slice()
    .reverse()
    .forEach((trx) => {
      const div = document.createElement("div");
      div.className = "card";

      div.innerHTML = `
            <b>${trx.tipe.toUpperCase()}</b><br>
            ${trx.tanggal} ${trx.waktu}<br>
            Rp ${trx.nominal}<br>
            Status: ${trx.status || "-"}<br><br>

            <button onclick="cancelTransaction('${trx.id}')">
                Batalkan
            </button>
        `;

      container.appendChild(div);
    });
}

// ==============================
// V4 - CANCEL TRANSACTION
// ==============================

window.cancelTransaction = function (id) {
  let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

  const index = transactions.findIndex((t) => t.id === id);

  if (index === -1) return;

  const trx = transactions[index];

  if (trx.status === "dibatalkan") {
    showToast("Sudah dibatalkan");
    return;
  }

  trx.status = "dibatalkan";

  // rollback stok jika pendapatan
  if (trx.tipe === "pendapatan") {
    const paperStock = parseInt(localStorage.getItem("paperStock")) || 0;

    const rollback = trx.paperUsed || 0;

    localStorage.setItem("paperStock", paperStock + rollback);
  }

  transactions[index] = trx;

  localStorage.setItem("transactions", JSON.stringify(transactions));

  showToast("Transaksi dibatalkan");

  loadHistory();
  updateDashboard();
};

// ==============================
// AUTO LOAD HISTORY
// ==============================

document.addEventListener("click", (e) => {
  const btn = e.target.closest('[data-page="historyPage"]');

  if (btn) {
    loadHistory();
  }
});

// ==============================
// V5 - REPORT ENGINE (SIMPLE)
// ==============================

function getTransactions() {
  return JSON.parse(localStorage.getItem("transactions")) || [];
}

// ==============================
// FILTER TIME
// ==============================

function isSameDate(dateStr) {
  const today = new Date().toLocaleDateString("id-ID");
  return dateStr === today;
}

function isSameMonth(dateStr) {
  const now = new Date();
  const [day, month, year] = dateStr.split(" ");
  const currentMonth = now.toLocaleDateString("id-ID", { month: "long" });
  const currentYear = now.getFullYear();

  return dateStr.includes(currentMonth) && dateStr.includes(currentYear);
}

// ==============================
// DAILY REPORT
// ==============================

function getDailyReport() {
  const data = getTransactions();

  let income = 0;
  let expense = 0;
  let session = 0;

  data.forEach((t) => {
    if (
      t.tanggal === new Date().toLocaleDateString("id-ID") &&
      t.status === "selesai"
    ) {
      if (t.tipe === "pendapatan") {
        income += t.nominal;
        session++;
      }

      if (t.tipe === "pengeluaran") {
        expense += t.nominal;
      }
    }
  });

  return {
    income,
    expense,
    profit: income - expense,
    session,
  };
}

// ==============================
// MONTHLY REPORT
// ==============================

function getMonthlyReport() {
  const data = getTransactions();

  const now = new Date();
  const month = now.toLocaleDateString("id-ID", { month: "long" });
  const year = now.getFullYear();

  let income = 0;
  let expense = 0;

  data.forEach((t) => {
    if (
      t.tanggal.includes(month) &&
      t.tanggal.includes(year) &&
      t.status === "selesai"
    ) {
      if (t.tipe === "pendapatan") {
        income += t.nominal;
      }

      if (t.tipe === "pengeluaran") {
        expense += t.nominal;
      }
    }
  });

  return {
    income,
    expense,
    profit: income - expense,
  };
}

// ==============================
// EXPORT CSV
// ==============================

function exportCSV() {
  const data = getTransactions();

  let csv = "Tanggal,Waktu,Tipe,Nominal,Status,Keterangan\n";

  data.forEach((t) => {
    csv += `${t.tanggal},${t.waktu},${t.tipe},${t.nominal},${t.status || ""},${
      t.note || t.name || ""
    }\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "laporan-photobooth.csv";
  a.click();
}

// ==============================
// BACKUP SYSTEM
// ==============================

function exportBackup() {
  const backup = {
    transactions: localStorage.getItem("transactions"),
    settings: localStorage.getItem("settings"),
    paperStock: localStorage.getItem("paperStock"),
  };

  const blob = new Blob([JSON.stringify(backup)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "backup-photobooth.json";
  a.click();
}

// ==============================
// RESTORE BACKUP
// ==============================

function importBackup(file) {
  const reader = new FileReader();

  reader.onload = function (e) {
    const data = JSON.parse(e.target.result);

    if (data.transactions)
      localStorage.setItem("transactions", data.transactions);
    if (data.settings) localStorage.setItem("settings", data.settings);
    if (data.paperStock) localStorage.setItem("paperStock", data.paperStock);

    alert("Backup berhasil di-restore!");
  };

  reader.readAsText(file);
}

function loadReport() {
  const data = getDailyReport();

  document.getElementById("reportIncome").innerText = formatRupiah(data.income);
  document.getElementById("reportExpense").innerText = formatRupiah(
    data.expense
  );
  document.getElementById("reportProfit").innerText = formatRupiah(
    data.income - data.expense
  );
  document.getElementById("reportSession").innerText = data.session;
}

function addPaperStock() {
  let stock = parseInt(localStorage.getItem("paperStock")) || 0;
  let add = parseInt(document.getElementById("addPaperStock").value || 0);

  stock += add;

  localStorage.setItem("paperStock", stock);

  document.getElementById("paperStockValue").innerText = stock;

  showToast("Stok kertas ditambahkan");
}

function saveSettings() {
  const settings = JSON.parse(localStorage.getItem("settings"));

  settings.ownerPassword =
    document.getElementById("newPassword").value || settings.ownerPassword;
  settings.normalPrice = parseInt(
    document.getElementById("priceNormal").value || settings.normalPrice
  );
  settings.voucherDiscount = parseInt(
    document.getElementById("priceVoucher").value || settings.voucherDiscount
  );
  settings.extraStripPrice = parseInt(
    document.getElementById("priceStrip").value || settings.extraStripPrice
  );

  localStorage.setItem("settings", JSON.stringify(settings));

  showToast("Pengaturan disimpan");
}

function handleImport() {
  const file = document.getElementById("importFile").files[0];

  if (!file) return;

  importBackup(file);
}

document.addEventListener("click", (e) => {
  const btn = e.target.closest('[data-page="paperPage"]');

  if (btn) {
    document.getElementById("paperStockValue").innerText =
      localStorage.getItem("paperStock") || 0;
  }
});
