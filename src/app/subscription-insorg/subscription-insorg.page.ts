import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { StorageService } from '../storage.service';
import { Platform } from '@ionic/angular';
import { IAPProduct, InAppPurchase2 } from '@awesome-cordova-plugins/in-app-purchase-2/ngx';
import { TranslateService } from '@ngx-translate/core';
import { Location} from '@angular/common';

const STANDARD_KEY = 'com.paragondynamcis.tftalentchek.standard';
const PROFESSIONAL_KEY = 'com.paragondynamcis.tftalentchek.professional';
const ENTERPRISE_KEY = 'com.paragondynamcis.tftalentchek.enterprise';
const ULTIMATE_KEY = 'com.paragondynamcis.tftalentchek.ultimate';


@Component({
  selector: 'app-subscription-insorg',
  templateUrl: './subscription-insorg.page.html',
  styleUrls: ['./subscription-insorg.page.scss'],
})
export class SubscriptionInsorgPage implements OnInit {

  doRefresh(event) {
    this.BindDefaultCurrencyAsPerCurrentUser();
    setTimeout(() => {
      event.target.complete();
    }, 2000);
  }
 
  userId: string;
  roleId: any;
  RoleId: any;
  previousUrl: string;
  currencyVal: string;
  currencySymbolVal: string;
  usercountry: string;

  amtProfessionalVal: number;
  amtEnterpriseVal: number;
  amtUltimateVal: number;
  paymentStoreURLs: string = this.storageservice.mobileserverurl + '/api/company/paymentHistoryLiveMob';
  products: IAPProduct[] = [];
  subscriptypeVal: string;
  finalAmtVal: number;

  constructor(private http: HttpClient, public storageservice: StorageService, private location: Location,
              public platform: Platform, private store: InAppPurchase2, private translate: TranslateService) {

    this.userId = localStorage.getItem('userId');
    this.currencyVal = 'INR';
    this.amtProfessionalVal = 2499;
    this.amtEnterpriseVal = 3499;
    this.amtUltimateVal = 79900;
    this.currencySymbolVal = '₹';

    this.platform.ready().then(() => {

  //  this.registerProducts();
 //   this.setupListeners();
    });

  }

  ngOnInit() {

    this.roleId = localStorage.getItem('roleId');
    console.log(this.roleId);
    this.RoleId = this.roleId.split(',', 3);
  }

  registerProducts(){
    this.store.register({
      id: PROFESSIONAL_KEY,
      type: this.store.CONSUMABLE,
    });
    this.store.register({
      id: ENTERPRISE_KEY,
      type: this.store.CONSUMABLE,
    });
    this.store.register({
      id: ULTIMATE_KEY,
      type: this.store.CONSUMABLE,
    });

    this.store.refresh();
  }

  setupListeners(){

    this.store.when('product')
      .approved((p: IAPProduct) => {
        // Handle the product deliverable
        if (p.id === PROFESSIONAL_KEY) {
          this.subscriptypeVal = 'Professional';
          this.finalAmtVal = this.amtProfessionalVal;
        }
        else if (p.id === ENTERPRISE_KEY) {
          this.subscriptypeVal = 'Enterprise';
          this.finalAmtVal = this.amtEnterpriseVal;
        }
        else if (p.id === ULTIMATE_KEY) {
          this.subscriptypeVal = 'Ultimate';
          this.finalAmtVal = this.amtUltimateVal;
        }

        return p.verify();
      })
      .verified((p: IAPProduct) => {
        p.finish();

        console.log(`Verified response data: ${JSON.stringify(p)}`);

        const options = {
          orderid: 'ios-appstore',
          paymentid: p.transaction.id,
          signature: 'ios-appstore',
          userId: this.userId,
          subscriptype: this.subscriptypeVal,
          subscripamt: this.finalAmtVal,
  //        currency: this.currencyVal1,
    //      country: this.usercountry
        };

        this.storageservice.generalAlertToastGreen('Payment verified successfuly.');
        console.log(`Payment verified successfuly.`);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', this.paymentStoreURLs, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify(options));
        xhr.onload = function() {
          const data = JSON.parse(this.responseText);
          console.log(`Completed payment response data: ${JSON.stringify(data)}`);
        };
      });
  }

