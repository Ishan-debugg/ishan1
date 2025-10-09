// Global shared logic for CA साथी UI

function qs(selector, scope = document) { return scope.querySelector(selector); }
function qsa(selector, scope = document) { return Array.from(scope.querySelectorAll(selector)); }

function navigate(url) { window.location.href = url; }

function setupHeaderNav() {
  const loginBtn = qs('[data-nav="login"]');
  if (loginBtn) loginBtn.addEventListener('click', () => navigate('login.html'));
}

function setupSortableTable(tableSelector, initialSortKey) {
  const table = qs(tableSelector);
  if (!table) return;
  const tbody = table.tBodies[0];
  const headers = qsa('th[data-key]', table);
  let sortKey = initialSortKey || (headers[0] && headers[0].dataset.key);
  let sortDir = 'asc';

  function parseCell(text) {
    const num = Number(text.replace(/[^\d.-]/g, ''));
    return isNaN(num) ? text.toLowerCase() : num;
  }

  function sortBy(key) {
    const index = headers.findIndex(h => h.dataset.key === key);
    const rows = qsa('tr', tbody);
    rows.sort((a, b) => {
      const va = parseCell(a.children[index].textContent.trim());
      const vb = parseCell(b.children[index].textContent.trim());
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    tbody.innerHTML = '';
    rows.forEach(r => tbody.appendChild(r));
  }

  headers.forEach(h => {
    h.style.cursor = 'pointer';
    h.addEventListener('click', () => {
      const key = h.dataset.key;
      if (key === sortKey) sortDir = sortDir === 'asc' ? 'desc' : 'asc'; else { sortKey = key; sortDir = 'asc'; }
      sortBy(sortKey);
    });
  });

  if (sortKey) sortBy(sortKey);
}

function setupClientFilters() {
  const search = qs('#clientSearch');
  const riskFilter = qs('#riskFilter');
  const table = qs('#clientTable');
  if (!table) return;
  const tbody = table.tBodies[0];

  function apply() {
    const q = (search?.value || '').toLowerCase();
    const risk = riskFilter?.value || 'all';
    qsa('tr', tbody).forEach(tr => {
      const name = tr.dataset.name || '';
      const riskScore = Number(tr.dataset.risk || '0');
      const showByName = !q || name.includes(q);
      const showByRisk = risk === 'all' || (risk === 'high' && riskScore >= 80) || (risk === 'medium' && riskScore >= 50 && riskScore < 80) || (risk === 'low' && riskScore < 50);
      tr.style.display = (showByName && showByRisk) ? '' : 'none';
    });
  }

  search?.addEventListener('input', apply);
  riskFilter?.addEventListener('change', apply);
  apply();
}

function humanFileSize(bytes) {
  const thresh = 1024;
  if (Math.abs(bytes) < thresh) return bytes + ' B';
  const units = ['KB','MB','GB','TB'];
  let u = -1;
  do {
    bytes /= thresh; ++u;
  } while (Math.abs(bytes) >= thresh && u < units.length - 1);
  return bytes.toFixed(1)+' '+units[u];
}

function setupDropzone(el, onFiles) {
  const input = document.createElement('input');
  input.type = 'file';
  input.multiple = false;
  input.accept = el.dataset.accept || '';
  input.style.display = 'none';
  el.appendChild(input);

  function handleFiles(files) {
    if (!files || !files.length) return;
    const file = files[0];
    el.querySelector('.dz-status').textContent = `${file.name} • ${humanFileSize(file.size)}`;
    el.classList.remove('dragover');
    onFiles && onFiles(file);
  }

  el.addEventListener('click', () => input.click());
  el.addEventListener('dragover', (e) => { e.preventDefault(); el.classList.add('dragover'); });
  el.addEventListener('dragleave', () => el.classList.remove('dragover'));
  el.addEventListener('drop', (e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); });
  input.addEventListener('change', () => handleFiles(input.files));
}

function simulateProcessing(onProgress, steps) {
  const total = steps.length;
  let current = 0;
  const timer = setInterval(() => {
    current += 1;
    const percent = Math.min(100, Math.round((current / total) * 100));
    const step = steps[Math.min(current - 1, steps.length - 1)];
    onProgress(percent, step);
    if (current >= total) clearInterval(timer);
  }, 700);
}

function randomData(rows = 60) {
  const items = [];
  for (let i = 0; i < rows; i++) {
    const id = 'INV-' + String(10000 + i);
    const risk = Math.floor(Math.random() * 100);
    const reason = ['GSTR-2B Mismatch', 'Taxable Amount Outlier', 'Vendor Mismatch', 'Time Gap Anomaly'][Math.floor(Math.random() * 4)];
    const value = (Math.random() * 200000).toFixed(0);
    items.push({ id, risk, reason, value: Number(value) });
  }
  return items;
}

window.CA_UI = {
  setupHeaderNav,
  setupSortableTable,
  setupClientFilters,
  setupDropzone,
  simulateProcessing,
  randomData,
  navigate
};
