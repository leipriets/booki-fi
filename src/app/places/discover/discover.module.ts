import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DiscoverPageRoutingModule } from './discover-routing.module';

import { DiscoverPage } from './discover.page';
import { PlacesService } from '../places.service';
import { HttpClientModule } from '@angular/common/module.d-CnjH8Dlt';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    DiscoverPageRoutingModule,
  ],
  declarations: [DiscoverPage],
  providers: [PlacesService],
})
export class DiscoverPageModule {}
