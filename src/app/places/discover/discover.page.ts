import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { PlacesService } from '../places.service';
import { MenuController, SegmentChangeEventDetail } from '@ionic/angular';
import { debounceTime, Subscription, take } from 'rxjs';

import { Place } from '../place.model';
import { AuthService } from 'src/app/auth/auth.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.page.html',
  styleUrls: ['./discover.page.scss'],
  standalone: false,
})
export class DiscoverPage implements OnInit, OnDestroy {
  loadedPlaces: Place[] = [];
  listLoadedPlaces: Place[] = [];
  relevantPlaces: Place[] = [];
  isLoading = false;
  searchControl = new FormControl();

  private placesSub?: Subscription;
  private filter = 'all';

  constructor(
    private placesService: PlacesService,
    private menuCtrl: MenuController,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.placesSub = this.placesService.places.subscribe((places) => {
      this.loadedPlaces = places;
      this.relevantPlaces = this.loadedPlaces;
      this.listLoadedPlaces = this.relevantPlaces.slice(1);
    });
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.placesService.fetchPlaces().subscribe(() => {
      this.isLoading = false;
    });


    this.searchControl.valueChanges
      .pipe(debounceTime(600))
      .subscribe((value) => {
        console.log('Debounced search:', value);
        this.isLoading = true;
        // Perform filtering or API call here
        this.placesService.fetchPlaces(value).subscribe(() => {
          this.isLoading = false;
        });
      });
  }

  onSearch(event: CustomEvent) {
    console.log(event);
  }

  onFilterUpdate(event: CustomEvent<SegmentChangeEventDetail>) {
    console.log(event.detail.value);
    this.authService.userId.pipe(take(1)).subscribe((userId) => {
      if (event.detail.value === 'all') {
        this.relevantPlaces = this.loadedPlaces;
        // this.listLoadedPlaces = this.relevantPlaces.slice(1);
        this.listLoadedPlaces = this.relevantPlaces;
      } else {
        this.relevantPlaces = this.loadedPlaces.filter(
          (place) => place.userId !== userId
        );
        // this.loadedPlaces = this.relevantPlaces.slice(1);
        this.loadedPlaces = this.relevantPlaces;
      }
    });
  }

  // onFilterUpdate2(filter: string) {
  //   this.authService.userId.pipe(take(1)).subscribe(userId => {
  //     const isShown = place => filter === 'all' || place.userId !== userId;
  //     this.relevantPlaces = this.loadedPlaces.filter(isShown);
  //     this.filter = filter;
  //   });
  // }

  ngOnDestroy(): void {
    if (this.placesSub) {
      this.placesSub.unsubscribe();
    }
  }
}
