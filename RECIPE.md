# Zype Tizen Recipe

This document outlines step-by-step instructions for creating and publishing a Samsung TV app powered by Zype's API service. 

## Requirements and Prerequisites

#### Tizen Studio with IDE installer

You will need Tizen Studio from Samsung in order to build and package your app. You can find it at: [https://developer.tizen.org/ko/development/tizen-studio/download](https://developer.tizen.org/ko/development/tizen-studio/download).

#### Samsung Seller Account

In order to publish apps on Samsung's marketplace you need to sign up for a Samsung Seller Account at: [http://seller.samsungapps.com/tv/portal/main](http://seller.samsungapps.com/tv/portal/main).


#### Technical Contact

IT or developer support strongly recommended. Creating the final app package requires working with the Terminal to sideload and package the app.


## Creating a New App with the SDK template

1. Clone or download this Github repo.

2. Rename the `configs/defaults.tmpl.js` file to `configs/defaults.js`. Then update the `appKey`, `clientId`, `clientSecret` and `rootPlaylistId`. 

3. Update the following in `config.xml`:

- The widget `id` should be your website.
- The name should be the display name of your app.
- The `< app name >` under the `tizen:application` id should be your app's name with no spaces.
- The `endpoint_URL` under `tizen:metadata` with the key `http://samsung.com/tv/metadata/use.preview` should be a link to your public JSON for the Preview Pane. For more information on the Preview Pane and it's the requirements, see: [http://developer.samsung.com/tv/develop/guides/smart-hub-preview](http://developer.samsung.com/tv/develop/guides/smart-hub-preview). The `action_data` sent is a `videoId` with the video id for the video on Zype.

#### Configuring Tizen Studio

4. In order to open your app, you will need to download a few packages using the _Package Manager_ in Tizen Studio. You will need to download the following packages:

- `Tizen SDK Tools` under the `Main SDK` tab
- `4.0 TV` under the `Main SDK` tab
- `TV Extensions Tools` under the `Extension SDK` tab
- `Samsung Certificate Extension` under the `Extension SDK` tab

Also you need to download _TV Extensions 3.0_ by adding another repo under _Configuration -> Extension SDK_:[http://sdf.samsungcloudcdn.com/Public/smart_tv_sdk/releases/samsung_tizen_studio_tv_sdk/stv_ext_public/3.0](http://sdf.samsungcloudcdn.com/Public/smart_tv_sdk/releases/samsung_tizen_studio_tv_sdk/stv_ext_public/3.0).

5. After you have downloaded the necessary packages in Tizen Studio, you can add the app to Tizen Studio by importing the app folder into your Tizen workspace. 

6. In order to package your app, [create your certificate in Tizen Studio using the Certificate Manager](https://developer.tizen.org/ko/development/tizen-studio/web-tools/managing-projects/certificate-registration). 

#### Building Signed Package

7. After you have your app loaded in Tizen Studio with your certificate create, you can right click the app folder in your _Project Explorer_ and click `Build Signed Package` to create your `.wgt` file. This `.wgt` file is your packaged app which you will upload when submitting to Samsung.
