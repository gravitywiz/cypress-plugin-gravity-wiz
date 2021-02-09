# the WordPress container expects UID 33
sudo -E -u '#33' wp-cli --path=/wordpress "$@"
