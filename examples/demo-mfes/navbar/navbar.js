System.register([], function (exports) {
  return {
    execute: function () {
      exports({
        bootstrap: async () => {},
        mount: async (props) => {
          const el = props.domElementGetter();
          const authed = props.isAuthenticated();
          el.innerHTML = `
            <nav style="background:#222;color:#fff;padding:12px 16px;display:flex;align-items:center;gap:20px;font-family:sans-serif;">
              <strong>Root Config Demo</strong>
              <a href="/dashboard" style="color:#fff;">Dashboard</a>
              <a href="/settings" style="color:#fff;">Settings</a>
              <button id="auth-btn" style="margin-left:auto;">${authed ? 'Logout' : 'Login'}</button>
            </nav>
          `;
          el.querySelector('#auth-btn').addEventListener('click', () => {
            authed ? props.logout() : props.login();
          });
        },
        unmount: async (props) => {
          props.domElementGetter().innerHTML = '';
        },
      });
    },
  };
});
