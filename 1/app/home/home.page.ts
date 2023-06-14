import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { StorageService } from '../storage.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

declare var google;
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  //#region Declarations
  loginform: FormGroup;
  global_baseurl: any;
  response: any;
  emailPattern: any;
  selectedIndex: boolean = true;
  //#endregion

  //#region Constructor
  constructor(public formbuilder: FormBuilder, public router: Router, public storageservice: StorageService, private http: HttpClient) {

    this.emailPattern = "^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$";
    this.loginform = formbuilder.group({
      email: ['', [Validators.required, Validators.pattern(this.emailPattern)]],
      password: ['', Validators.compose([Validators.maxLength(20), Validators.required])],


    });
  }
  //#endregion

  //#region Functions
  googleTranslateElementInit() {
    //alert(333);
    new google.translate.TranslateElement({ pageLanguage: 'en', includedLanguages: 'ar,hi,ta' }, 'google_translate_element');
    /*  new google.translate.TranslateElement({ pageLanguage: 'en', includedLanguages: "hi,en" }, 'google_translate_element'); */

    /*  new google.translate.TranslateElement({pageLanguage: 'ja', layout: google.translate.TranslateElement.InlineLayout.SIMPLE,includedLanguages: "zh-CN,en,ja,ko"
   }, 'google_translate_element');  */

  }
  //#endregion

  //#region Button click
  login_click() {
    this.global_baseurl = this.storageservice.getbaseusrl();
    let email_get = this.loginform.controls['email'].value;
    let password_get = this.loginform.controls['password'].value;


    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      "Access-Control-Allow-Origin": '*'
    });
    let options = {
      headers: headers
    }
    alert(options)
    var postData = {
      'email': email_get,
      'password': password_get,

    }
    this.http.post(this.global_baseurl + 'mobilelogin', postData, options)

      .subscribe(data => {
        this.response = data;
      });
    console.log(this.response);
    /*   this.router.navigate(['/talensearch']) */
    this.router.navigate(['/talensearch'])
  }
  openforgot() {
    this.router.navigate(['/forgotpassword'])
  }
  openforres() {
    this.router.navigate(['/signup'])
  }
  //#endregion
  
}
