// ============================================================
//  Physics Toast SDK — Zero-dependency Dynamic Island Toast
//  https://github.com/hiaaryan/sileo (inspired by)
// ============================================================

(function () {
  'use strict';

  // ============================================================
  //  Init: viewports + shared SVG filter
  // ============================================================
  const POSITIONS = [
    'top-left', 'top-center', 'top-right',
    'bottom-left', 'bottom-center', 'bottom-right',
  ];

  function init() {
    for (const pos of POSITIONS) {
      if (!document.querySelector(`[data-sileo-viewport][data-position="${pos}"]`)) {
        const div = document.createElement('div');
        div.setAttribute('data-sileo-viewport', '');
        div.setAttribute('data-position', pos);
        document.body.appendChild(div);
      }
    }

    if (!document.getElementById(FILTER_ID)) {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('aria-hidden', 'true');
      svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none;';
      svg.innerHTML = `<defs>
        <filter id="${FILTER_ID}" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">
          <feGaussianBlur in="SourceGraphic" stdDeviation="${BLUR}" result="blur"/>
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10" result="goo"/>
          <feComposite in="SourceGraphic" in2="goo" operator="atop"/>
        </filter>
      </defs>`;
      document.body.appendChild(svg);
    }

    document.body.appendChild(measureContainer);
  }

  // ============================================================
  //  1. Spring Physics Engine
  // ============================================================
  class Spring {
    constructor(value, config = {}) {
      this.current = value;
      this.target = value;
      this.velocity = 0;
      this.stiffness = config.stiffness ?? 170;
      this.damping = config.damping ?? 14;
      this.mass = config.mass ?? 1;
      this.precision = config.precision ?? 0.01;
    }

    set(target) {
      this.target = target;
    }

    tick(dt) {
      const steps = Math.ceil(dt / 0.004);
      const sub = dt / steps;

      for (let i = 0; i < steps; i++) {
        const displacement = this.current - this.target;
        const acceleration = (-this.stiffness * displacement - this.damping * this.velocity) / this.mass;
        this.velocity += acceleration * sub;
        this.current += this.velocity * sub;
      }

      const isSettled =
        Math.abs(this.velocity) < this.precision &&
        Math.abs(this.current - this.target) < this.precision;

      if (isSettled) {
        this.current = this.target;
        this.velocity = 0;
        return true;
      }

      return false;
    }
  }

  // ============================================================
  //  2. Spring Animator
  // ============================================================
  class SpringAnimator {
    constructor() {
      this.animations = new Map();
      this.running = false;
      this.lastTime = 0;
    }

    add(id, springs, apply, done) {
      this.animations.set(id, { springs, apply, done });
      if (!this.running) {
        this.running = true;
        this.lastTime = performance.now();
        this._loop();
      }
    }

    remove(id) {
      this.animations.delete(id);
    }

    _loop() {
      if (!this.animations.size) {
        this.running = false;
        return;
      }

      const now = performance.now();
      const dt = Math.min((now - this.lastTime) / 1000, 0.064);
      this.lastTime = now;

      const completed = [];

      for (const [id, anim] of this.animations) {
        let allSettled = true;
        for (const spring of Object.values(anim.springs)) {
          if (!spring.tick(dt)) {
            allSettled = false;
          }
        }
        anim.apply(anim.springs);
        if (allSettled) {
          completed.push(id);
          anim.done?.();
        }
      }

      for (const id of completed) {
        this.animations.delete(id);
      }

      requestAnimationFrame(() => this._loop());
    }
  }

  const animator = new SpringAnimator();

  // ============================================================
  //  3. Constants
  // ============================================================
  const HEIGHT = 40;
  const WIDTH = 350;
  const ROUNDNESS = 18;
  const BLUR = ROUNDNESS * 0.5;
  const PILL_PADDING = 10;
  const EXPAND_PILL_HEIGHT = HEIGHT + BLUR * 3;
  const FILTER_ID = 'sileo-gooey';
  const SPRING_CFG = { stiffness: 180, damping: 15, mass: 1 };
  const SPRING_SMOOTH = { stiffness: 150, damping: 20, mass: 1 };
  const HEADER_EXIT_MS = 300;
  const SWIPE_DISMISS = 30;
  const SWIPE_MAX = 20;

  // ============================================================
  //  4. Lucide Icons (16x16, viewBox 24x24, strokeWidth 2)
  // ============================================================
  const SVG_ATTRS = 'xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';

  const ICON = {
    success: `<svg ${SVG_ATTRS}><path d="M20 6 9 17l-5-5"/></svg>`,
    error: `<svg ${SVG_ATTRS}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
    warning: `<svg ${SVG_ATTRS}><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>`,
    info: `<svg ${SVG_ATTRS}><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/><path d="m14.83 9.17 4.24-4.24"/><path d="m14.83 14.83 4.24 4.24"/><path d="m9.17 14.83-4.24 4.24"/><circle cx="12" cy="12" r="4"/></svg>`,
    loading: `<svg ${SVG_ATTRS} data-sileo-icon="spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>`,
    action: `<svg ${SVG_ATTRS}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`,
  };

  // ============================================================
  //  5. Measurement
  // ============================================================
  const measureContainer = document.createElement('div');
  Object.assign(measureContainer.style, {
    position: 'absolute',
    visibility: 'hidden',
    pointerEvents: 'none',
    top: '-9999px',
    left: '-9999px',
    width: WIDTH + 'px',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
  });

  function measurePillWidth(title) {
    const el = document.createElement('div');
    el.style.cssText = 'display:inline-flex;align-items:center;gap:0.5rem;padding:0.5rem;white-space:nowrap;';
    el.innerHTML = `<span style="width:24px;height:24px;flex-shrink:0"></span><span style="font-size:0.825rem;font-weight:500">${title}</span>`;
    measureContainer.appendChild(el);
    const width = el.scrollWidth + PILL_PADDING;
    measureContainer.removeChild(el);
    return Math.max(width, HEIGHT);
  }

  function measureContentHeight(descriptionHtml) {
    const container = document.createElement('div');
    container.style.cssText = `position:absolute;visibility:hidden;pointer-events:none;top:-9999px;left:-9999px;width:${WIDTH}px;`;
    container.innerHTML = `<div style="padding:1rem;font-size:0.875rem;line-height:1.25rem">${descriptionHtml}</div>`;
    document.body.appendChild(container);
    const height = container.offsetHeight;
    document.body.removeChild(container);
    return height;
  }

  // ============================================================
  //  6. Toast Instance (hover pause + autopilot)
  // ============================================================
  let toastIdCounter = 0;
  const instances = new Map();

  function computeAutopilot(duration) {
    return {
      expandDelay: Math.max(Math.round(duration * 0.025), 100),
      collapseAt: Math.max(duration - 2000, duration * 0.5),
    };
  }

  class ToastInstance {
    constructor(id, el, opts) {
      this.id = id;
      this.el = el;
      this.opts = opts;
      this.timers = [];
      this.paused = false;
      this.dismissed = false;
    }

    addTimer(fn, delay) {
      const timer = { fn, delay, start: Date.now(), tid: null, fired: false };
      timer.tid = setTimeout(() => {
        timer.fired = true;
        fn();
      }, delay);
      this.timers.push(timer);
    }

    pause() {
      if (this.paused) return;
      this.paused = true;

      const now = Date.now();
      for (const timer of this.timers) {
        if (!timer.fired) {
          clearTimeout(timer.tid);
          timer.remaining = timer.delay - (now - timer.start);
        }
      }
    }

    resume() {
      if (!this.paused) return;
      this.paused = false;

      for (const timer of this.timers) {
        if (!timer.fired && timer.remaining > 0) {
          timer.start = Date.now();
          timer.delay = timer.remaining;
          timer.tid = setTimeout(() => {
            timer.fired = true;
            timer.fn();
          }, timer.remaining);
        }
      }
    }

    clearAll() {
      for (const timer of this.timers) {
        clearTimeout(timer.tid);
      }
      this.timers = [];
    }
  }

  // ============================================================
  //  7. Create Toast DOM
  // ============================================================
  function computePillX(align, pillWidth) {
    if (align === 'left') return 0;
    if (align === 'right') return WIDTH - pillWidth;
    return (WIDTH - pillWidth) / 2;
  }

  function createToast(id, state, title, description, buttonCfg, opts) {
    const pillW = measurePillWidth(title);
    const pillX = computePillX(opts.align, pillW);
    const edge = opts.position.startsWith('bottom') ? 'top' : 'bottom';
    const hasDesc = !!(description || buttonCfg);
    const svgH = hasDesc ? Math.max(HEIGHT * 2.25, HEIGHT + 80) : HEIGHT;

    const el = document.createElement('button');
    el.type = 'button';
    el.setAttribute('data-sileo-toast', '');
    el.setAttribute('data-state', state);
    el.setAttribute('data-edge', edge);
    el.setAttribute('role', 'status');
    el.setAttribute('aria-label', title + (description ? ': ' + description : ''));

    el.style.setProperty('--_h', HEIGHT + 'px');
    el.style.setProperty('--_pw', pillW + 'px');
    el.style.setProperty('--_px', pillX + 'px');
    el.style.setProperty('--_ht', 'translateY(0px) scale(1)');
    el.style.setProperty('--_co', '0');

    const btnHtml = buttonCfg
      ? `<a href="#" data-sileo-button onclick="event.preventDefault();event.stopPropagation();toast._onButton(${id})">${buttonCfg.title}</a>`
      : '';

    el.innerHTML = `
    <div data-sileo-canvas data-edge="${edge}" style="filter:url(#${FILTER_ID})">
      <svg data-sileo-svg width="${WIDTH}" height="${svgH}" viewBox="0 0 ${WIDTH} ${svgH}">
        <rect data-sileo-pill rx="${ROUNDNESS}" ry="${ROUNDNESS}" fill="#1c1c1e"
              x="${pillX}" y="0" width="${pillW}" height="${HEIGHT}"/>
        <rect data-sileo-body rx="${ROUNDNESS}" ry="${ROUNDNESS}" fill="#1c1c1e"
              x="0" y="${HEIGHT}" width="${WIDTH}" height="0" opacity="0"/>
      </svg>
    </div>
    <div data-sileo-header data-edge="${edge}">
      <div data-sileo-header-stack>
        <div data-sileo-header-inner data-layer="current">
          <div data-sileo-badge>${ICON[state] || ICON.success}</div>
          <span data-sileo-title>${title}</span>
        </div>
      </div>
    </div>
    ${hasDesc ? `
    <div data-sileo-content data-edge="${edge}">
      <div data-sileo-description>
        ${description || ''}
        ${btnHtml}
      </div>
    </div>` : ''}`;

    // Hover: pause timers + expand (loading state does not expand)
    el.addEventListener('mouseenter', () => {
      const inst = instances.get(id);
      if (!inst) return;
      inst.pause();
      const isLoading = el.getAttribute('data-state') === 'loading';
      if (!isLoading && inst._contentH && !inst.dismissed) {
        expand(inst);
      }
    });

    el.addEventListener('mouseleave', () => {
      const inst = instances.get(id);
      if (!inst) return;
      inst.resume();
      if (!inst.dismissed) {
        collapse(inst);
      }
    });

    // Swipe dismiss
    let pointerStartY = null;

    el.addEventListener('pointerdown', e => {
      if (e.target.closest('[data-sileo-button]')) return;
      pointerStartY = e.clientY;
      el.setPointerCapture(e.pointerId);
    });

    el.addEventListener('pointermove', e => {
      if (pointerStartY === null) return;
      const dy = e.clientY - pointerStartY;
      const sign = dy > 0 ? 1 : -1;
      const clamped = Math.min(Math.abs(dy), SWIPE_MAX) * sign;
      el.style.transform = `translateY(${clamped}px)`;
    });

    el.addEventListener('pointerup', e => {
      if (pointerStartY === null) return;
      const dy = e.clientY - pointerStartY;
      pointerStartY = null;
      el.style.transform = '';
      if (Math.abs(dy) > SWIPE_DISMISS) {
        dismissToast(id);
      }
    });

    return { el, hasDesc };
  }

  // ============================================================
  //  8. Spring-driven SVG morph (pill + body)
  // ============================================================
  function expand(inst) {
    const el = inst.el;
    const pill = el.querySelector('[data-sileo-pill]');
    const body = el.querySelector('[data-sileo-body]');
    const edge = el.getAttribute('data-edge');
    const edgeSign = edge === 'bottom' ? 1 : -1;

    if (!inst._contentH) return;
    const contentH = inst._contentH;
    const totalH = Math.max(HEIGHT * 2.25, HEIGHT + contentH);

    const svg = el.querySelector('[data-sileo-svg]');
    svg.setAttribute('height', totalH);
    svg.setAttribute('viewBox', `0 0 ${WIDTH} ${totalH}`);

    const springs = {
      pillH: new Spring(parseFloat(pill.getAttribute('height')), SPRING_CFG),
      bodyH: new Spring(parseFloat(body.getAttribute('height')), SPRING_CFG),
      bodyOp: new Spring(parseFloat(body.getAttribute('opacity')), SPRING_SMOOTH),
    };
    springs.pillH.set(EXPAND_PILL_HEIGHT);
    springs.bodyH.set(contentH);
    springs.bodyOp.set(1);

    animator.add('morph-' + inst.id, springs, s => {
      pill.setAttribute('height', s.pillH.current);
      body.setAttribute('height', Math.max(0, s.bodyH.current));
      body.setAttribute('opacity', s.bodyOp.current);
    });

    el.style.setProperty('--_h', totalH + 'px');
    el.style.setProperty('--_ht', `translateY(${3 * edgeSign}px) scale(0.9)`);
    el.style.setProperty('--_co', '1');
    el.querySelector('[data-sileo-content]')?.setAttribute('data-visible', 'true');
    el.setAttribute('data-expanded', 'true');
  }

  function collapse(inst) {
    const el = inst.el;
    const pill = el.querySelector('[data-sileo-pill]');
    const body = el.querySelector('[data-sileo-body]');

    const springs = {
      pillH: new Spring(parseFloat(pill.getAttribute('height')), SPRING_CFG),
      bodyH: new Spring(parseFloat(body.getAttribute('height')), SPRING_SMOOTH),
      bodyOp: new Spring(parseFloat(body.getAttribute('opacity')), SPRING_SMOOTH),
    };
    springs.pillH.set(HEIGHT);
    springs.bodyH.set(0);
    springs.bodyOp.set(0);

    animator.add('morph-' + inst.id, springs, s => {
      pill.setAttribute('height', s.pillH.current);
      body.setAttribute('height', Math.max(0, s.bodyH.current));
      body.setAttribute('opacity', s.bodyOp.current);
    });

    el.style.setProperty('--_h', HEIGHT + 'px');
    el.style.setProperty('--_ht', 'translateY(0px) scale(1)');
    el.style.setProperty('--_co', '0');
    el.querySelector('[data-sileo-content]')?.setAttribute('data-visible', 'false');
    el.setAttribute('data-expanded', 'false');
  }

  // ============================================================
  //  9. Crossfade Header
  // ============================================================
  function crossfadeHeader(inst, newState, newTitle, newDescription) {
    const el = inst.el;
    const headerStack = el.querySelector('[data-sileo-header-stack]');
    const currentInner = headerStack.querySelector('[data-sileo-header-inner][data-layer="current"]');
    const pill = el.querySelector('[data-sileo-pill]');

    // Clone current layer as the exiting "prev" layer
    const prev = currentInner.cloneNode(true);
    prev.setAttribute('data-layer', 'prev');
    prev.setAttribute('data-exiting', 'true');
    prev.removeAttribute('style');
    headerStack.appendChild(prev);

    // Update current layer with new state
    currentInner.querySelector('[data-sileo-badge]').innerHTML = ICON[newState] || ICON.success;
    currentInner.querySelector('[data-sileo-title]').textContent = newTitle;

    // Force re-animation
    currentInner.style.animation = 'none';
    currentInner.offsetHeight;
    currentInner.style.animation = '';

    // Update toast-level state (drives --_c color cascade)
    el.setAttribute('data-state', newState);
    el.setAttribute('aria-label', newTitle + (newDescription ? ': ' + newDescription : ''));

    setTimeout(() => prev.remove(), HEADER_EXIT_MS);

    // Animate pill width/position to match new title
    const newPillW = measurePillWidth(newTitle);
    const align = inst.opts.align || 'center';
    const newPillX = computePillX(align, newPillW);

    el.style.setProperty('--_pw', newPillW + 'px');
    el.style.setProperty('--_px', newPillX + 'px');

    const springs = {
      pillX: new Spring(parseFloat(pill.getAttribute('x')), SPRING_CFG),
      pillW: new Spring(parseFloat(pill.getAttribute('width')), SPRING_CFG),
    };
    springs.pillX.set(newPillX);
    springs.pillW.set(newPillW);

    animator.add('pill-resize-' + inst.id, springs, s => {
      pill.setAttribute('x', s.pillX.current);
      pill.setAttribute('width', s.pillW.current);
    });

    // If there is new description content, inject it and expand
    if (newDescription) {
      const edge = el.getAttribute('data-edge');
      let contentEl = el.querySelector('[data-sileo-content]');

      if (!contentEl) {
        contentEl = document.createElement('div');
        contentEl.setAttribute('data-sileo-content', '');
        contentEl.setAttribute('data-edge', edge);
        contentEl.innerHTML = `<div data-sileo-description>${newDescription}</div>`;
        el.appendChild(contentEl);
      } else {
        contentEl.querySelector('[data-sileo-description]').innerHTML = newDescription;
      }

      inst._contentH = measureContentHeight(newDescription);
      const svg = el.querySelector('[data-sileo-svg]');
      const totalH = Math.max(HEIGHT * 2.25, HEIGHT + inst._contentH);
      svg.setAttribute('height', totalH);
      svg.setAttribute('viewBox', `0 0 ${WIDTH} ${totalH}`);
      expand(inst);
    }
  }

  // ============================================================
  //  10. Dismiss
  // ============================================================
  function dismissToast(id) {
    const inst = instances.get(id);
    if (!inst || inst.dismissed) return;

    inst.dismissed = true;
    inst.clearAll();
    animator.remove('morph-' + id);
    animator.remove('pill-resize-' + id);

    const pos = inst.opts.position;
    if (activeByPosition[pos] === id) {
      delete activeByPosition[pos];
    }

    const el = inst.el;
    el.setAttribute('data-exiting', 'true');

    function onTransitionEnd() {
      el.remove();
      instances.delete(id);
    }

    el.addEventListener('transitionend', function handler(e) {
      if (e.propertyName === 'opacity' || e.propertyName === 'transform') {
        el.removeEventListener('transitionend', handler);
        onTransitionEnd();
      }
    });

    setTimeout(onTransitionEnd, 600);
  }

  // ============================================================
  //  11. Public API
  // ============================================================
  const DEFAULT_OPTS = { duration: 6000, position: 'top-center' };

  function deriveAlign(position) {
    if (position.endsWith('-left')) return 'left';
    if (position.endsWith('-right')) return 'right';
    return 'center';
  }

  const activeByPosition = {};

  const toast = {
    defaults: { ...DEFAULT_OPTS },
    _buttons: new Map(),

    _show(state, title, description, buttonCfg, userOpts = {}) {
      const opts = { ...this.defaults, ...userOpts };
      opts.align = opts.align || deriveAlign(opts.position);
      const pos = opts.position;
      const dur = opts.duration;

      const activeId = activeByPosition[pos];
      const activeInst = activeId != null ? instances.get(activeId) : null;

      if (activeInst && !activeInst.dismissed) {
        const inst = activeInst;

        if (buttonCfg) {
          this._buttons.set(inst.id, buttonCfg.onClick);
        }

        inst.clearAll();
        animator.remove('morph-' + inst.id);

        const isExpanded = inst.el.getAttribute('data-expanded') === 'true';
        const btnHtml = buttonCfg
          ? `<a href="#" data-sileo-button onclick="event.preventDefault();event.stopPropagation();toast._onButton(${inst.id})">${buttonCfg.title}</a>`
          : '';
        const fullDesc = description ? description + btnHtml : description;

        function performSwap() {
          crossfadeHeader(inst, state, title, fullDesc);

          if (dur > 0 && description) {
            const ap = computeAutopilot(dur);
            inst.addTimer(() => { if (!inst.dismissed) collapse(inst); }, ap.collapseAt);
            inst.addTimer(() => dismissToast(inst.id), dur);
          } else if (dur > 0) {
            inst.addTimer(() => dismissToast(inst.id), dur);
          }
        }

        if (isExpanded) {
          collapse(inst);
          setTimeout(performSwap, 250);
        } else {
          performSwap();
        }

        return inst.id;
      }

      const id = ++toastIdCounter;
      const { el, hasDesc } = createToast(id, state, title, description, buttonCfg, opts);
      const viewport = document.querySelector(`[data-sileo-viewport][data-position="${pos}"]`);

      if (buttonCfg) {
        this._buttons.set(id, buttonCfg.onClick);
      }

      viewport.appendChild(el);

      const inst = new ToastInstance(id, el, opts);
      instances.set(id, inst);
      activeByPosition[pos] = id;

      if (hasDesc) {
        const descHtml = (description || '') +
          (buttonCfg ? '<span style="display:flex;height:1.75rem;margin-top:0.75rem"></span>' : '');
        inst._contentH = measureContentHeight(descHtml);
      }

      requestAnimationFrame(() => {
        el.setAttribute('data-ready', 'true');
      });

      if (dur > 0 && hasDesc) {
        const ap = computeAutopilot(dur);
        inst.addTimer(() => { if (!inst.dismissed) expand(inst); }, ap.expandDelay);
        inst.addTimer(() => { if (!inst.dismissed) collapse(inst); }, ap.collapseAt);
        inst.addTimer(() => dismissToast(id), dur);
      } else if (dur > 0) {
        inst.addTimer(() => dismissToast(id), dur);
      }

      return id;
    },

    _onButton(id) {
      const callback = this._buttons.get(id);
      if (callback) callback();
    },

    success(title, description, opts) {
      return this._show('success', title, description, null, opts);
    },

    error(title, description, opts) {
      return this._show('error', title, description, null, opts);
    },

    warning(title, description, opts) {
      return this._show('warning', title, description, null, opts);
    },

    info(title, description, opts) {
      return this._show('info', title, description, null, opts);
    },

    promise(title, asyncFn, messages, opts) {
      const id = this._show('loading', title, null, null, { ...opts, duration: 0 });
      const inst = instances.get(id);

      function resolveWith(type, msg) {
        const resolvedTitle = typeof msg === 'string' ? msg : msg.title;
        const resolvedDesc = typeof msg === 'string' ? null : msg.description;
        crossfadeHeader(inst, type, resolvedTitle, resolvedDesc);

        const dismissDelay = resolvedDesc ? 4500 : 2500;
        if (resolvedDesc) {
          inst.addTimer(() => { if (!inst.dismissed) collapse(inst); }, dismissDelay - 1200);
        }
        inst.addTimer(() => dismissToast(id), dismissDelay);
      }

      asyncFn()
        .then(() => resolveWith('success', messages.success))
        .catch(() => resolveWith('error', messages.error));

      return id;
    },

    action(title, description, buttonTitle, buttonCallback, opts) {
      return this._show('action', title, description, { title: buttonTitle, onClick: buttonCallback }, opts);
    },

    dismiss(id) {
      dismissToast(id);
    },

    clear() {
      for (const [id] of instances) {
        dismissToast(id);
      }
    },
  };

  // Run init + expose
  if (document.body) {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }

  window.toast = toast;

})();
