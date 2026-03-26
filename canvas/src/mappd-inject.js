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
        if (window.location.pathname !== originalPathname) {
          realReplaceState(null, '', originalUrl);
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
    return realPushState.apply(history, arguments);
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
    return realReplaceState.apply(history, arguments);
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
})();
