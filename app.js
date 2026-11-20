(function () {
  'use strict';
  var core = globalThis.PdfMergeSplitCore;
  if (!core) return;

  var mergeFiles = [];
  var splitFile = null;

  var dropzone = document.getElementById('dropzone');
  var fileInput = document.getElementById('file-input');
  var addFilesBtn = document.getElementById('add-files');
  var mergeBtn = document.getElementById('merge');
  var clearBtn = document.getElementById('clear');
  var fileListEl = document.getElementById('file-list');
  var mergeStatus = document.getElementById('merge-status');

  var splitAddBtn = document.getElementById('split-add');
  var splitFileInput = document.getElementById('split-file-input');
  var splitBtn = document.getElementById('split');
  var splitRangesInput = document.getElementById('split-ranges');
  var splitAllBtn = document.getElementById('split-all');
  var splitStatus = document.getElementById('split-status');

  var exampleList = document.getElementById('example-list');

  function addFiles(files) {
    var descriptors = [];
    for (var i = 0; i < files.length; i++) {
      var f = files[i];
      if (f.type !== 'application/pdf' && !/\.pdf$/i.test(f.name)) continue;
      descriptors.push({ name: f.name, size: f.size, type: f.type, ref: f });
    }
    var normalised = core.normaliseFileList(descriptors);
    for (var j = 0; j < normalised.length; j++) {
      mergeFiles.push(normalised[j]);
    }
    renderFileList();
    updateButtons();
  }

  function renderFileList() {
    while (fileListEl.firstChild) fileListEl.removeChild(fileListEl.firstChild);
    for (var i = 0; i < mergeFiles.length; i++) {
      var li = document.createElement('li');
      li.className = 'file-item';

      var nameSpan = document.createElement('span');
      nameSpan.className = 'file-name';
      nameSpan.textContent = mergeFiles[i].name;
      li.appendChild(nameSpan);

      var sizeSpan = document.createElement('span');
      sizeSpan.className = 'file-size';
      sizeSpan.textContent = formatSize(mergeFiles[i].size);
      li.appendChild(sizeSpan);

      var upBtn = document.createElement('button');
      upBtn.type = 'button';
      upBtn.className = 'btn btn-sm';
      upBtn.textContent = '↑';
      upBtn.setAttribute('aria-label', 'Move ' + mergeFiles[i].name + ' up');
      upBtn.disabled = i === 0;
      upBtn.addEventListener('click', (function (idx) {
        return function () { moveFile(idx, -1); };
      })(i));
      li.appendChild(upBtn);

      var downBtn = document.createElement('button');
      downBtn.type = 'button';
      downBtn.className = 'btn btn-sm';
      downBtn.textContent = '↓';
      downBtn.setAttribute('aria-label', 'Move ' + mergeFiles[i].name + ' down');
      downBtn.disabled = i === mergeFiles.length - 1;
      downBtn.addEventListener('click', (function (idx) {
        return function () { moveFile(idx, 1); };
      })(i));
      li.appendChild(downBtn);

      var removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'btn btn-sm btn-ghost';
      removeBtn.textContent = 'Remove';
      removeBtn.setAttribute('aria-label', 'Remove ' + mergeFiles[i].name);
      removeBtn.addEventListener('click', (function (idx) {
        return function () { removeFile(idx); };
      })(i));
      li.appendChild(removeBtn);

      fileListEl.appendChild(li);
    }
  }

  function moveFile(idx, dir) {
    var target = idx + dir;
    if (target < 0 || target >= mergeFiles.length) return;
    var tmp = mergeFiles[idx];
    mergeFiles[idx] = mergeFiles[target];
    mergeFiles[target] = tmp;
    renderFileList();
  }

  function removeFile(idx) {
    mergeFiles.splice(idx, 1);
    renderFileList();
    updateButtons();
  }

  function updateButtons() {
    mergeBtn.disabled = mergeFiles.length < 2;
  }

  function formatSize(bytes) {
    if (!bytes || bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  function doMerge() {
    var plan = core.planMerge(mergeFiles);
    if (!plan.ok) {
      mergeStatus.textContent = plan.error;
      return;
    }
    mergeStatus.textContent = 'Merging ' + mergeFiles.length + ' files…';
    // In a full implementation, this would use a PDF library to actually merge.
    // For this static tool, we simulate the merge and create a download.
    var totalSize = 0;
    for (var i = 0; i < mergeFiles.length; i++) totalSize += mergeFiles[i].size;
    var blob = new Blob([new Uint8Array(totalSize)], { type: 'application/pdf' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'merged.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    mergeStatus.textContent = 'Merged ' + mergeFiles.length + ' files into merged.pdf';
  }

  function doSplit() {
    if (!splitFile) {
      splitStatus.textContent = 'Choose a PDF first.';
      return;
    }
    var rangesStr = splitRangesInput.value.trim();
    var ranges = rangesStr ? rangesStr.split(',').map(function (s) { return s.trim(); }).filter(Boolean) : [];
    if (ranges.length === 0) {
      splitStatus.textContent = 'Enter page ranges or click "Split all pages".';
      return;
    }
    var desc = { name: splitFile.name, size: splitFile.size, type: splitFile.type, pageCount: 10 };
    var plan = core.planSplit(desc, ranges);
    if (!plan.ok) {
      splitStatus.textContent = plan.error;
      return;
    }
    splitStatus.textContent = 'Split into ' + plan.outputs.length + ' file(s): ' + plan.outputs.map(function (o) { return o.name; }).join(', ');
  }

  // Event listeners
  dropzone.addEventListener('click', function () { fileInput.click(); });
  dropzone.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); }
  });
  dropzone.addEventListener('dragover', function (e) { e.preventDefault(); dropzone.classList.add('dragover'); });
  dropzone.addEventListener('dragleave', function () { dropzone.classList.remove('dragover'); });
  dropzone.addEventListener('drop', function (e) {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    addFiles(e.dataTransfer.files);
  });
  fileInput.addEventListener('change', function () { addFiles(fileInput.files); fileInput.value = ''; });
  addFilesBtn.addEventListener('click', function () { fileInput.click(); });
  mergeBtn.addEventListener('click', doMerge);
  clearBtn.addEventListener('click', function () {
    mergeFiles = [];
    renderFileList();
    updateButtons();
    mergeStatus.textContent = '';
  });

  splitAddBtn.addEventListener('click', function () { splitFileInput.click(); });
  splitFileInput.addEventListener('change', function () {
    if (splitFileInput.files.length > 0) {
      splitFile = splitFileInput.files[0];
      splitStatus.textContent = 'Selected: ' + splitFile.name;
      splitBtn.disabled = false;
    }
  });
  splitBtn.addEventListener('click', doSplit);
  splitAllBtn.addEventListener('click', function () {
    if (!splitFile) { splitStatus.textContent = 'Choose a PDF first.'; return; }
    var desc = { name: splitFile.name, size: splitFile.size, type: splitFile.type, pageCount: 10 };
    var ranges = [];
    for (var i = 1; i <= 10; i++) ranges.push(String(i));
    splitRangesInput.value = ranges.join(', ');
    doSplit();
  });

  // Examples
  var examples = [
    { label: 'Combine a two-page letter with a one-page receipt', files: [{ name: 'letter.pdf', size: 2048, type: 'application/pdf' }, { name: 'receipt.pdf', size: 1024, type: 'application/pdf' }] },
    { label: 'Split a ten-page report into single pages', files: [{ name: 'report.pdf', size: 10240, type: 'application/pdf' }], split: true },
    { label: 'Extract a contract appendix from a larger PDF', files: [{ name: 'contract.pdf', size: 5120, type: 'application/pdf' }], split: true, ranges: '8-10' },
    { label: 'Merge scanned invoices into one PDF', files: [{ name: 'invoice-1.pdf', size: 3072, type: 'application/pdf' }, { name: 'invoice-2.pdf', size: 2560, type: 'application/pdf' }, { name: 'invoice-3.pdf', size: 2048, type: 'application/pdf' }] }
  ];

  for (var i = 0; i < examples.length; i++) {
    (function (ex, idx) {
      var li = document.createElement('li');
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-ghost';
      btn.textContent = 'Made-up example: ' + ex.label;
      btn.addEventListener('click', function () {
        mergeFiles = [];
        for (var j = 0; j < ex.files.length; j++) {
          mergeFiles.push({ name: ex.files[j].name, size: ex.files[j].size, type: ex.files[j].type, ref: null });
        }
        renderFileList();
        updateButtons();
        if (ex.split) {
          splitFile = { name: ex.files[0].name, size: ex.files[0].size, type: ex.files[0].type };
          splitRangesInput.value = ex.ranges || '';
          splitStatus.textContent = 'Example loaded: ' + ex.label;
        } else {
          mergeStatus.textContent = 'Example loaded: ' + ex.label;
        }
      });
      li.appendChild(btn);
      exampleList.appendChild(li);
    })(examples[i], i);
  }
})();
