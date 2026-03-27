/**
 * Mappd Injection Script
 * Injected into target app iframes to intercept navigation.
 * Each iframe should stay on its assigned route — navigation events
 * are forwarded to the parent canvas which pans to the correct node.
 */
(function () {
  if (window.self === window.top) return;

  // The route this iframe is responsible for — it should never leave this URL
  var originalUrl = window.location.href;
  var originalPathname = window.location.pathname;

  // Real History API references (before we override)
  var realPushState = history.pushState.bind(history);
  var realReplaceState = history.replaceState.bind(history);

  // Flag to prevent re-entrancy when we restore the URL
  var isRestoring = false;

  /**
   * Restore the iframe to its original URL after an intercepted navigation.
   * Uses a microtask to run after Next.js/React finishes its navigation cycle.
   */
  function restoreOriginalUrl() {
    if (isRestoring) return;
    isRestoring = true;
    // Wait for the current call stack to clear (React/Next.js may queue multiple state updates)
    Promise.resolve().then(function () {
      setTimeout(function () {
        try {
          if (window.location.pathname !== originalPathname) {
            realReplaceState(null, '', originalUrl);
          }
        } catch (_) {
          // Cross-origin replaceState may fail in proxied iframes
        }
        isRestoring = false;
      }, 0);
    });
  }

  // --- Intercept link clicks ---
  document.addEventListener(
    'click',
    function (e) {
      var el = e.target;
      while (el && el.tagName !== 'A') el = el.parentElement;
      if (!el || !el.href) return;
      try {
        var url = new URL(el.href, window.location.origin);
        if (url.origin !== window.location.origin) return;
        // Only intercept if navigating to a DIFFERENT route
        if (url.pathname === originalPathname) return;

        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        window.parent.postMessage(
          { type: 'fc-navigate', from: originalPathname, to: url.pathname },
          '*'
        );
      } catch (_) {}
    },
    true
  );

  // --- Intercept History API (Next.js router.push/replace) ---
  history.pushState = function () {
    var u = arguments[2];
    if (u && typeof u === 'string' && !isRestoring) {
      try {
        var p = new URL(u, window.location.origin);
        if (p.origin === window.location.origin && p.pathname !== originalPathname) {
          window.parent.postMessage(
            { type: 'fc-navigate', from: originalPathname, to: p.pathname },
            '*'
          );
          // Don't apply the navigation — this iframe stays on its route
          restoreOriginalUrl();
          return;
        }
      } catch (_) {}
    }
    try {
      return realPushState.apply(history, arguments);
    } catch (_) {
      // Cross-origin pushState calls fail when iframe origin doesn't match URL
    }
  };

  history.replaceState = function () {
    var u = arguments[2];
    if (u && typeof u === 'string' && !isRestoring) {
      try {
        var p = new URL(u, window.location.origin);
        if (p.origin === window.location.origin && p.pathname !== originalPathname) {
          window.parent.postMessage(
            { type: 'fc-navigate', from: originalPathname, to: p.pathname },
            '*'
          );
          restoreOriginalUrl();
          return;
        }
      } catch (_) {}
    }
    try {
      return realReplaceState.apply(history, arguments);
    } catch (_) {
      // Cross-origin replaceState calls fail when iframe origin doesn't match URL
      // This is expected when iframes are proxied through a different port
    }
  };

  // --- Also intercept popstate (browser back/forward within the iframe) ---
  window.addEventListener('popstate', function () {
    if (window.location.pathname !== originalPathname && !isRestoring) {
      restoreOriginalUrl();
    }
  });

  // --- Forward wheel events for canvas zoom ---
  window.addEventListener(
    'wheel',
    function (e) {
      window.parent.postMessage(
        {
          type: 'fc-wheel',
          deltaX: e.deltaX,
          deltaY: e.deltaY,
          clientX: e.clientX,
          clientY: e.clientY,
          ctrlKey: e.ctrlKey,
          metaKey: e.metaKey,
        },
        '*'
      );
    },
    { passive: true }
  );

  // --- Handle pinned state from parent canvas ---
  window.addEventListener('message', function (e) {
    if (!e.data || e.data.type !== 'fc-pin-state') return;
    var pin = e.data.payload;
    window.__fcPinState = pin;

    if (pin.auth) {
      if (pin.auth.token) localStorage.setItem('fc-auth-token', pin.auth.token);
      if (pin.auth.username) localStorage.setItem('fc-auth-username', pin.auth.username);
      if (pin.auth.role) localStorage.setItem('fc-auth-role', pin.auth.role);
      localStorage.setItem('fc-auth-logged-in', String(pin.auth.isLoggedIn));
    }

    window.dispatchEvent(new CustomEvent('fc-pin-state', { detail: pin }));
  });

  // =============================================
  // DevTools: Console capture
  // =============================================

  var realLog = console.log;
  var realWarn = console.warn;
  var realError = console.error;
  var realInfo = console.info;
  var realDebug = console.debug;

  function safeStringify(arg) {
    try {
      if (typeof arg === 'string') return arg;
      if (arg instanceof Error) return arg.message + (arg.stack ? '\n' + arg.stack : '');
      return JSON.stringify(arg, null, 0)?.slice(0, 1024) ?? String(arg);
    } catch (_) {
      return String(arg);
    }
  }

  var consoleBuffer = [];
  var consoleFlushScheduled = false;

  function flushConsoleBuffer() {
    if (consoleBuffer.length === 0) return;
    var batch = consoleBuffer;
    consoleBuffer = [];
    consoleFlushScheduled = false;
    for (var i = 0; i < batch.length; i++) {
      window.parent.postMessage(batch[i], '*');
    }
  }

  function patchConsole(level, realFn) {
    console[level] = function () {
      realFn.apply(console, arguments);
      var args = [];
      for (var i = 0; i < arguments.length; i++) {
        args.push(safeStringify(arguments[i]));
      }
      consoleBuffer.push({
        type: 'fc-devtools-console',
        level: level,
        args: args,
        timestamp: Date.now(),
        route: originalPathname,
      });
      if (!consoleFlushScheduled) {
        consoleFlushScheduled = true;
        requestAnimationFrame(flushConsoleBuffer);
      }
    };
  }

  patchConsole('log', realLog);
  patchConsole('warn', realWarn);
  patchConsole('error', realError);
  patchConsole('info', realInfo);
  patchConsole('debug', realDebug);

  // =============================================
  // DevTools: Network capture (fetch)
  // =============================================

  var realFetch = window.fetch;
  var requestCounter = 0;

  window.fetch = function (input, init) {
    var id = 'fetch-' + (++requestCounter) + '-' + Date.now();
    var method = (init && init.method) || 'GET';
    var url = typeof input === 'string' ? input : (input && input.url ? input.url : String(input));
    var startTime = Date.now();

    var reqBody = null;
    try {
      reqBody = init && init.body ? String(init.body).slice(0, 2048) : null;
    } catch (_) {}

    window.parent.postMessage({
      type: 'fc-devtools-network',
      id: id, phase: 'request', method: method.toUpperCase(), url: url,
      requestBody: reqBody, route: originalPathname,
    }, '*');

    return realFetch.apply(window, arguments).then(function (response) {
      var clone = response.clone();
      var headers = {};
      try { response.headers.forEach(function (v, k) { headers[k] = v; }); } catch (_) {}

      clone.text().then(function (body) {
        window.parent.postMessage({
          type: 'fc-devtools-network',
          id: id, phase: 'response', method: method.toUpperCase(), url: url,
          status: response.status, statusText: response.statusText,
          duration: Date.now() - startTime,
          size: body.length,
          responseBody: body.slice(0, 2048),
          route: originalPathname,
        }, '*');
      }).catch(function () {});

      return response;
    }).catch(function (err) {
      window.parent.postMessage({
        type: 'fc-devtools-network',
        id: id, phase: 'error', method: method.toUpperCase(), url: url,
        error: err ? err.message : 'Unknown error',
        duration: Date.now() - startTime,
        route: originalPathname,
      }, '*');
      throw err;
    });
  };

  // =============================================
  // DevTools: Storage snapshot (on request)
  // =============================================

  window.addEventListener('message', function (e) {
    if (!e.data || e.data.type !== 'fc-devtools-request-storage') return;
    var ls = {}, ss = {};
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        ls[k] = localStorage.getItem(k);
      }
    } catch (_) {}
    try {
      for (var i = 0; i < sessionStorage.length; i++) {
        var k = sessionStorage.key(i);
        ss[k] = sessionStorage.getItem(k);
      }
    } catch (_) {}
    window.parent.postMessage({
      type: 'fc-devtools-storage',
      route: originalPathname,
      localStorage: ls,
      sessionStorage: ss,
      cookies: document.cookie || '',
    }, '*');
  });
})();
