import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { StorageService } from '../storage.service';
import { Platform } from '@ionic/angular';
import { InAppPurchase2 } from '@awesome-cordova-plugins/in-app-purchase-2/ngx';
import { TranslateService } from '@ngx-translate/core';
import { Location } from '@angular/common';

const STANDARD_KEY = 'com.paragondynamcis.tftalentchek.standard';
const PROFESSIONAL_KEY = 'com.paragondynamcis.tftalentchek.professional';
const ENTERPRISE_KEY = 'com.paragondynamcis.tftalentchek.enterprise';
const ULTIMATE_KEY = 'com.paragondynamcis.tftalentchek.ultimate';


@Component({
  selector: 'app-subscription-individual',
  templateUrl: './subscription-individual.page.html',
  styleUrls: ['./subscription-individual.page.scss'],
})
export class SubscriptionIndividualPage implements OnInit {

  currencyVal: string;
  amountVal: number;
  currencySymbolVal: string;
  previousUrl: string;
  usercountry: string;

  userId: string;
  empId: string;
  paymentStoreURLs: string = this.storageservice.mobileserverurl + 'api/auth/app/subscription/payments/paymentHistory';

  constructor(private http: HttpClient, public storageservice: StorageService, private location: Location, public platform: Platform,
              private store: InAppPurchase2, private translate: TranslateService) {

        this.userId = localStorage.getItem('userId');
        this.empId = localStorage.getItem('empId');
        this.currencyVal = 'USD';
        this.amountVal = 10;
        this.currencySymbolVal = '$';

        this.BindDefaultCurrencyAsPerCurrentUser();

        const options = {
      orderid: 'IOS',
      paymentid: 'IOS',
      signature: 'IOS',
      userId: this.userId,
      subscriptype: 'Standard',
      subscripamt: this.amountVal,
      currency: this.currencyVal,
      country: this.usercountry
    };

        this.platform.ready().then(() => {
      this.store.register({
        id: STANDARD_KEY,
        type: this.store.CONSUMABLE,
      });

      this.store.when(STANDARD_KEY)
        .approved(p => p.verify())
        .verified(p => {
          p.finish();
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

      this.store.refresh();
     });

  }

  ngOnInit() {
    this.previousUrl = this.location.path();
  }

  CurrencyChangeEvent(event) {

    console.log('SelectedValue: ' + event.target.value);

    this.currencyVal = event.target.value;
    if (this.currencyVal === 'INR') {
      this.amountVal = 179;
      this.currencySymbolVal = '₹';
    }
    else if (this.currencyVal === 'USD') {
      this.amountVal = 1.99;
      this.currencySymbolVal = '$';
    }
    else if (this.currencyVal === 'AED') {
      this.amountVal = 7.29;
      this.currencySymbolVal = 'د.إ';
    }
    else if (this.currencyVal === 'MYR') {
      this.amountVal = 7.90;
      this.currencySymbolVal = 'RM';
    }
    else if (this.currencyVal === 'SGD') {
      this.amountVal = 2.98;
      this.currencySymbolVal = '$';
    }
    else {
      this.amountVal = 179;
      this.currencyVal = 'INR';
      this.currencySymbolVal = '₹';
    }

  }

  payInAppPurchaseStandard() {
    this.store.order(STANDARD_KEY).then(p => {
      // this.storageservice.generalAlertToastGreen('Progress...');
    }, e => {
      this.storageservice.GeneralAlert('Failed', 'Failed to purchase.');
    });
  }

  BindDefaultCurrencyAsPerCurrentUser() {
    // tslint:disable-next-line:prefer-const
    let getCurrencyURL = 'api/auth/app/mobile/getCurrenyCodeOfCurrentUser?currentUserId=' + this.userId;
    this.storageservice.getrequest(getCurrencyURL).subscribe(result => {

      const currencyResponse = result[0];
      this.usercountry = result[0].country;
      console.log('currencyResponse: ' + currencyResponse);
      if (currencyResponse != null) {
        // tslint:disable-next-line:prefer-const
        let currency = currencyResponse.currency;
        console.log('In currency: ' + currency);

        this.currencyVal = currency;
        if (this.currencyVal === 'INR') {
          this.amountVal = 179;
          this.currencySymbolVal = '₹';
        }
        else if (this.currencyVal === 'USD') {
          this.amountVal = 1.99;
          this.currencySymbolVal = '$';
        }
        else if (this.currencyVal === 'AED') {
          this.amountVal = 7.29;
          this.currencySymbolVal = 'د.إ';
        }
        else if (this.currencyVal === 'MYR') {
          this.amountVal = 7.9;
          this.currencySymbolVal = 'RM';
        }
        else if (this.currencyVal === 'SGD') {
          this.amountVal = 2.98;
          this.currencySymbolVal = '$';
        }
        else {
          this.currencyVal = 'USD';
          this.amountVal = 10;
          this.currencySymbolVal = '$';
        }
      }
      else {
        this.currencyVal = 'USD';
        this.amountVal = 1.99;
        this.currencySymbolVal = '$';
      }
    });
  }

  goto_settings(){
    if (this.previousUrl){
      this.location.back();
    }
  }

}
