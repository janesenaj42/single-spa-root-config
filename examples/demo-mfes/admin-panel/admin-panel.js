System.register([], function (exports) {
  let unsubscribe;
  let isOpen = false;

  function applyState(el) {
    el.classList.toggle('wh-drawer-open', isOpen);
  }

  return {
    execute: function () {
      exports({
        bootstrap: async () => {},
        mount: async (props) => {
          const el = props.domElementGetter();
          isOpen = false;

          el.innerHTML = `
            <style>
              #${el.id} { position: fixed; top: 0; right: 0; width: 25%; min-width: 280px; height: 100vh;
                background: #111827; color: #e5e7eb; box-shadow: -4px 0 16px rgba(0,0,0,0.4);
                transform: translateX(100%); transition: transform 200ms ease-out; z-index: 1000;
                font-family: sans-serif; box-sizing: border-box; padding: 20px; overflow-y: auto; }
              #${el.id}.wh-drawer-open { transform: translateX(0); }
              .wh-admin-row { display:flex; justify-content:space-between; align-items:center; margin:12px 0; }
              .wh-admin-btn { background:#2563eb; color:#fff; border:none; border-radius:4px; padding:8px 12px; cursor:pointer; }
              .wh-admin-close { background:none; border:none; color:#e5e7eb; font-size:20px; cursor:pointer; float:right; }
            </style>
            <button class="wh-admin-close" id="wh-admin-close" aria-label="Close admin panel">&times;</button>
            <h2>Warehouse Admin</h2>
            <div class="wh-admin-row">
              <label for="wh-maint-toggle">Maintenance mode</label>
              <input type="checkbox" id="wh-maint-toggle" />
            </div>
            <div class="wh-admin-row">
              <span>Location cache</span>
              <button class="wh-admin-btn" id="wh-flush-cache">Flush</button>
            </div>
            <div id="wh-flush-status" style="font-size:12px;color:#9ca3af;min-height:16px;"></div>
            <h3>System status</h3>
            <ul style="padding-left:18px;font-size:14px;line-height:1.8;">
              <li>Scanner network: <strong style="color:#22c55e;">online</strong></li>
              <li>Conveyor belt 3: <strong style="color:#f59e0b;">degraded</strong></li>
              <li>Cold storage: <strong style="color:#22c55e;">online</strong></li>
            </ul>
          `;

          applyState(el);

          el.querySelector('#wh-admin-close').addEventListener('click', () => {
            isOpen = false;
            applyState(el);
          });

          el.querySelector('#wh-flush-cache').addEventListener('click', () => {
            el.querySelector('#wh-flush-status').textContent = `Cache flushed at ${new Date().toLocaleTimeString()}`;
          });

          unsubscribe = props.subscribe('warehouse:admin-panel:toggle', () => {
            isOpen = !isOpen;
            applyState(el);
          });
        },
        unmount: async (props) => {
          if (unsubscribe) unsubscribe();
          props.domElementGetter().innerHTML = '';
        },
      });
    },
  };
});
