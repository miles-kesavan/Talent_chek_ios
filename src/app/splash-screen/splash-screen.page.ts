import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '../storage.service';

@Component({
  selector: 'app-splash-screen',
  templateUrl: './splash-screen.page.html',
  styleUrls: ['./splash-screen.page.scss'],
})
export class SplashScreenPage implements OnInit {

 roleId :any;

  constructor(private router: Router, public storageservice: StorageService) { 

 

    var idobj = localStorage.getItem("userId");
    var pwdObj = localStorage.getItem("access");
    if (idobj != null && pwdObj != null) {
      console.log('Id s-c: ', idobj);
      console.log('Pwd s-c: ', pwdObj);
      this.roleId = localStorage.getItem("roleId");
      //#region Check latest application version and give alert to user
      this.checkLatestMobileAppVersionAndGiveAlert();
      //#endregion


      //Set IsFloatingScript flag to empty for the 'Connection' form.
      localStorage.setItem("IsFloatingScript", "");

      if (this.roleId.includes('1')) {
        this.router.navigate(['/home']);
      } else if (this.roleId.includes('2')) {
        this.router.navigate(['/organization-dashboard']);
      } else if (this.roleId.includes( '3')) {
        this.router.navigate(['/institution-dashboard']);
      }
      else if (this.roleId.includes('5')) {
        this.router.navigate(['/job-search']);
      }
    }
    else {
      this.router.navigate(['/login']);
    }
  }

  ngOnInit() {
  }



  checkLatestMobileAppVersionAndGiveAlert(){
//#region Check latest application version and give alert to user

    

}

}