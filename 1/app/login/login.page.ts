import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { StorageService } from '../storage.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoadingController, PopoverController } from '@ionic/angular';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { UniqueDeviceID } from '@ionic-native/unique-device-id/ngx';
import { FCM } from 'cordova-plugin-fcm-with-dependecy-updated/ionic/ngx';

import { LanguagePopoverPage } from '../language-popover/language-popover.page';
import { LanguageService } from '../language.service';
import { TranslateService } from '@ngx-translate/core';
import { Platform } from '@ionic/angular';

declare var google;

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})

export class LoginPage {

  //#region Declaration
  loginform: FormGroup;
  global_baseurl: any;
  response: any;
  emailPattern: any;
  selectedIndex: boolean = true;
  passwordType: string = 'password';
  passwordIcon: string = 'eye-off';
  googletrans: any;
  empDetailsFrmWelcomePage: any;
  empId: any;
  loaderToShow: any;
  fcmToken: any;
  empIdVal: string;
  pwdVal: string;
  //#endregion

  //#region Constructor
  constructor(public formbuilder: FormBuilder, public router: Router, public storageservice: StorageService,
    private http: HttpClient, private route: ActivatedRoute, public loadingCtrl: LoadingController,
    private nativeStorage: NativeStorage, private uniqueDeviceID: UniqueDeviceID,
    private fcm: FCM, private popoverController: PopoverController, private languageService: LanguageService,
    private translate: TranslateService, private platform: Platform) {
 
    if (!this.languageService.selectedLang) {
      this.languageService.setInitialAppLanguage();
    }

    this.platform.ready().then(() => {
      if (this.platform.is("cordova")) {
        this.fcm.requestPushPermission();
      }
    });

    this.loginform = formbuilder.group({
      password: ['', Validators.compose([Validators.maxLength(20), Validators.required])],
      empId: ['', Validators.compose([Validators.maxLength(50), Validators.required])],
    });
    this.fcmToken = localStorage.getItem("FCMToken");
    console.log("login page", this.fcmToken);
    console.log("inise");
    this.nativeStorage.getItem('FCMToken')
      .then(
        data => {
          console.log("inside fcm storage", data);
        });


    //#region Call native storage to get existing values
    var IsNativeStorageCalled: boolean = false;

    //#region Load employee id from the welcome page.
    this.route.queryParams.subscribe(params => {
      if (params) {
        this.empDetailsFrmWelcomePage = params;

        if (this.empDetailsFrmWelcomePage != null && this.empDetailsFrmWelcomePage.empId != null) {
          this.empIdVal = this.empDetailsFrmWelcomePage.empId;
          this.pwdVal = "";
        }
        else {
          if (!IsNativeStorageCalled) {
            IsNativeStorageCalled = true;
            this.GetNativeStorageValues();
          }
        }
      }
      else {
        if (!IsNativeStorageCalled) {
          IsNativeStorageCalled = true;
          this.GetNativeStorageValues();
        }
      }
    });
    //#endregion

    if (!IsNativeStorageCalled) {
      IsNativeStorageCalled = true;
      this.GetNativeStorageValues();
    }
    //#endregion

  }
  //#endregion

  //#region Commented lines
  /*  googleTranslateElementInit() {
      new google.translate.TranslateElement({ pageLanguage: 'en', includedLanguages: "en,ta,es,te" }, 'google_translate_element'); 
     
    } */
  //#endregion

  //#region OnInit
  ngOnInit() {
    /*  this.googletrans= new google.translate.TranslateElement({
     pageLanguage: 'en', 
     includedLanguages: "en,ta,hi,te" }, 'google_translate_element');   */
  }
  //#endregion

  //#region Click Events
  hideShowPassword() {
    this.passwordType = this.passwordType === 'text' ? 'password' : 'text';
    this.passwordIcon = this.passwordIcon === 'eye-off' ? 'eye' : 'eye-off';
  }

