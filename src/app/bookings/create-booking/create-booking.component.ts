import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Place } from 'src/app/places/place.model';

@Component({
  selector: 'app-create-booking',
  templateUrl: './create-booking.component.html',
  styleUrls: ['./create-booking.component.scss'],
  standalone: false,
})
export class CreateBookingComponent implements OnInit {
  @Input() selectedPlace?: Place;
  @Input() selectedMode?: 'select' | 'random';
  @ViewChild('form', { static: true }) form!: NgForm;

  dateFromPopover?: any;
  dateFromValue?: Date | string;
  dateToValue?: Date | string;
  startDate?: string;
  endDate?: string;
  isValidDate?: boolean = false;

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {
    this.initializeForm();
  }

  ionViewDidEnter() {
    this.initializeForm();
  }

  initializeForm() {
    const availableFrom = new Date(this.selectedPlace!.availableFrom);
    const availableTo = new Date(this.selectedPlace!.availableTo);

    // set random week between the startDate and EndDate
    if (this.selectedMode == 'random') {
      this.startDate = new Date(
        availableFrom.getTime() +
          Math.random() *
            (availableTo.getTime() -
              7 * 24 * 60 * 60 * 1000 -
              availableFrom.getTime())
      ).toISOString();

      this.dateFromValue = this.startDate;

      this.endDate = new Date(
        new Date(this.startDate).getTime() +
          Math.random() *
            (new Date(this.startDate).getTime() +
              6 * 24 * 60 * 60 * 1000 -
              new Date(this.startDate).getTime())
      ).toISOString();

      // this.form.controls['dateTo'].setValue(this.endDate);
      this.dateToValue = this.endDate;
    }
  }

  onBookPlace() {

    // if (this.form.invalid || !this.datesValid) {
    //   return ;
    // }

    this.modalCtrl.dismiss(
      {
        bookingData: {
          firstName: this.form.controls['first-name'].value,
          lastName: this.form.controls['last-name'].value,
          guestNumber: +this.form.controls['guest-number'].value,
          startDate: new Date(this.form.controls['dateFrom'].value),
          endDate: new Date(this.form.controls['dateTo'].value),
        }
      },
      'confirm'
    );
  }

  onCancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  datesValid() {
    const startDate = new Date(this.form?.value['dateFrom']);
    const endDate = new Date(this.form?.value['dateTo']);
    const isValidDate = endDate > startDate;
    console.log(this.form?.controls);
    // console.log(isValidDate);
    return isValidDate;
  }
}