  CurrencyChangeEvent(event) {

    console.log('SelectedValue: ' + event.target.value);

    this.currencyVal = event.target.value;
    if (this.currencyVal === 'INR') {
      this.amtProfessionalVal = 2499;
      this.amtEnterpriseVal = 3499;
      this.amtUltimateVal = 79900;
      this.currencySymbolVal = '₹';
    }
    else if (this.currencyVal === 'USD') {
      this.amtProfessionalVal = 27.99;
      this.amtEnterpriseVal = 39.99;
      this.amtUltimateVal = 899.99;
      this.currencySymbolVal = '$';
    }
    else if (this.currencyVal === 'AED') {
      this.amtProfessionalVal = 104.99;
      this.amtEnterpriseVal = 147.99;
      this.amtUltimateVal = 3299.99;
      this.currencySymbolVal = 'د.إ';
    }
    else if (this.currencyVal === 'MYR') {
      this.amtProfessionalVal = 119.90;
      this.amtEnterpriseVal = 167.90;
      this.amtUltimateVal = 3799.90;
      this.currencySymbolVal = 'RM';
    }
    else if (this.currencyVal === 'SGD') {
      this.amtProfessionalVal = 40.98;
      this.amtEnterpriseVal = 58.98;
      this.amtUltimateVal = 1288.98;
      this.currencySymbolVal = '$';
    }
    else {
      this.amtProfessionalVal = 2499;
      this.amtEnterpriseVal = 3499;
      this.amtUltimateVal = 79900;
      this.currencySymbolVal = '₹';
    }

  }

  payProfessional() {
    this.store.order(PROFESSIONAL_KEY);
  }

  payEnterprise() {
    this.store.order(ENTERPRISE_KEY);
  }

  payUltimate() {
    this.store.order(ULTIMATE_KEY);
  }

  goto_settings(){
    if (this.previousUrl){
      this.location.back();
    }
  }
  BindDefaultCurrencyAsPerCurrentUser() {
    const getCurrencyURL = 'api/auth/app/mobile/getCurrenyCodeOfCurrentUser?currentUserId=' + this.userId;
    this.storageservice.getrequest(getCurrencyURL).subscribe(result => {
      // tslint:disable-next-line:prefer-const
      let currencyResponse = result[0];
      this.usercountry = result[0].country;
      console.log('currencyResponse: ' + currencyResponse);
      if (currencyResponse != null) {
        const currency = 'INR';
        console.log('In currency: ' + currency);

        this.currencyVal = currency;
        if (this.currencyVal === 'INR') {
          this.amtProfessionalVal = 2499;
          this.amtEnterpriseVal = 3499;
          this.amtUltimateVal = 79900;
          this.currencySymbolVal = '₹';
        }
        else if (this.currencyVal === 'USD') {
          this.amtProfessionalVal = 27.99;
          this.amtEnterpriseVal = 39.99;
          this.amtUltimateVal = 899.99;
          this.currencySymbolVal = '$';
        }
        else if (this.currencyVal === 'AED') {
          this.amtProfessionalVal = 104.99;
          this.amtEnterpriseVal = 147.99;
          this.amtUltimateVal = 3299.99;
          this.currencySymbolVal = 'د.إ';
        }
        else if (this.currencyVal === 'MYR') {
          this.amtProfessionalVal = 119.90;
          this.amtEnterpriseVal = 167.90;
          this.amtUltimateVal = 3799.90;
          this.currencySymbolVal = 'RM';
        }
        else if (this.currencyVal === 'SGD') {
          this.amtProfessionalVal = 40.98;
          this.amtEnterpriseVal = 58.98;
          this.amtUltimateVal = 1288.98;
          this.currencySymbolVal = '$';
        }
        else {
          this.currencyVal = "USD";
          this.amtProfessionalVal = 27.99;
          this.amtEnterpriseVal = 39.99;
          this.amtUltimateVal = 899.99;
          this.currencySymbolVal = '$';
        }
      }
      else {
        this.currencyVal = 'USD';
        this.amtProfessionalVal = 27.99;
        this.amtEnterpriseVal = 39.99;
        this.amtUltimateVal = 899.99;
        this.currencySymbolVal = '$';
      }
    });
  }


}
