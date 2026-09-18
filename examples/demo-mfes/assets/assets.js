System.register([], function (exports) {
  function ensureAgGridLoaded() {
    if (window.agGrid) return Promise.resolve();
    if (window.__whAgGridLoading) return window.__whAgGridLoading;

    window.__whAgGridLoading = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/ag-grid-community/dist/ag-grid-community.min.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load ag-grid-community from CDN'));
      document.head.appendChild(script);
    });

    return window.__whAgGridLoading;
  }

  const CATEGORIES = ['Forklift', 'Pallet Jack', 'Conveyor', 'Scanner', 'Racking Unit'];
  const STATUSES = ['In Use', 'Idle', 'Maintenance'];

  function mockAssets() {
    const rows = [];
    for (let i = 1; i <= 24; i++) {
      rows.push({
        id: `AST-${String(i).padStart(4, '0')}`,
        name: `${CATEGORIES[i % CATEGORIES.length]} #${i}`,
        category: CATEGORIES[i % CATEGORIES.length],
        aisle: `A${(i % 6) + 1}`,
        status: STATUSES[i % STATUSES.length],
        lastChecked: new Date(Date.now() - i * 36e5).toISOString().slice(0, 10),
      });
    }
    return rows;
  }

  let gridApi;

  return {
    execute: function () {
      exports({
        bootstrap: async () => {},
        mount: async (props) => {
          const el = props.domElementGetter();
          // Full-screen takeover, not an in-flow content panel: covers the
          // navbar and basemap too, dismissed only via the close button
          // (or any other in-app navigation away from /assets).
          el.style.cssText =
            'position:fixed;inset:0;z-index:500;display:flex;flex-direction:column;background:#0b1220;font-family:sans-serif;';
          el.innerHTML = `
            <div style="display:flex;align-items:center;padding:16px;border-bottom:1px solid #1f2937;">
              <h1 style="color:#e2e8f0;margin:0;font-size:20px;flex:1;">Asset Management</h1>
              <a href="/" aria-label="Close" style="color:#e2e8f0;text-decoration:none;font-size:24px;line-height:1;padding:4px 10px;">&times;</a>
            </div>
            <div id="wh-assets-grid" style="flex:1;width:100%;"></div>
          `;

          await ensureAgGridLoaded();

          gridApi = window.agGrid.createGrid(el.querySelector('#wh-assets-grid'), {
            rowData: mockAssets(),
            columnDefs: [
              { field: 'id', headerName: 'Asset ID' },
              { field: 'name', headerName: 'Name', flex: 1 },
              { field: 'category', headerName: 'Category' },
              { field: 'aisle', headerName: 'Aisle' },
              { field: 'status', headerName: 'Status' },
              { field: 'lastChecked', headerName: 'Last Checked' },
            ],
            defaultColDef: { sortable: true, filter: true, resizable: true },
          });
        },
        unmount: async (props) => {
          if (gridApi) {
            gridApi.destroy();
            gridApi = undefined;
          }
          props.domElementGetter().innerHTML = '';
        },
      });
    },
  };
});
