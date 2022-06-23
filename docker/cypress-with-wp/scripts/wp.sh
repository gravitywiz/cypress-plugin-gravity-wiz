# the WordPress container expects UID 33
sudo -E -u 'www-data' wp-cli "$@"
