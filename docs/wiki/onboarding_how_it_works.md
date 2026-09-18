# How It Works

# How It Works

Traced from the entry points outward: which files each run touches, in order. What happens at each hop is not derivable from the call graph, so this page shows the shape of execution rather than the behaviour.

## Shape`app` looks like a **module**, based on:

- no service / CLI / library signal — treating as module collection






## Traced flows




### From `src/root-config.js::bootstrap`



1. `src/root-config.js::bootstrap`

2. `src/routing.js::isAppActive`

3. `src/routing.js::matchesActiveWhen`

4. `src/routing.js::matchesPattern`






## Reading order

The guided tour walks these in sequence.

1. README.md. Start here for the end-to-end picture before diving into the code.
   - `README.md`


2. root-config.js. The walk's anchor — its imports fan out the widest in a repo with no single entry point.
   - `src/root-config.js`


3. containers.js. Directly imported by the anchor above; a core collaborator.
   - `src/containers.js`


4. eventBus.js. Directly imported by the anchor above; a core collaborator.
   - `src/eventBus.js`


5. routing.js. Directly imported by the anchor above; a core collaborator.
   - `src/routing.js`


6. auth.js. Directly imported by the anchor above; a core collaborator.
   - `src/auth.js`


7. build-keycloak-config.js. Off the import paths walked above — a standalone or supporting file.
   - `scripts/build-keycloak-config.js`


8. build-mfe-config.js. Off the import paths walked above — a standalone or supporting file.
   - `scripts/build-mfe-config.js`



---

*Built from the code's structure. It states what is there, not why it is that
way. The explanatory prose is a separate, model-written layer.*