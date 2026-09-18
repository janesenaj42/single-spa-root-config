System.register([], function (exports) {
  let intervalId;
  const workers = [
    { id: 'w1', x: 20, y: 20 },
    { id: 'w2', x: 60, y: 40 },
    { id: 'w3', x: 100, y: 15 },
  ];

  function jitter(value, min, max, amount) {
    return Math.max(min, Math.min(max, value + (Math.random() - 0.5) * amount));
  }

  return {
    execute: function () {
      exports({
        bootstrap: async () => {},
        mount: async (props) => {
          const el = props.domElementGetter();
          const authed = props.isAuthenticated();
          const isAdmin = authed && props.hasAnyRole(['admin']);

          el.innerHTML = `
            <style>
              .wh-navbar { display:flex; align-items:center; gap:16px; background:#111827; color:#e5e7eb;
                padding:10px 16px; font-family:sans-serif; }
              .wh-brand { font-size:15px; letter-spacing:0.02em; }
              .wh-link { color:#93c5fd; text-decoration:none; }
              .wh-blueprint { border-radius:4px; }
              .wh-worker { transition: cx 1s ease-out, cy 1s ease-out; }
              .wh-spacer { flex:1; }
              .wh-btn { background:#1f2937; color:#e5e7eb; border:1px solid #374151; border-radius:4px;
                padding:6px 12px; cursor:pointer; }
              .wh-btn-primary { background:#2563eb; border-color:#2563eb; }
            </style>
            <nav class="wh-navbar">
              <strong class="wh-brand">Warehouse Ops</strong>
              <a class="wh-link" href="/assets">Assets</a>
              <svg class="wh-blueprint" viewBox="0 0 144 64" width="144" height="64" aria-label="Warehouse floor plan, worker locations">
                <rect x="1" y="1" width="142" height="62" fill="#0f172a" stroke="#334155" />
                <rect x="10" y="8" width="30" height="48" fill="none" stroke="#475569" />
                <rect x="50" y="8" width="30" height="48" fill="none" stroke="#475569" />
                <rect x="90" y="8" width="44" height="20" fill="none" stroke="#475569" />
                ${workers
                  .map((w) => `<circle class="wh-worker" data-id="${w.id}" cx="${w.x}" cy="${w.y}" r="3" fill="#22d3ee" />`)
                  .join('')}
              </svg>
              <span class="wh-spacer"></span>
              ${isAdmin ? '<button id="wh-admin-toggle" class="wh-btn">Admin</button>' : ''}
              <button id="wh-auth-btn" class="wh-btn wh-btn-primary">${authed ? 'Logout' : 'Login'}</button>
            </nav>
          `;

          el.querySelector('#wh-auth-btn').addEventListener('click', () => {
            if (authed) props.logout();
            else props.login();
          });

          const adminToggle = el.querySelector('#wh-admin-toggle');
          if (adminToggle) {
            adminToggle.addEventListener('click', () => props.publish('warehouse:admin-panel:toggle'));
          }

          intervalId = setInterval(() => {
            workers.forEach((w) => {
              w.x = jitter(w.x, 4, 140, 10);
              w.y = jitter(w.y, 4, 60, 8);
              const dot = el.querySelector(`circle[data-id="${w.id}"]`);
              if (dot) {
                dot.setAttribute('cx', w.x.toFixed(1));
                dot.setAttribute('cy', w.y.toFixed(1));
              }
            });
          }, 1200);
        },
        unmount: async (props) => {
          clearInterval(intervalId);
          props.domElementGetter().innerHTML = '';
        },
      });
    },
  };
});
