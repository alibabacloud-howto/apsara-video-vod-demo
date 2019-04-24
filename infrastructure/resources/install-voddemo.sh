#!/usr/bin/env bash
#
# Installation script for the VOD demo.
#
# Parameters:
#     $1 - Access key ID of the RAM user with the AliyunVoDFullAccess policy.
#     $2 - Access key secret of the RAM user with the AliyunVoDFullAccess policy.
#     $3 - Region of the VOD service (e.g. ap-southeast-1).
#     $4 - ID of the 'multiple-sizes' template.
#

VOD_SERVICE_ACCESS_KEY_ID=$1
VOD_SERVICE_ACCESS_KEY_SECRET=$2
VOD_SERVICE_REGION_ID=$3
VOD_SERVICE_TEMPLATE_GROUP_ID=$4

# Update the Linux distribution
echo "Update the Linux distribution"
export DEBIAN_FRONTEND=noninteractive
apt-get -y update
apt-get -y upgrade

# Install JDK 11
echo "Install OpenJDK 11"
apt-get -y install software-properties-common
add-apt-repository -y ppa:openjdk-r/ppa
apt-get update
apt-get -y install openjdk-11-jre-headless

# Install Nginx
echo "Install Nginx"
apt-get -y install nginx

# Configure the VOD demo
echo "Configure the VOD demo"
ESCAPED_VOD_SERVICE_ACCESS_KEY_ID=$(echo ${VOD_SERVICE_ACCESS_KEY_ID} | sed -e 's/\\/\\\\/g; s/\//\\\//g; s/&/\\\&/g')
ESCAPED_VOD_SERVICE_ACCESS_KEY_SECRET=$(echo ${VOD_SERVICE_ACCESS_KEY_SECRET} | sed -e 's/\\/\\\\/g; s/\//\\\//g; s/&/\\\&/g')
ESCAPED_VOD_SERVICE_REGION_ID=$(echo ${VOD_SERVICE_REGION_ID} | sed -e 's/\\/\\\\/g; s/\//\\\//g; s/&/\\\&/g')
ESCAPED_VOD_SERVICE_TEMPLATE_GROUP_ID=$(echo ${VOD_SERVICE_TEMPLATE_GROUP_ID} | sed -e 's/\\/\\\\/g; s/\//\\\//g; s/&/\\\&/g')
sed -i "s/\(apsaraVideoVod\.accessKeyId=\).*\$/\1${ESCAPED_VOD_SERVICE_ACCESS_KEY_ID}/" /tmp/application.properties
sed -i "s/\(apsaraVideoVod\.accessKeySecret=\).*\$/\1${ESCAPED_VOD_SERVICE_ACCESS_KEY_SECRET}/" /tmp/application.properties
sed -i "s/\(apsaraVideoVod\.regionId=\).*\$/\1${ESCAPED_VOD_SERVICE_REGION_ID}/" /tmp/application.properties
sed -i "s/\(apsaraVideoVod\.templateGroupId=\).*\$/\1${ESCAPED_VOD_SERVICE_TEMPLATE_GROUP_ID}/" /tmp/application.properties
mkdir -p /etc/voddemo
mkdir -p /opt/voddemo
cp /tmp/application.properties /etc/voddemo/
cp /tmp/voddemo.jar /opt/voddemo/
cp /tmp/voddemo.service /etc/systemd/system/

# Configure Nginx
echo "Configure Nginx"
cp /tmp/nginx-voddemo.conf /etc/nginx/conf.d/voddemo.conf
rm /etc/nginx/sites-enabled/default

# Start and enable the demo and Nginx
echo "Start the VOD demo and Nginx"
systemctl start voddemo.service
systemctl enable voddemo.service
systemctl restart nginx
systemctl enable nginx
