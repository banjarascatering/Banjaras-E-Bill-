/* ============================================================
   BANJARA'S E-BILL — NATIVE BRIDGE
   Makes Download JPG / WhatsApp Share / Print work inside the
   Android APK. On a normal browser this file does nothing.
   ============================================================ */
(function () {
  'use strict';

  var Cap = window.Capacitor;
  if (!Cap || !Cap.isNativePlatform || !Cap.isNativePlatform()) return; // browser -> do nothing

  // registerPlugin works without any bundler; Plugins.<Name> is the fallback.
  function getPlugin(name) {
    try { if (Cap.registerPlugin) return Cap.registerPlugin(name); } catch (e) {}
    return (Cap.Plugins || {})[name];
  }
  var Filesystem = getPlugin('Filesystem');
  var Share = getPlugin('Share');

  function toast(msg) {
    var t = document.getElementById('toast');
    if (t) { t.textContent = msg; t.classList.add('show'); setTimeout(function () { t.classList.remove('show'); }, 2600); }
  }

  function dataUrlToBase64(dataUrl) { return dataUrl.split(',')[1]; }

  /* Save a file into the phone's Documents/Banjaras-Bills folder,
     then return its URI so it can be shared. */
  async function saveToPhone(fileName, base64) {
    var res = await Filesystem.writeFile({
      path: 'Banjaras-Bills/' + fileName,
      data: base64,
      directory: 'DOCUMENTS',
      recursive: true
    });
    return res.uri;
  }

  /* ---- 1. Catch <a download> clicks (Download JPG button) ---- */
  document.addEventListener('click', async function (e) {
    var a = e.target.closest && e.target.closest('a[download]');
    if (!a || !a.href || a.href.indexOf('data:') !== 0) return;
    e.preventDefault(); e.stopPropagation();
    try {
      var uri = await saveToPhone(a.getAttribute('download'), dataUrlToBase64(a.href));
      toast('Saved in Documents/Banjaras-Bills');
      if (Share) { Share.share({ title: 'Invoice saved', url: uri, dialogTitle: 'Open / share invoice' }).catch(function () {}); }
    } catch (err) { toast('Could not save file: ' + (err && err.message ? err.message : err)); }
  }, true);

  /* Programmatic link.click() on a detached <a> never reaches document,
     so patch HTMLAnchorElement.click for data-URL downloads too. */
  var origClick = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function () {
    if (this.hasAttribute('download') && this.href && this.href.indexOf('data:') === 0) {
      var name = this.getAttribute('download'), href = this.href;
      saveToPhone(name, dataUrlToBase64(href)).then(function (uri) {
        toast('Saved in Documents/Banjaras-Bills');
        if (Share) { Share.share({ title: 'Invoice saved', url: uri, dialogTitle: 'Open / share invoice' }).catch(function () {}); }
      }).catch(function (err) { toast('Could not save file'); });
      return;
    }
    return origClick.apply(this, arguments);
  };

  /* ---- 2. navigator.share with files (WhatsApp button) ----
     WebView has no file-sharing, so we replace it with the real
     Android share sheet through the Capacitor Share plugin. */
  navigator.canShare = function (data) { return !!(data && data.files && data.files.length); };
  navigator.share = async function (data) {
    try {
      var url;
      if (data.files && data.files.length) {
        var f = data.files[0];
        var b64 = await new Promise(function (ok, bad) {
          var r = new FileReader();
          r.onload = function () { ok(String(r.result).split(',')[1]); };
          r.onerror = bad;
          r.readAsDataURL(f);
        });
        url = await saveToPhone(f.name, b64);
      }
      await Share.share({ title: data.title || '', text: data.text || '', url: url, dialogTitle: 'Send invoice' });
    } catch (err) {
      if (String(err && err.message).toLowerCase().indexOf('cancel') === -1) throw err;
      var ab = new Error('cancelled'); ab.name = 'AbortError'; throw ab;
    }
  };

  /* ---- 3. window.print() -> Android print dialog ---- */
  window.print = function () {
    if (window.AndroidPrint && window.AndroidPrint.print) { window.AndroidPrint.print(); }
    else { toast('Print not available. Use Download JPG and print from Gallery.'); }
  };

  /* ---- 4. wa.me links open in WhatsApp app, not inside the WebView ---- */
  var origOpen = window.open;
  window.open = function (url) {
    if (url && /^https?:\/\//.test(url)) { window.location.href = url; return null; }
    return origOpen.apply(window, arguments);
  };
})();
