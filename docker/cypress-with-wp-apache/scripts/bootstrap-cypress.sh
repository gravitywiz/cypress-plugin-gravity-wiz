#!/usr/bin/env bash
echo "WordPress Version: $(wp core version)"
echo "WordPress Home URL: $(wp option get home)"

echo "Starting Cypress..."
cypress run --group "GF: ${GF_VERSION:-hotfix}" --record --parallel
