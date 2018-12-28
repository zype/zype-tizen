(function(exports){
  "use strict";

  var NativeMarket = function(){
    let _this = this;

    let webapisDefined = !(typeof webapis === "undefined");

    // requestProducts() requests the IAPs available for app
    //
    // Params:
    //   marketplaceSettings - object with marketplace settings(url, server env, secret key, app id)
    //   successCallback - function to call when request is successful
    //   errCallback - function to call when request fails
    this.requestProducts = (marketplaceSettings, successCallback, errCallback) => {
      try {
        let appId = marketplaceSettings.appId;
        let secret = marketplaceSettings.secret;
        let udid = webapis.sso.getLoginUid();
        let countryCode = webapis.productinfo.getSystemConfig(webapis.productinfo.ProductInfoConfigKey.CONFIG_KEY_SERVICE_COUNTRY);

        let reqParams = appId + countryCode;
        let hash = CryptoJS.HmacSHA256(reqParams, secret);
        let checkValue = CryptoJS.enc.Base64.stringify(hash);

        let detailObj = new Object();
        detailObj.AppID = appId;
        detailObj.CustomID = udid;
        detailObj.CountryCode = countryCode;
        detailObj.CheckValue = checkValue;

        let requestProductsParams = JSON.stringify(detailObj);
        $.ajax({
          url: marketplaceSettings.url + "/cont/list",
          type: "POST",
          dataType: "JSON",
          data: requestProductsParams,
          timeout:10000,
          success: function(res) {
            console.log("success : " + JSON.stringify(res));
            successCallback(res)
          },
          error: function(jqXHR, ajaxOptions, thrownError, request, error) {
            console.log("[Error] thrownError:"+thrownError+";error:"+error+";[Message]:"+jqXHR.responseText);
            errCallback(jqXHR);
          },
          complete:function() {
            console.log("complete");
          },
          failure:function() {
            console.log("failure");
          }
        });
      } catch (error) { console.log(error); }
    };

    // requestUserPurchases() requests products user has purchased
    //
    // Params:
    //   marketplaceSettings - object with marketplace settings(url, server env, secret key, app id)
    //   successCallback - function to call when request is successful
    //   errCallback - function to call when request fails
    this.requestUserPurchases = (marketplaceSettings, successCallback, errCallback) => {
      try {
        let appId = marketplaceSettings.appId;
        let secret = marketplaceSettings.secret;
        let udid = webapis.sso.getLoginUid();
        let countryCode = webapis.productinfo.getSystemConfig(webapis.productinfo.ProductInfoConfigKey.CONFIG_KEY_SERVICE_COUNTRY);
        let itemType = "2"; // request all product types
        let pageNum = 1;

        let reqParams = appId + udid + countryCode + itemType + pageNum;
        let hash = CryptoJS.HmacSHA256(reqParams, secret);
        let checkValue = CryptoJS.enc.Base64.stringify(hash);

        let detailObj = new Object();
        detailObj.AppID = appId;
        detailObj.CustomID = udid;
        detailObj.CountryCode = countryCode;
        detailObj.ItemType = itemType;
        detailObj.PageNumber = pageNum;
        detailObj.CheckValue = checkValue;

        let requestPurchasesParams = JSON.stringify(detailObj);
        $.ajax({
          url: marketplaceSettings.url + "/invoice/list",
          type: "POST",
          dataType: "JSON",
          data: requestPurchasesParams,
          timeout:10000,
          success: function(res) {
            console.log("success : " + JSON.stringify(res));
            successCallback(res)
          },
          error: function(jqXHR, ajaxOptions, thrownError, request, error) {
            console.log("[Error] thrownError:"+thrownError+";error:"+error+";[Message]:"+jqXHR.responseText);
            errCallback(jqXHR);
          },
          complete:function() {
            console.log("complete");
          },
          failure:function() {
            console.log("failure");
          }
        });
      } catch (error) { console.log(error); }
    };

    // findInvoice() looks through user invoices for invoice matching product id
    // - needed since Samsung Checkout doesn't return invoice ids in purchase response
    //
    // Params:
    //   marketplaceSettings - object with marketplace settings(url, server env, secret key, app id)
    //   productId - string of product id to find invoice for
    //   successCallback - function to call when request is successful
    //   errCallback - function to call when request fails
    this.findInvoice = (marketplaceSettings, productId, successCallback, errCallback) => {
      let userPurchasesCallback = res => {
        if (res.CPStatus == "100000" && res.ItemDetails.length > 0) {
          let invoice;
          for (let i = 0; i < res.ItemDetails.length; i++) {
            if (res.ItemDetails[i].ItemID) invoice = res.ItemDetails[i];
          }

          successCallback(invoice);
        } else {
          errCallback(null)
        }
      };
    };

    // verifyPurchase() requests products user has purchased
    //
    // Params:
    //   marketplaceSettings - object with marketplace settings(url, server env, secret key, app id)
    //   invoiceId - string of invoice id
    //   successCallback - function to call when request is successful
    //   errCallback - function to call when request fails
    this.verifyPurchase = (marketplaceSettings, invoiceId, successCallback, errCallback) => {
      try {
        let appId = marketplaceSettings.appId;
        let secret = marketplaceSettings.secret;
        let udid = webapis.sso.getLoginUid();
        let countryCode = webapis.productinfo.getSystemConfig(webapis.productinfo.ProductInfoConfigKey.CONFIG_KEY_SERVICE_COUNTRY);

        let detailObj = new Object();
        detailObj.AppID = appId;
        detailObj.InvoiceID = invoiceId,
        detailObj.CustomID = udid;
        detailObj.CountryCode = countryCode;

        let requestPurchasesParams = JSON.stringify(detailObj);
        $.ajax({
          url: marketplaceSettings.url + "/invoice/verify",
          type: "POST",
          dataType: "JSON",
          data: requestPurchasesParams,
          timeout:10000,
          success: function(res) {
            console.log("success : " + JSON.stringify(res));
            successCallback(res)
          },
          error: function(jqXHR, ajaxOptions, thrownError, request, error) {
            console.log("[Error] thrownError:"+thrownError+";error:"+error+";[Message]:"+jqXHR.responseText);
            errCallback(jqXHR);
          },
          complete:function() {
            console.log("complete");
          },
          failure:function() {
            console.log("failure");
          }
        });
      } catch (error) { console.log(error); }
    };

    // applyProduct() applys the product for the user Samsung Checkout account
    // - used in cases of network disconnect
    //
    // Params:
    //   marketplaceSettings - object with marketplace settings(url, server env, secret key, app id)
    //   invoiceId - string of invoice id
    //   successCallback - function to call when request is successful
    //   errCallback - function to call when request fails
    this.applyPurchase = (marketplaceSettings, invoiceId, successCallback, errCallback) => {
      try {
        let appId = marketplaceSettings.appId;
        let secret = marketplaceSettings.secret;
        let udid = webapis.sso.getLoginUid();
        let countryCode = webapis.productinfo.getSystemConfig(webapis.productinfo.ProductInfoConfigKey.CONFIG_KEY_SERVICE_COUNTRY);

        let detailObj = new Object();
        detailObj.AppID = appId;
        detailObj.InvoiceID = invoiceId,
        detailObj.CustomID = udid;
        detailObj.CountryCode = countryCode;

        let requestPurchasesParams = JSON.stringify(detailObj);
        $.ajax({
          url: marketplaceSettings.url + "/invoice/apply",
          type: "POST",
          dataType: "JSON",
          data: requestPurchasesParams,
          timeout:10000,
          success: function(res) {
            console.log("success : " + JSON.stringify(res));
            successCallback(res)
          },
          error: function(jqXHR, ajaxOptions, thrownError, request, error) {
            console.log("[Error] thrownError:"+thrownError+";error:"+error+";[Message]:"+jqXHR.responseText);
            errCallback(jqXHR);
          },
          complete:function() {
            console.log("complete");
          },
          failure:function() {
            console.log("failure");
          }
        });
      } catch (error) { console.log(error); }
    };

    // cancelSubscription() cancels the subscription
    //
    // Params:
    //   marketplaceSettings - object with marketplace settings(url, server env, secret key, app id)
    //   invoiceId - string of invoice id
    //   successCallback - function to call when request is successful
    //   errCallback - function to call when request fails
    this.cancelSubscription = (marketplaceSettings, invoiceId, successCallback, errCallback) => {
      try {
        let appId = marketplaceSettings.appId;
        let secret = marketplaceSettings.secret;
        let udid = webapis.sso.getLoginUid();
        let countryCode = webapis.productinfo.getSystemConfig(webapis.productinfo.ProductInfoConfigKey.CONFIG_KEY_SERVICE_COUNTRY);

        let detailObj = new Object();
        detailObj.AppID = appId;
        detailObj.InvoiceID = invoiceId,
        detailObj.CustomID = udid;
        detailObj.CountryCode = countryCode;

        let cancelSubParams = JSON.stringify(detailObj);
        $.ajax({
          url: marketplaceSettings.url + "/subscription/cancel",
          type: "POST",
          dataType: "JSON",
          data: cancelSubParams,
          timeout:10000,
          success: function(res) {
            console.log("success : " + JSON.stringify(res));
            successCallback(res)
          },
          error: function(jqXHR, ajaxOptions, thrownError, request, error) {
            console.log("[Error] thrownError:"+thrownError+";error:"+error+";[Message]:"+jqXHR.responseText);
            errCallback(jqXHR);
          },
          complete:function() {
            console.log("complete");
          },
          failure:function() {
            console.log("failure");
          }
        });
      } catch (error) { console.log(error); }
    };

    // purchaseItem() purchases an item
    //
    // Params:
    //   marketplaceSettings - object with marketplace settings(url, server env, secret key, app id)
    //   purchaseItem - object of item to be purchased. obtained from requestProducts()
    //   successCallback - function to call when request is successful
    //   errCallback - function to call when request fails
    this.purchaseItem = (marketplaceSettings, purchaseItem, successCallback, errCallback) => {
      try {
        let appId = marketplaceSettings.appId;
        let serverType = marketplaceSettings.serverType;
        let udid = webapis.sso.getLoginUid();

        let detailObj = new Object();
        detailObj.OrderItemID = purchaseItem.ItemID;
        detailObj.OrderTitle = purchaseItem.ItemTitle;
        detailObj.OrderTotal = purchaseItem.Price.toString();
        detailObj.OrderCurrencyID = purchaseItem.CurrencyID;
        detailObj.OrderCustomID = udid;

        let purchaseItemDetails = JSON.stringify(detailObj);
        webapis.billing.buyItem(appId, serverType, purchaseItemDetails,
          function(data) {
            console.log("success purchaseItem()");
            successCallback(data);
          },
          function(err) {
            console.log("error purchaseItem()");
            successCallback(err);
          }
        );
      } catch (error) { console.log(error); }
    };

    // callReceiptValidator() calls receipt validator to validate transaction
    //
    // Params:
    //   transactionInfo - object with info on transaction (app, site, consumer, subscription plan)
    //   invoice - object of invoice for purchase (Samsung app id, invoice id, custom id/udid, country code)
    //   successCallback - function to call when request is successful
    //   errCallback - function to call when request fails
    this.callReceiptValidator = (transactionInfo, invoice, successCallback, errCallback) => {
      let validatorEndpoint = "https://mkt.zype.com/v1/samsung_tizen/";

      let validationData = {
        "app_id": transactionInfo.appId,
        "site_id": transactionInfo.siteId,
        "consumer_id": transactionInfo.consumerId,
        "plan_id": transactionInfo.planId,
        "receipt": {
          "AppID": receipt.appId,
          "InvoiceID": receipt.invoiceId,
          "CustomID": receipt.udid,
          "CountryCode": receipt.countryCode
        }
      };
      let validatorParams = JSON.stringify(validationData);

      console.log("POST " + validatorEndpoint + "\n" + validatorParams);
      $.ajax({
        url: validatorEndpoint,
        type: "POST",
        dataType: "JSON",
        data: validationData,
        timeout:10000,
        success: function(res) {
          console.log("success : " + JSON.stringify(res));
          successCallback(res)
        },
        error: function(jqXHR, ajaxOptions, thrownError, request, error) {
          console.log("[Error] thrownError:"+thrownError+";error:"+error+";[Message]:"+jqXHR.responseText);
          errCallback(jqXHR);
        },
        complete:function() {
          console.log("complete");
        },
        failure:function() {
          console.log("failure");
        }
      });
    };

    // purchaseAndGetInvoice() purchase an item then find the invoice
    //
    // Params:
    //   marketplaceSettings - object with marketplace settings(url, server env, secret key, app id)
    //   purchaseItem - object of item to be purchased. obtained from requestProducts()
    //   successCallback - function to call when request is successful
    //   errCallback - function to call when request fails
    this.purchaseAndGetInvoice = (marketplaceSettings, purchaseItem, successCallback, errCallback) => {
      try {
        let fetchInvoiceCallback = item => {
          let productId = item.ItemID;
          let invoiceFoundCallback = invoice => {
            successCallback(invoice);
          };
          let invoiceMissingCallback = err => {
            errCallback(null)
          };

          this.findInvoice(marketplaceSettings, productId, invoiceFoundCallback, invoiceMissingCallback);
        };

        // if purchase succeeds, find invoice and returning invoice or null
        this.purchaseItem(marketplaceSettings, purchaseItem, fetchInvoiceCallback, errCallback);

      } catch(error) {console.log(error)}
    };

  }; // end of NativeMarket

  exports.NativeMarket = new NativeMarket();
})(window);