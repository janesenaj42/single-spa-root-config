System.register([], function (exports) {
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
                padding:10px 16px; font-family:sans-serif; position: relative; z-index: 10; }
              .wh-brand { font-size:15px; letter-spacing:0.02em; }
              .wh-link { color:#93c5fd; text-decoration:none; }
              .wh-spacer { flex:1; }
              .wh-btn { background:#1f2937; color:#e5e7eb; border:1px solid #374151; border-radius:4px;
                padding:6px 12px; cursor:pointer; }
              .wh-btn-primary { background:#2563eb; border-color:#2563eb; }
            </style>
            <nav class="wh-navbar">
              <strong class="wh-brand">Warehouse Ops</strong>
              <a class="wh-link" href="/assets">Assets</a>
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
        },
        unmount: async (props) => {
          props.domElementGetter().innerHTML = '';
        },
      });
    },
  };
});
