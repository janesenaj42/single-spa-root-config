System.register([], function (exports) {
  return {
    execute: function () {
      exports({
        bootstrap: async () => {},
        mount: async (props) => {
          const el = props.domElementGetter();
          el.innerHTML = `
            <nav style="background:#222;color:#fff;padding:12px 16px;display:flex;gap:20px;font-family:sans-serif;">
              <strong>Root Config Demo</strong>
              <a href="/dashboard" style="color:#fff;">Dashboard</a>
              <a href="/settings" style="color:#fff;">Settings</a>
            </nav>
          `;
        },
        unmount: async (props) => {
          props.domElementGetter().innerHTML = '';
        },
      });
    },
  };
});