  login_click() {

    // Show Loading indicator
    // this.showLoadingIndicator();

    this.global_baseurl = this.storageservice.getbaseusrl();
    let email_get = this.loginform.controls['empId'].value;
    let password_get = this.loginform.controls['password'].value;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      //'Access-Control-Allow-Origin': '*',
      //'Authorization': 'Bearer ' + user_token
    });

    var logInServiceUrl = "/app/mobileApp/mobilelogin";
    var postData = {
      'username': email_get,
      'password': password_get
    }
    //this.storageservice.showLoadingIndicator();
    this.showLoadingIndicator();
    this.storageservice.postrequest(logInServiceUrl, postData).subscribe(result => {
      this.hideLoadingIndicator();
      //this.storageservice.hideLoadingIndicator();
      this.response = result;
      console.log(this.response);

      let message = result['message'];
      console.log(message);

      if (result["success"] == true) {
        // this.hideLoadingIndicator() //Hide loading indicator

        this.storageservice.successToast(message)

        //userDetail
        var data = result["userDetail"];

        //#region To store in local storage
        var userIdStr = data["userId"];

        //localStorage.clear();
        localStorage.setItem('userId', data["userId"]);
        localStorage.setItem('userName', data["username"]);
        localStorage.setItem('creditPoints', data["creditPoints"]);
        localStorage.setItem('empId', data["empId"]);
        localStorage.setItem('email', data["email"]);
        localStorage.setItem('isloggedIn', "true");

        localStorage.setItem('isloggedIn', "true");

        localStorage.setItem('userRefFlag', data["userRefFlag"]);
        localStorage.setItem('categoryflag', data["categoryflag"]);

        console.log("empId: " + data["empId"])
        console.log("creditPoints: " + data["creditPoints"])
        console.log("userName: " + data["username"])
        console.log("userId: " + data["userId"])
        //#endregion

        //#region NativeStorage
        localStorage.setItem('TC_Id', email_get);
        localStorage.setItem('TC_Pwd', password_get);
        var postDataLD = {
          "TC_Id": email_get,
          "TC_Pwd": password_get
        }
        this.nativeStorage.setItem('LoginDetails', postDataLD)
          .then(
            () => {
              console.log(`Storing data: ${JSON.stringify(postDataLD)}`);
              // this.hideLoadingIndicator() //Hide loading indicator
            },
            error => console.error('Error storing item', error)
          );

        //#endregion

        //#region Publish IsIndividual
        if (data["userRefFlag"] != null) {
          if (data["userRefFlag"] == "IU") {
            this.storageservice.publishSomeData({ IsIndividual: true, IsStudentOnly: true });
          }
          else {
            this.storageservice.publishSomeData({ IsIndividual: false, IsStudentOnly: true });
          }
        }
        //#endregion

        //To get "Is student only" values.
        this.Get_IsStudentOnly_Details();
        //End

        let navigationExtras: NavigationExtras = {
          queryParams: {
            IsFromLoginForm: true
          }
        };
        // this.hideLoadingIndicator() //Hide loading indicator

        console.log("CategoryFlag: " + data["categoryflag"])
        if (data != null && data["categoryflag"] && data["userRefFlag"] == "IU") {
          this.router.navigate(['/user-type-chooser'], navigationExtras)
        }
        else {
          if (data["userRefFlag"] == "IU") {
            //this.router.navigate(['/profile-individual'])
            this.router.navigate(['/dashboard-individual'], navigationExtras)
          }
          else if (data["userRefFlag"] == "OU") {
            // this.router.navigate(['/profile-corporate'])
            this.router.navigate(['/dashboard-corporate'], navigationExtras)
          }
          else if (data["userRefFlag"] == "GU") {
            // this.router.navigate(['/profile-institution'])
            this.router.navigate(['/dashboard-institution'], navigationExtras)
          }
          else {
            this.router.navigate(['/yettostart'])
          }
        }

        //#region Hold for 3 second and save FCMToken & UUID
        console.log("Before hold 3sec");
        this.showLoadingIndicator();
        let hideFooterTimeout = setTimeout(() => {

          console.log("Inside timeout");
          this.hideLoadingIndicator()
          this.SaveFCMTokenAndUUID(userIdStr);
          console.log("SaveFCMTokenAndUUID 1");

          var locfcmToken = localStorage.getItem("FCMToken");
          console.log("locfcmToken: " + locfcmToken);
          if (locfcmToken == null) {
            this.fcm.getToken().then(token => {
              console.log("FCM token123", token);
              this.nativeStorage.setItem('FCMToken', token)
              localStorage.setItem('FCMToken', token);

              this.SaveFCMTokenAndUUID(userIdStr);
              console.log("SaveFCMTokenAndUUID 2");
            });
          }

          // Save UUID

        }, 3000);
        console.log("After hold 3sec");
        //#endregion

        //Commented here, added to the above.
        //#region Save UUID
        // console.log("Before1");
        // // var uuidStr = "";
        // this.uniqueDeviceID.get().then((uuid: any) => {
        //   console.log("UUID: " + uuid);
        //   var uuidStr = uuid;

        //   console.log("Inside 2" + uuidStr);

        //   var updateGcmtokenURL = "/app/mobileApp/updateGcmtoken";
        //   this.fcmToken = localStorage.getItem("FCMToken");
        //   console.log("login page123", this.fcmToken);
        //   var postDataGCM = {
        //     "gcmToken": this.fcmToken,
        //     "uuid": uuidStr,
        //     "userId": userIdStr
        //   }
        //   console.log(`postDataGCM2: ${JSON.stringify(postDataGCM)}`);
        //   console.log("URL2: " + updateGcmtokenURL);
        //   this.storageservice.postrequest(updateGcmtokenURL, postDataGCM).subscribe(result => {
        //     console.log("updateGcmtoken result2: " + result["success"]);
        //   });

        // })
        //   .catch((error: any) => console.log(error));

        // console.log("Before2");

        //Backup code
        // var updateGcmtokenURL = "/app/mobileApp/updateGcmtoken";
        // var postDataGCM = {
        //         "gcmToken": "",
        //         "uuid": uuidStr,
        //         "userId": userIdStr
        // }
        // console.log(`postDataGCM: ${JSON.stringify(postDataGCM)}`);
        // console.log("URL: " + updateGcmtokenURL);
        // this.storageservice.postrequest(updateGcmtokenURL, postDataGCM).subscribe(result => {
        //     console.log("updateGcmtoken result: " + result["success"]);
        // });
        //#endregion

      }
      else {
        // this.hideLoadingIndicator() //Hide loading indicator

        this.storageservice.warningToast(message)
      }
    },
      error => {
        this.hideLoadingIndicator();
        //this.storageservice.hideLoadingIndicator();
        console.log(`Error data: ${JSON.stringify(error)}`);
        if (error.name == "HttpErrorResponse") {
          this.storageservice.warningToast('Internet connection problem, Pls check your internet.');
        }
        else {
          this.storageservice.warningToast('Error: ' + error.message);
        }
      },
      () => {
        // 'onCompleted' callback.
        // No errors, route to new page here

        //#region Check latest application version and give alert to user
        // this.checkLatestMobileAppVersionAndGiveAlert();
        //#endregion
      }

    );

    // this.hideLoadingIndicator() //Hide loading indicator
  }

  SaveFCMTokenAndUUID(userIdStr: string) {
    console.log("Before1");
    // var uuidStr = "";
    // this.uniqueDeviceID.get().then((uuid: any) => {
    //   console.log("UUID: " + uuid);
    var uuidStr = "";//uuid;

    console.log("Inside 2" + uuidStr);

    var updateGcmtokenURL = "/app/mobileApp/updateGcmtoken";
    this.fcmToken = localStorage.getItem("FCMToken");
    console.log("login page123", this.fcmToken);
    var postDataGCM = {
      "gcmToken": this.fcmToken,
      "uuid": uuidStr,
      "userId": userIdStr
    }
    console.log(`postDataGCM2: ${JSON.stringify(postDataGCM)}`);
    console.log("URL2: " + updateGcmtokenURL);
    this.storageservice.postrequest(updateGcmtokenURL, postDataGCM).subscribe(result => {
      console.log("updateGcmtoken result2: " + result["success"]);
    });

    // })
    //   .catch((error: any) => console.log(error));

    console.log("Before2");
  }

  GetNativeStorageValues() {
    console.log("OnInit1");
    var IsNativeStorage: boolean = false;
    this.nativeStorage.getItem('LoginDetails')
      .then(
        data => {
          console.log(`Getting NS data: ${JSON.stringify(data)}`);
          console.log("Before IF");
          if (data["TC_Id"] != null) {
            console.log("Inside IF, Id: " + data["TC_Id"]);
            var employeeIdVal = data["TC_Id"];
            var passwordVal = data["TC_Pwd"];
            IsNativeStorage = true;

            // this.ByPassLogin(employeeIdVal, passwordVal); //To login user automatically.
          }
        },
        error => console.error("My item error: " + error)
      );

    var idobj = localStorage.getItem("TC_Id");
    var pwdObj = localStorage.getItem("TC_Pwd");
    if (idobj != null && pwdObj != null && !IsNativeStorage) {
      localStorage.setItem('TC_Id', idobj);
      localStorage.setItem('TC_Pwd', pwdObj);

      // this.ByPassLogin(idobj, pwdObj); //To login user automatically.
    }

    console.log("OnInit2");
  }

  ByPassLogin(empIdValue: string, pwdValue: string) {

    // Show Loading indicator
    // this.showLoadingIndicator()

    var logInServiceUrl = "/app/mobileApp/mobilelogin";
    var postData = {
      'username': empIdValue,
      'password': pwdValue,
    }

    this.storageservice.postrequest(logInServiceUrl, postData).subscribe(result => {
      this.response = result;
      console.log(this.response);

      let message = result['message'];
      console.log(message);

      // this.hideLoadingIndicator() //Hide loading indicator

      if (result["success"] == true) {
        // this.hideLoadingIndicator() //Hide loading indicator

        // this.storageservice.successToast(message);

        //userDetail
        var data = result["userDetail"];
        //To store in local storage
        //localStorage.clear();
        localStorage.setItem('userId', data["userId"]);
        localStorage.setItem('userName', data["username"]);
        localStorage.setItem('creditPoints', data["creditPoints"]);
        localStorage.setItem('empId', data["empId"]);
        localStorage.setItem('email', data["email"]);

        localStorage.setItem('userRefFlag', data["userRefFlag"]);

        console.log("empId: " + data["empId"])
        console.log("creditPoints: " + data["creditPoints"])
        console.log("userName: " + data["username"])
        console.log("userId: " + data["userId"])
        //End

        //#region NativeStorage
        localStorage.setItem("TC_Id", empIdValue);
        localStorage.setItem("TC_Pwd", pwdValue);
        var postDataLD = {
          "TC_Id": empIdValue,
          "TC_Pwd": pwdValue
        }
        this.nativeStorage.setItem('LoginDetails', postDataLD)
          .then(
            () => {
              console.log(`Storing data: ${JSON.stringify(postDataLD)}`);
              // this.hideLoadingIndicator() //Hide loading indicator
            },
            error => console.error('Error storing item', error)
          );
        //#endregion

        //Publish IsIndividual
        if (data["userRefFlag"] != null) {
          if (data["userRefFlag"] == "IU") {
            this.storageservice.publishSomeData({ IsIndividual: true, IsStudentOnly: true });
          }
          else {
            this.storageservice.publishSomeData({ IsIndividual: false, IsStudentOnly: true });
          }
        }
        //End

        //To get "Is student only" values.
        this.Get_IsStudentOnly_Details();
        //End

        let navigationExtras: NavigationExtras = {
          queryParams: {
            IsFromLoginForm: true
          }
        };
        console.log("CategoryFlag: " + data["categoryflag"])
        if (data != null && data["categoryflag"] && data["userRefFlag"] == "IU") {
          this.router.navigate(['/user-type-chooser'], navigationExtras)
        }
        else {
          if (data["userRefFlag"] == "IU") {
            //this.router.navigate(['/profile-individual'])
            this.router.navigate(['/dashboard-individual'])
          }
          else if (data["userRefFlag"] == "OU") {
            //this.router.navigate(['/profile-corporate'])
            this.router.navigate(['/dashboard-corporate'])
          }
          else if (data["userRefFlag"] == "GU") {
            //this.router.navigate(['/profile-institution'])
            this.router.navigate(['/dashboard-institution'])
          }
          else {
            this.router.navigate(['/yettostart'])
          }
        }
      }
      else {
        // this.hideLoadingIndicator() //Hide loading indicator

        this.storageservice.warningToast(message)
      }
    },
      error => {
        console.log(`Error data: ${JSON.stringify(error)}`);
        if (error.name == "HttpErrorResponse") {
          this.storageservice.warningToast('Internet connection problem, Pls check your internet.');
          this.storageservice.GeneralAlert('HttpErrorResponse', 'Internet connection problem, Pls check your internet.');
        }
        else {
          this.storageservice.warningToast('Error: ' + error.message);
        }
      },
      () => {
        // 'onCompleted' callback.
        // No errors, route to new page here

        //#region Check latest application version and give alert to user
        console.log("dfsdfs");
        this.checkLatestMobileAppVersionAndGiveAlert();
        //#endregion
      }
    );

    // this.hideLoadingIndicator() //Hide loading indicator
  }

  openforgot() {
    //this.router.navigate(['/yettostart'])
    this.router.navigate(['/forget-password'])
  }

  OpenRegistrationForm() {
    this.router.navigate(['/register'])
    //this.router.navigate(['/truck-registration'])
  }

  Get_IsStudentOnly_Details() {
    let empId = localStorage.getItem("empId");
    var empUrl = "/hrms/master/employeeAdminMaster/edit?empId=" + empId;
    var postData = {
      'empid': empId
    }

    console.log("URL: " + empUrl);
    this.storageservice.postrequest(empUrl, postData).subscribe(result => {
      var response = result['category'];
      console.log("Category list: " + response);
      if (response != null) {
        var student = response.isStudent;
        var employed = response.isEmployeed;
        var jobseeker = response.isProfessional;
        var landlord = response.isOrganization;
        var tenant = response.isTenant;
        var domesticHelp = response.isHelp;
        var others = response.isOther;
        var businessOwner = response.isBusinessOrEnt;

        //#region To check "Is only student concept" and store the value in the local.
        if (student && !employed && !jobseeker && !landlord && !tenant && !domesticHelp && !others && !businessOwner) {
          this.storageservice.publishSomeData({ IsStudentOnly: true });
          console.log("IsStudentOnly from login page: true");
        }
        else {
          this.storageservice.publishSomeData({ IsStudentOnly: false });
          console.log("IsStudentOnly from login page: false");
        }
        //#endregion
      }
      else {

      }
    });

  }

  async openLanguagePopOver($event) {
    const popover = await this.popoverController.create({
      component: LanguagePopoverPage,
      event: $event
    });
    await popover.present();
  }
  //#endregion

  //#region Functions
  checkLatestMobileAppVersionAndGiveAlert() {
    //#region REference
    // var appName = this.appVersion.getAppName();
    // var packageName = this.appVersion.getPackageName();
    // var versionCode = this.appVersion.getVersionCode();
    // var versionNumber = this.appVersion.getVersionNumber();

    // console.log("appName: " + appName);
    // console.log("packageName: " + packageName);
    // console.log("versionCode: " + versionCode);
    // console.log("versionNumber: " + versionNumber);

    // let latestMobileAppVersion = "2.6.0";
    // var alertMsg = "Latest version " + latestMobileAppVersion + " is available in play store now, Please upgrade if you want. Thanks.";
    // if (latestMobileAppVersion != "2.5.9") {
    //   // this.storageservice.generalAlertToastCustom(alertMsg, 6000);
    //   this.storageservice.GeneralAlertCustom('Discover new version ' + latestMobileAppVersion,
    //     'Latest version ' + latestMobileAppVersion + ' is available in play store now, Would you like to update?',
    //     'Update now', 'Not now');
    // }
    //#endregion
    //#region Check latest application version and give alert to user
    /*var getMobileAppVersionUrl = "/hrms/master/employeeAdminMaster/getLatestMobileAppVersionIOSMob";
    this.storageservice.getrequest(getMobileAppVersionUrl).subscribe(resultVersion => {
      var responseVersion = resultVersion;
      console.log("responseVersion: " + responseVersion);

      let latestMobileAppVersion = resultVersion['latestMobileAppVersion'];
      console.log(latestMobileAppVersion);

      if (latestMobileAppVersion != "1.2") {
        this.storageservice.GoToAppStoreAlert('Discover new version ' + latestMobileAppVersion, 
        'Latest version ' + latestMobileAppVersion + ' is available in app store now, Would you like to update?',
        'Update now', 'Not now');
      }
    },
      error => {
        console.log(`Error data: ${JSON.stringify(error)}`);
        if (error.name == "HttpErrorResponse") {
          this.storageservice.warningToast('Internet connection problem, Pls check your internet.');
          this.storageservice.GeneralAlert('HttpErrorResponse', 'Internet connection problem, Pls check your internet.');
        }
        else {
          this.storageservice.warningToast('Error: ' + error.message);
        }
      },
      () => {

      });
      */
    //#endregion
  }

  async showLoadingIndicator() {
    this.loadingCtrl.create({
      message: 'Processing...',
      spinner: 'bubbles',
      cssClass: 'loadingIndicatorCustom'
    }).then((loading) => {
      loading.present();
    });
  }
  async hideLoadingIndicator() {
      this.loadingCtrl.dismiss();
  }
  //#endregion  

}
