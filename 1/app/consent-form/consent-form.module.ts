import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConsentFormPageRoutingModule } from './consent-form-routing.module';

import { ConsentFormPage } from './consent-form.page';

import {TranslateModule} from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConsentFormPageRoutingModule,
    TranslateModule
  ],
  declarations: [ConsentFormPage]
})
export class ConsentFormPageModule {}
