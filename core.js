(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.PdfMergeSplitCore = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function normaliseFileList(fileList) {
    if (!Array.isArray(fileList)) {
      throw new TypeError('normaliseFileList expects an array of file descriptors');
    }
    var seen = {};
    var out = [];
    for (var i = 0; i < fileList.length; i++) {
      var f = fileList[i];
      if (!f || typeof f !== 'object') continue;
      var name = typeof f.name === 'string' ? f.name.trim() : '';
      if (!name) continue;
      if (Object.prototype.hasOwnProperty.call(seen, name)) {
        seen[name] += 1;
        name = name.replace(/(\.[^.]+)?$/, function (ext, m) {
          return ' (' + seen[name] + ')' + (m || '');
        });
      } else {
        seen[name] = 1;
      }
      out.push({
        name: name,
        size: typeof f.size === 'number' ? f.size : 0,
        type: typeof f.type === 'string' ? f.type : 'application/pdf',
        ref: f.ref || null
      });
    }
    return out;
  }

  function planMerge(fileDescriptors) {
    if (!Array.isArray(fileDescriptors) || fileDescriptors.length === 0) {
      return { ok: false, error: 'No files to merge' };
    }
    var indices = [];
    for (var i = 0; i < fileDescriptors.length; i++) indices.push(i);
    return { ok: true, indices: indices };
  }

  function parseRange(str, maxPage) {
    var s = String(str).trim();
    if (!s) return null;
    var parts = s.split('-');
    if (parts.length === 1) {
      var n = parseInt(parts[0], 10);
      if (isNaN(n) || n < 1) return null;
      if (n > maxPage) n = maxPage;
      return { start: n, end: n };
    }
    if (parts.length === 2) {
      var a = parseInt(parts[0], 10);
      var b = parseInt(parts[1], 10);
      if (isNaN(a) || isNaN(b) || a < 1 || b < 1) return null;
      if (a > b) { var t = a; a = b; b = t; }
      if (a > maxPage) a = maxPage;
      if (b > maxPage) b = maxPage;
      if (a > b) return null;
      return { start: a, end: b };
    }
    return null;
  }

  function planSplit(fileDescriptor, ranges) {
    if (!fileDescriptor || typeof fileDescriptor !== 'object') {
      return { ok: false, error: 'No file to split' };
    }
    if (!Array.isArray(ranges) || ranges.length === 0) {
      return { ok: false, error: 'No page ranges provided' };
    }
    var maxPage = typeof fileDescriptor.pageCount === 'number' ? fileDescriptor.pageCount : 1;
    var outputs = [];
    var base = fileDescriptor.name || 'document.pdf';
    var stem = base.replace(/\.pdf$/i, '');
    for (var i = 0; i < ranges.length; i++) {
      var r = parseRange(ranges[i], maxPage);
      if (!r) continue;
      var label = r.start === r.end ? String(r.start) : r.start + '-' + r.end;
      outputs.push({
        name: outputNameFor(stem, i, label),
        start: r.start,
        end: r.end
      });
    }
    if (outputs.length === 0) {
      return { ok: false, error: 'No valid page ranges' };
    }
    return { ok: true, outputs: outputs };
  }

  function outputNameFor(base, index, label) {
    var safe = String(base || 'document').replace(/[^a-z0-9._-]/gi, '_');
    if (!safe) safe = 'document';
    var suffix = label ? '-' + label : '-' + (index + 1);
    return safe + suffix + '.pdf';
  }

  return {
    normaliseFileList: normaliseFileList,
    planMerge: planMerge,
    planSplit: planSplit,
    outputNameFor: outputNameFor
  };
});
