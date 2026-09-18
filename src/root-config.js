import { registerApplication, start } from 'single-spa';

async function bootstrap() {
  const res = await fetch('/mfes.json', { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to load /mfes.json: ${res.status} ${res.statusText}`);
  }
  const apps = await res.json();

  for (const app of apps) {
    registerApplication({
      name: app.name,
      app: () => System.import(app.entry),
      activeWhen: app.activeWhen,
      customProps: {
        domElementGetter: () => document.querySelector(app.container),
        ...app.customProps,
      },
    });
  }

  start();
}

bootstrap().catch((err) => {
  console.error('[root-config] failed to bootstrap applications', err);
});
