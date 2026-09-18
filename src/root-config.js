import { registerApplication, start } from 'single-spa';
import { initAuth, isAuthenticated, hasAnyRole, getToken, login, logout } from './auth';
import { isAppActive } from './routing';

async function bootstrap() {
  await initAuth();

  const res = await fetch('/mfes.json', { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to load /mfes.json: ${res.status} ${res.statusText}`);
  }
  const apps = await res.json();

  for (const app of apps) {
    registerApplication({
      name: app.name,
      app: () => System.import(app.entry),
      activeWhen: (location) => isAppActive(app, location.pathname, { isAuthenticated, hasAnyRole }),
      customProps: {
        domElementGetter: () => document.querySelector(app.container),
        isAuthenticated,
        getToken,
        login,
        logout,
        ...app.customProps,
      },
    });
  }

  start();
}

bootstrap().catch((err) => {
  console.error('[root-config] failed to bootstrap applications', err);
});
