/**
 * Mappd Injection Script
 * Injected into target app iframes to intercept navigation.
 * Each iframe should stay on its assigned route — navigation events
 * are forwarded to the parent canvas which pans to the correct node.
 */
(function () {
  if (window.self === window.top) return;

  // =============================================
  // React DevTools Hook — MUST run before React loads
  // Installs the global hook that React registers with.
  // This gives us access to overrideHookState for state injection.
  // =============================================

  if (!window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    var renderers = new Map();
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
      renderers: renderers,
      supportsFiber: true,
      inject: function (renderer) {
        var id = renderers.size + 1;
        renderers.set(id, renderer);
        return id;
      },
      onCommitFiberRoot: function () {},
      onCommitFiberUnmount: function () {},
      onPostCommitFiberRoot: function () {},
      onScheduleFibersWithFamiliesChanged: function () {},
    };
  }

  /**
   * Get the React renderer (for overrideHookState access).
   * Returns the first renderer that has overrideHookState.
   */
  function getRenderer() {
    var hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!hook || !hook.renderers) return null;
    var entries = hook.renderers;
    // Map.values() iterator
    if (typeof entries.values === 'function') {
      var iter = entries.values();
      var next = iter.next();
      while (!next.done) {
        if (next.value && typeof next.value.overrideHookState === 'function') {
          return next.value;
        }
        next = iter.next();
      }
    }
    return null;
  }

  /**
   * Find the React fiber root from the DOM.
   * React attaches fibers to DOM nodes via __reactFiber$ properties.
   */
  function getFiberRoot() {
    var root = document.getElementById('root') || document.getElementById('__next') || document.body.firstElementChild;
    if (!root) return null;
    // Find the __reactFiber$ key
    var keys = Object.keys(root);
    for (var i = 0; i < keys.length; i++) {
      if (keys[i].startsWith('__reactFiber$') || keys[i].startsWith('__reactInternalInstance$')) {
        return root[keys[i]];
      }
    }
    return null;
  }

  /**
   * Walk the fiber tree and find a fiber whose memoizedState chain
   * has a hook at the given index matching a specific value pattern.
   * Returns the fiber if found.
   */
  function findFiberWithHook(fiber, hookIndex) {
    if (!fiber) return null;

    // Check this fiber's hooks
    var state = fiber.memoizedState;
    var idx = 0;
    while (state) {
      if (idx === hookIndex && state.queue) {
        return fiber;
      }
      state = state.next;
      idx++;
    }

    // Recurse into children
    var child = fiber.child;
    while (child) {
      var found = findFiberWithHook(child, hookIndex);
      if (found) return found;
      child = child.sibling;
    }

    return null;
  }

  /**
   * Walk fibers to find one whose hook at hookIndex currently holds currentValue.
   * This is more precise than just matching hookIndex alone.
   */
  function findFiberByHookValue(fiber, hookIndex, currentValue) {
    if (!fiber) return null;

    var state = fiber.memoizedState;
    var idx = 0;
    while (state) {
      if (idx === hookIndex && state.queue) {
        var val = state.memoizedState;
        // For useReducer, the state might be an object
        if (val === currentValue) return fiber;
        if (typeof val === 'object' && val !== null && typeof currentValue === 'object' && currentValue !== null) {
          try {
            if (JSON.stringify(val) === JSON.stringify(currentValue)) return fiber;
          } catch (_) {}
        }
      }
      state = state.next;
      idx++;
    }

    var child = fiber.child;
    while (child) {
      var found = findFiberByHookValue(child, hookIndex, currentValue);
      if (found) return found;
      child = child.sibling;
    }

    return null;
  }

  // =============================================
  // Handle state override requests from parent canvas
  // =============================================

  window.addEventListener('message', function (e) {
    if (!e.data || e.data.type !== 'fc-override-state') return;

    var hookIndex = e.data.hookIndex;
    var newValue = e.data.value;
    var hookType = e.data.hookType; // 'useState' or 'useReducer'

    var renderer = getRenderer();
    if (!renderer || typeof renderer.overrideHookState !== 'function') {
      window.parent.postMessage({
        type: 'fc-override-state-result',
        success: false,
        error: 'React renderer not found or overrideHookState not available',
        route: originalPathname,
      }, '*');
      return;
    }

    // Find the fiber root
    var fiberRoot = getFiberRoot();
    if (!fiberRoot) {
      window.parent.postMessage({
        type: 'fc-override-state-result',
        success: false,
        error: 'Could not find React fiber root in DOM',
        route: originalPathname,
      }, '*');
      return;
    }

    // Walk up to the root fiber
    var root = fiberRoot;
    while (root.return) root = root.return;

    // Find the fiber with the matching hook
    var targetFiber = findFiberWithHook(root, hookIndex);

    if (!targetFiber) {
      window.parent.postMessage({
        type: 'fc-override-state-result',
        success: false,
        error: 'Could not find fiber with hook at index ' + hookIndex,
        route: originalPathname,
      }, '*');
      return;
    }

    try {
      // overrideHookState(fiber, hookIndex, path, value)
      // path is [] for direct replacement of the entire hook value
      renderer.overrideHookState(targetFiber, hookIndex, [], newValue);

      window.parent.postMessage({
        type: 'fc-override-state-result',
        success: true,
        route: originalPathname,
        hookIndex: hookIndex,
        value: newValue,
      }, '*');
    } catch (err) {
      window.parent.postMessage({
        type: 'fc-override-state-result',
        success: false,
        error: err ? err.message : 'Unknown error',
        route: originalPathname,
      }, '*');
    }
  });

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
