# ApsaraVideo VOD demo

## Introduction
The goal of this demo is to demonstrate how to use
[ApsaraVideo VOD](https://www.alibabacloud.com/products/apsaravideo-for-vod) with a simple web application written
in Java.

## Prerequisites
The first step is to [create an Alibaba Cloud account](https://www.alibabacloud.com/help/doc-detail/50482.htm),
complete the [real-name authentication](https://www.alibabacloud.com/help/doc-detail/61062.htm) and
[create a RAM user](https://www.alibabacloud.com/help/doc-detail/57056.htm). The RAM user should have an access key
and the [AliyunVoDFullAccess policy](https://www.alibabacloud.com/help/doc-detail/57055.html#SystemPolicy) (note:
in this demo we use `AliyunVoDFullAccess` to make things simpler, but access rights can be further restricted).

Because we need to use CDNs, a domain is mandatory. We can either [buy one](https://www.alibabacloud.com/domain)
(such as "my-sample-domain.xyz") or [transfer it](https://www.alibabacloud.com/help/doc-detail/54077.htm). It is
technically possible to use another domain registrar, but to make things simpler this demo expects a domain
registered in Alibaba Cloud.

## Configuration
Let's start with the domain configuration:
* Go to the [VOD console](https://vod.console.aliyun.com/).
* In the left menu, click on "Domain Names".
* Click on the "Add Domain Name" button.
* Fill up the form with the following values:
    * *Domain Name:* domain name you want to use to upload and download videos. It should be something different
      from your website domain name. Example value: vod.my-sample-domain.xyz
    * *Origin type:* to keep it simple, select "OSS Domain Name" and keep the default bucket.
    * *Origin port:* in order to minimize configuration, select "80". This is the HTTP port. If you prefer HTTPS,
      select the port 443, but you will need to
      [configure HTTPS](https://www.alibabacloud.com/help/doc-detail/86093.htm).
    * *Acceleration Region:* select "Outside Mainland China" if you don't have a website in China (selecting
      "Mainland China" or "Global" requires you to obtain an [ICP license](https://www.alibabacloud.com/icp)).
* Submit the form and go back to the [Domain Names page](https://vod.console.aliyun.com/#/domain/list).
* Wait for few seconds and regularly refresh the page until your registered domain contains a value in the
  "CNAME" column (it should be something like "vod.my-sample-domain.xyz.w.kunlunsl.com"). Then copy this CNAME value
  into your clipboard.
* Go to the [domains console](https://dc.console.aliyun.com/next/index#/domain/list/all-domain).
* Click on the "Resolve" link next to your domain.
* Click on the "Add Record" button and fill-up the form with the following parameters:
    * *Type:* CNAME
    * *Host:* your sub-domain name, such as "vod".
    * *ISP Line:* Default
    * *Value:* paste the CNAME from your clipboard (e.g. "vod.my-sample-domain.xyz.w.kunlunsl.com")
    * *TTL:* 10 minutes
* Submit the form, then immediately click on the "Add Record" button again. Fill-up the form like above but with the
  following difference:
    * *ISP Line:* Outside Mainland China
* Submit the form and go back to the
  [Domain Names page of the VOD console](https://vod.console.aliyun.com/#/domain/list).
* Wait for few seconds and refresh the page regularly until the little "warning icon" next to the CNAME disappear.

Now that our domain is registered, let's configure transcoding templates:
* Go to the [Transcode page](https://vod.console.aliyun.com/#/settings/transcode/list).
* Select your region on the top menu bar.
* Click on the "Create Template" button.
* Set the "Template Name" to "multiple-sizes". The current displayed form should have "Low definition" in its
  "Basic Parameters / Definition".
* Click on the "+ Add Template" button and select "Standard Definition".
* Click on the "+ Add Template" button and select "High Definition".
* Click on the "+ Add Template" button and select "Ultra High Definition".
* Click on the "Save" button.
* Back to the [Transcode page](https://vod.console.aliyun.com/#/settings/transcode/list), we can see our
  "multiple-sizes" template group. Copy the value in the "ID" column (e.g. 46fdd77a0231241a5db0a105de540e81).

We can now configure the application. Open the file `src/main/resources/application.properties` and set the following
values:
```properties
# Apsara Video VOD
apsaraVideoVod.accessKeyId=Access key ID you got when you have created your RAM user.
apsaraVideoVod.accessKeySecret=Access key secret you got when you have created your RAM user.
apsaraVideoVod.regionId=Region of VOD service (e.g. ap-southeast-1).
apsaraVideoVod.templateGroupId=ID of your "multiple-sizes" template.
```
> Note: You can obtain the region ID from [this page](https://www.alibabacloud.com/help/doc-detail/40654.htm).

## Compilation
In order to compile this demo, you need to have [JDK 11+](https://adoptopenjdk.net/?variant=openjdk11&jvmVariant=hotspot)
and [Apache Maven 3.6+](https://maven.apache.org/download.cgi) on your machine.

Please open a terminal and enter the following commands:
```bash
# Navigate to this project directory
cd ~/projects/vod-demo

# Note: make sure you have configured src/main/resources/application.properties

# Compile and package the application
mvn clean package
```

If you want to run the application locally, run the following command:
```bash
# Run the application locally
mvn spring-boot:run
```
You can then open the page [http://localhost:8080](http://localhost:8080) in your web browser.

> Note: you will have [CORS issues](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing) because the web
> application domain ("localhost") is different from the one used for VOD
> (e.g. "vod.my-sample-domain.xyz"). A quick solution is to use a web browser add-on, such as
> [CORS Everywhere](https://addons.mozilla.org/en-US/firefox/addon/cors-everywhere/).

## Installation
TODO

## Credits
* [Spring Boot](https://spring.io/projects/spring-boot)
* [JQuery](https://jquery.com/)
* [JavaScript upload SDK](https://www.alibabacloud.com/help/doc-detail/51992.htm)
* [Web player SDK](https://www.alibabacloud.com/help/doc-detail/51991.htm)
