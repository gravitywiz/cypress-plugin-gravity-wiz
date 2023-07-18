#!/usr/bin/env bash
bash /scripts/bootstrap-wp.sh
bash /scripts/bootstrap-apache.sh

echo "WordPress Version: $(wp core version)"
echo "WordPress Home URL: $(wp option get home)"

echo "Starting Cypress..."
unset DISPLAY && yarn cypress run --group "GF: ${GF_VERSION:-hotfix}" --record --parallel