import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { StorageService } from '../storage.service';

@Component({
  selector: 'app-splash-screen',
  templateUrl: './splash-screen.page.html',
  styleUrls: ['./splash-screen.page.scss'],
})
export class SplashScreenPage implements OnInit {

  constructor(private router: Router, public storageservice: StorageService) {

    var idobj = localStorage.getItem("TC_Id");
    var pwdObj = localStorage.getItem("TC_Pwd");
    if (idobj != null && pwdObj != null) {
      console.log('Id s-c: ', idobj);
      console.log('Pwd s-c: ', pwdObj);

      //#region Check latest application version and give alert to user
      this.checkLatestMobileAppVersionAndGiveAlert();
      //#endregion

      var categoryflag = localStorage.getItem("categoryflag");
      var userRefFlag = localStorage.getItem("userRefFlag");
      console.log("CategoryFlag s-c: " + categoryflag);
      console.log("userRefFlag s-c: " + userRefFlag);

      this.storageservice.publishSomeData({ UserRefFlag: userRefFlag});

      //Set IsFloatingScript flag to empty for the 'Connection' form.
      localStorage.setItem("IsFloatingScript", "");

      if (userRefFlag == "IU") {
        this.router.navigate(['/dashboard-individual'])
      }
      else if (userRefFlag == "OU") {
        this.router.navigate(['/dashboard-corporate'])
      }
      else if (userRefFlag == "GU") {
        this.router.navigate(['/dashboard-institution'])
      }
      else {
        this.router.navigate(['/dashboard-individual'])
      }      

    }
    else {
      this.router.navigate(['/login'])
    }

  }

  ngOnInit() {
  }

  checkLatestMobileAppVersionAndGiveAlert() {

    //#region Check latest application version and give alert to user
    
    //#endregion

  }

}
