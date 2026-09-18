System.register([], function (exports) {
  let intervalId;
  const workers = [
    { id: 'w1', x: 20, y: 20 },
    { id: 'w2', x: 60, y: 40 },
    { id: 'w3', x: 100, y: 15 },
    { id: 'w4', x: 115, y: 55 },
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

          el.innerHTML = `
            <style>
              #${el.id} { position: fixed; inset: 0; z-index: 0; background: #0b1220; }
              .wh-basemap-svg { width: 100%; height: 100%; }
              .wh-worker { transition: cx 1s ease-out, cy 1s ease-out; }
            </style>
            <svg class="wh-basemap-svg" viewBox="0 0 144 64" preserveAspectRatio="xMidYMid slice" aria-label="Warehouse floor plan, worker locations">
              <rect x="1" y="1" width="142" height="62" fill="#0f172a" stroke="#334155" />
              <rect x="10" y="8" width="30" height="48" fill="none" stroke="#475569" />
              <rect x="50" y="8" width="30" height="48" fill="none" stroke="#475569" />
              <rect x="90" y="8" width="44" height="20" fill="none" stroke="#475569" />
              ${workers
                .map((w) => `<circle class="wh-worker" data-id="${w.id}" cx="${w.x}" cy="${w.y}" r="1.6" fill="#22d3ee" />`)
                .join('')}
            </svg>
          `;

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
