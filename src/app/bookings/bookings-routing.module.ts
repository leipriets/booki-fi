import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BookingsPage } from './bookings.page';
import { CreateBookingComponent } from './create-booking/create-booking.component';

const routes: Routes = [
  {
    path: '',
    component: BookingsPage
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BookingsPageRoutingModule {}
