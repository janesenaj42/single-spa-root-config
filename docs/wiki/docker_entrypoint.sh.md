# Infrastructure: docker/entrypoint.sh

# Infrastructure: docker/entrypoint.sh

**Type:** shell

## Overview

`docker/entrypoint.sh` is an infrastructure file (shell). Its behaviour is not derivable from structure, so the source is reproduced in full.




## Source

```shell
#!/bin/sh
set -e

echo "Generating MFE config from ${MFE_CONFIG_DIR}..."
node /app/scripts/build-mfe-config.js

echo "Generating Keycloak config..."
node /app/scripts/build-keycloak-config.js

echo "Starting nginx..."
exec nginx -g "daemon off;"

```

---

*Built from the code itself: parsed symbols, the import graph, git history and
the knowledge graph. Every statement here is checked against the source rather
than written about it.*