System.register([], function (exports) {
  const CANNED_REPLIES = [
    'Got it, forwarding to dispatch.',
    'Standby, checking with the floor lead.',
    "Noted — I'll flag that in the next huddle.",
  ];

  return {
    execute: function () {
      exports({
        bootstrap: async () => {},
        mount: async (props) => {
          const el = props.domElementGetter();
          let open = false;
          let seq = 0;

          el.innerHTML = `
            <style>
              #${el.id} { position: fixed; bottom: 20px; left: 20px; z-index: 1000; font-family: sans-serif; }
              .wh-comms-fab { width:52px; height:52px; border-radius:50%; background:#2563eb; color:#fff;
                border:none; font-size:22px; cursor:pointer; box-shadow:0 4px 10px rgba(0,0,0,0.3); }
              .wh-comms-panel { position:absolute; bottom:64px; left:0; width:280px; height:340px;
                background:#111827; color:#e5e7eb; border-radius:8px; box-shadow:0 8px 24px rgba(0,0,0,0.4);
                display:none; flex-direction:column; overflow:hidden; }
              .wh-comms-panel.wh-comms-open { display:flex; }
              .wh-comms-header { padding:10px 12px; background:#1f2937; font-weight:bold; }
              .wh-comms-messages { flex:1; overflow-y:auto; padding:8px 12px; font-size:13px; }
              .wh-comms-msg { margin:6px 0; }
              .wh-comms-msg.me { color:#93c5fd; text-align:right; }
              .wh-comms-input-row { display:flex; border-top:1px solid #1f2937; }
              .wh-comms-input-row input { flex:1; background:#0b1220; color:#e5e7eb; border:none; padding:8px; }
              .wh-comms-input-row button { background:#2563eb; color:#fff; border:none; padding:0 12px; cursor:pointer; }
            </style>
            <div class="wh-comms-panel" id="wh-comms-panel">
              <div class="wh-comms-header">Comms</div>
              <div class="wh-comms-messages" id="wh-comms-messages"></div>
              <div class="wh-comms-input-row">
                <input id="wh-comms-input" placeholder="Message the floor..." />
                <button id="wh-comms-send">Send</button>
              </div>
            </div>
            <button class="wh-comms-fab" id="wh-comms-fab" aria-label="Open comms">&#128172;</button>
          `;

          const panel = el.querySelector('#wh-comms-panel');
          const messages = el.querySelector('#wh-comms-messages');
          const input = el.querySelector('#wh-comms-input');

          function addMessage(text, who) {
            const div = document.createElement('div');
            div.className = `wh-comms-msg ${who === 'me' ? 'me' : ''}`;
            div.textContent = text;
            messages.appendChild(div);
            messages.scrollTop = messages.scrollHeight;
          }

          el.querySelector('#wh-comms-fab').addEventListener('click', () => {
            open = !open;
            panel.classList.toggle('wh-comms-open', open);
          });

          function send() {
            const text = input.value.trim();
            if (!text) return;
            addMessage(text, 'me');
            input.value = '';
            const reply = CANNED_REPLIES[seq % CANNED_REPLIES.length];
            seq += 1;
            setTimeout(() => addMessage(reply, 'them'), 600);
          }

          el.querySelector('#wh-comms-send').addEventListener('click', send);
          input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') send();
          });
        },
        unmount: async (props) => {
          props.domElementGetter().innerHTML = '';
        },
      });
    },
  };
});
