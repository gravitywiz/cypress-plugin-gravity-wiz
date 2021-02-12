#!/usr/bin/env bash
echo 'Downloading WordPress...'
wp core download

rm -rf /wordpress/wp-content/plugins
ln -s /plugins /wordpress/wp-content/plugins

# Make sure the database is up and running.
echo 'Waiting for the database...'
while ! mysqladmin ping -hmysql --silent; do
	echo '.'
	sleep 1
done

echo 'The database is ready.'

echo 'Configuring WordPress...'
wp core config --dbhost=mysql --dbname=wordpress --dbuser=wordpress --dbpass=wordpress --extra-php="define( 'SCRIPT_DEBUG', true );" --force

echo 'Installing WordPress...'
wp core install --url=localhost --title=tests --admin_user=admin --admin_password=admin --admin_email=test@test.com
wp rewrite structure '/%postname%/' --hard
echo "WordPress version: $(wp core version)"

echo "Installing Gravity Forms CLI..."
wp plugin install gravityformscli --force --activate

echo "Installing the --version ${GF_VERSION:-hotfix} of Gravity Forms"
wp gf install --key=${GF_KEY} --version=${GF_VERSION:-hotfix} --activate --force --quiet

echo "Gravity Forms installation complete."

echo "Verifying Gravity Forms checksums..."
wp gf tool verify-checksums
