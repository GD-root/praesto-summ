/* Praesto Sum: funcionamento sem internet.
   Ao publicar uma versão nova, troque o número abaixo para os celulares baixarem tudo de novo. */
var VERSAO = "praesto-v14";
var ARQUIVOS = ["./", "./index.html", "./manifest.webmanifest", "./icone-192.png", "./icone-512.png", "./icone-180.png", "./icone-512-mascara.png"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(VERSAO).then(function (c) { return c.addAll(ARQUIVOS); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (nomes) {
    return Promise.all(nomes.filter(function (n) { return n !== VERSAO; }).map(function (n) { return caches.delete(n); }));
  }).then(function () { return self.clients.claim(); }));
});

function guardar(req, resp) {
  if (resp && (resp.ok || resp.type === "opaque")) {
    var copia = resp.clone();
    caches.open(VERSAO).then(function (c) { c.put(req, copia); });
  }
  return resp;
}

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  var fonte = url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";
  if (url.origin !== location.origin && !fonte) return;

  /* A página: tenta a internet primeiro (para receber atualizações) e cai no que está guardado. */
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then(function (r) { return guardar(req, r); }).catch(function () {
      return caches.match(req, { ignoreSearch: true }).then(function (r) { return r || caches.match("./index.html"); });
    }));
    return;
  }
  /* O resto (ícones, fontes): usa o que está guardado e só busca o que faltar. */
  e.respondWith(caches.match(req).then(function (r) {
    return r || fetch(req).then(function (resp) { return guardar(req, resp); });
  }));
});
