import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';

import { PlacesService } from '../../places.service';
import { PlaceLocation } from '../../location.model';
import { switchMap } from 'rxjs';

function base64toBlob(base64Data: string, contentType: string) {
  contentType = contentType || '';
  const sliceSize = 1024;
  const byteCharacters = atob(base64Data);
  const bytesLength = byteCharacters.length;
  const slicesCount = Math.ceil(bytesLength / sliceSize);
  const byteArrays = new Array(slicesCount);

  for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
    const begin = sliceIndex * sliceSize;
    const end = Math.min(begin + sliceSize, bytesLength);

    const bytes = new Array(end - begin);
    for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
      bytes[i] = byteCharacters[offset].charCodeAt(0);
    }
    byteArrays[sliceIndex] = new Uint8Array(bytes);
  }
  return new Blob(byteArrays, { type: contentType });
}

@Component({
  selector: 'app-new-offer',
  templateUrl: './new-offer.page.html',
  styleUrls: ['./new-offer.page.scss'],
  standalone: false,
})
export class NewOfferPage implements OnInit {
  form = new FormGroup({
    title: new FormControl(null, {
      updateOn: 'blur',
      validators: [Validators.required],
    }),
    description: new FormControl(null, {
      updateOn: 'blur',
      validators: [Validators.required, Validators.maxLength(180)],
    }),
    price: new FormControl(null, {
      updateOn: 'blur',
      validators: [Validators.required, Validators.min(1)],
    }),
    dateFrom: new FormControl(null, {
      updateOn: 'blur',
      validators: [Validators.required],
    }),
    dateTo: new FormControl(null, {
      updateOn: 'blur',
      validators: [Validators.required],
    }),
    location: new FormControl<PlaceLocation | null>(null, {
      updateOn: 'blur',
      validators: [Validators.required],
    }),
    image: new FormControl<string | File | null>(null),
  });

  constructor(
    private fb: FormBuilder,
    private placesService: PlacesService,
    private router: Router,
    private loaderCtrl: LoadingController
  ) {}

  ngOnInit() {}

  onCreateOffer() {
    if (!this.form.valid || !this.form.get('image')?.value) {
      return;
    }
    console.log('Form Value:', this.form.value);

    this.loaderCtrl
      .create({
        message: 'Creating place...',
      })
      .then((loadingEl) => {
        loadingEl.present();
        this.placesService
          .uploadImage(this.form.get('image')?.value as File)
          .pipe(
            switchMap((uploadResponse) => {
              return this.placesService.addPlace(
                this.form.value.title,
                this.form.value.description,
                this.form.value.price,
                new Date(this.form.value.dateFrom ?? ''),
                new Date(this.form.value.dateTo ?? ''),
                this.form.value.location,
                uploadResponse.imageUrl
              );
            })
          )
          .subscribe(() => {
            loadingEl.dismiss();
            this.form.reset();
            this.router.navigate(['/places/tabs/offers']);
          });

      });
  }

  onLocationPicked(placeLocation: PlaceLocation | null) {
    this.form.patchValue({
      location: placeLocation,
    });
    // const staticMapImageUrl = this.placesService.getStaticMapImage(
    //   location.lat,
    //   location.lng
    // );
    // this.form.patchValue({
    //   locationImage: staticMapImageUrl,
    // });
  }

  onImagePicked(imageData: string | File) {
    let imageFile;
    if (typeof imageData === 'string') {
      try {
        imageFile = base64toBlob(
          imageData.replace('data:image/jpeg;base64,', ''),
          'image/jpeg'
        );
      } catch (error) {
        console.error('Error converting base64 to Blob:', error);
      }
    } else {
      imageFile = imageData;
    }

    this.form.patchValue({
      image:
        imageFile instanceof Blob
          ? new File([imageFile], 'image.jpg', { type: imageFile.type })
          : imageFile,
    });
  }
}
