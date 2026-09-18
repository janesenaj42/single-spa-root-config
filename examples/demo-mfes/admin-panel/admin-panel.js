System.register([], function (exports) {
  return {
    execute: function () {
      exports({
        bootstrap: async () => {},
        mount: async (props) => {
          const el = props.domElementGetter();
          el.innerHTML = `<div style="padding:24px;font-family:sans-serif;"><h1>Settings MFE</h1><p>Registered from mfes/settings.yaml (theme: ${props.theme})</p></div>`;
        },
        unmount: async (props) => {
          props.domElementGetter().innerHTML = '';
        },
      });
    },
  };
});
