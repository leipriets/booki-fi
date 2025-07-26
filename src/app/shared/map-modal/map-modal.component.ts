import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { ModalController } from '@ionic/angular';
import { environment } from '../../../environments/environment'; // Adjust the path as necessary

// let autocomplete;
// function initAutoComplete() {
//   const input = document.getElementById('placeInput') as HTMLInputElement;
//   autocomplete = new google.maps.places.Autocomplete(input, {
//     types: ['lodging'],
//     componentRestrictions: { country: ['ph'] },
//     fields: ['place_id', 'geometry', 'name']
//   });
// }

@Component({
  selector: 'app-map-modal',
  templateUrl: './map-modal.component.html',
  styleUrls: ['./map-modal.component.scss'],
  standalone: false,
})
export class MapModalComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('map', { static: false }) mapElementRef?: ElementRef;
  @ViewChild('searchInput', { static: false }) searchInput!: ElementRef;
  @Input() center = { lat: 14.5995, lng: 120.9842 }; // Default center coordinates (Manila)
  @Input() selectable = true; // Allow selection of coordinates
  @Input() closeButtonText = 'Cancel';
  @Input() title = 'Pick Location';

  clickListener: any;
  googleMaps: any;
  mapInstance: any;
  service!: google.maps.places.PlacesService;
  predictions: google.maps.places.AutocompletePrediction[] = [];

  constructor(
    private modalCtrl: ModalController,
    private renderer: Renderer2
  ) {}

  ngOnInit() {}

  ngAfterViewInit(): void {
    this.renderMap();
  }

  onCancel() {
    this.modalCtrl.dismiss();
  }

  renderMap(lat?:number, lng?: number) {
    this.getGoogleMaps()
      .then((googleMaps) => {
        this.googleMaps = googleMaps;
        const mapEl = this.mapElementRef?.nativeElement;

        if (lat && lng) {
          this.center = { lat: lat, lng: lng };
        }

        const map = new google.maps.Map(mapEl, {
          center: this.center,
          zoom: 16,
          mapTypeId: 'roadmap',
          gestureHandling: 'greedy'
        });

        this.mapInstance = map;

        new google.maps.Marker({
          position: this.center,
          map,
          title: "Selected location",
        });

        this.googleMaps.event.addListenerOnce(map, 'idle', () => {
          this.renderer.addClass(mapEl, 'visible');
        });

        if (this.selectable) {
          this.clickListener = map.addListener(
            'click',
            (event: google.maps.MapMouseEvent) => {
              if (event.latLng) {
                const selectedCoords = {
                  lat: event.latLng.lat(),
                  lng: event.latLng.lng(),
                };
                this.modalCtrl.dismiss(selectedCoords);
              }
            }
          );
        } else {
          const marker = new googleMaps.Marker({
            position: this.center,
            map: map,
            title: 'Selected Location',
          });
          marker.setMap(map);
        }

        return map;
      })
      .catch((err) => {
        console.log(err);
      });
  }

  searchPlaces(event: Event) {
    const target = event.target as HTMLIonSearchbarElement;
    const query = target.value?.toLowerCase() || '';

    const searchInputVal = query;

    if (!query || query.length < 2) {
      this.predictions = [];
      return;
    }

    let displaySuggestions = (predictions: any, status: any) => {
      if (status == google.maps.places.PlacesServiceStatus.OK) {
        this.predictions = predictions;
      } else {
        this.predictions = [];
        console.warn('Autocomplete failed:', status);
      }
    };

    const service = new google.maps.places.AutocompleteService();

    const request = {
      input: searchInputVal,
      types: ['lodging'],
      componentRestrictions: { country: ['ph'] },
    };

    if (service) {
      service.getPlacePredictions(request, displaySuggestions);
    } else {
      console.error('AutocompleteService is not initialized.');
    }
  }

  selectPlace(place: google.maps.places.AutocompletePrediction) {
    console.log('Selected place:', place);
    const placeId = place.place_id;

    const request = {
      placeId: placeId,
      fields: ['geometry', 'name', 'formatted_address'], // include what you need
    };

    const placesService = new google.maps.places.PlacesService(
      this.mapInstance
    ); // your map instance

    placesService.getDetails(request, (placeResult, status) => {
      if (
        status === google.maps.places.PlacesServiceStatus.OK &&
        placeResult?.geometry
      ) {
        const location = placeResult?.geometry.location;

        const lat = location!.lat();
        const lng = location!.lng();

        console.log('Lat:', lat, 'Lng:', lng);
        // For each place, get the icon, name and location.
        // const bounds = new google.maps.LatLngBounds();

        // Add marker        
        this.renderMap(lat, lng);
      } else {
        console.warn('Place details failed:', status);
      }
    });
  }

  searchMapPlaces(map: any) {
    // Create the search box and link it to the UI element.
    const input = document.getElementById('placeInput') as HTMLInputElement;
    const searchBox = new google.maps.places.SearchBox(input);
    if (!input) {
      console.error('Search input element not found in the DOM.');
      return;
    }

    // map.controls[google.maps.ControlPosition.TOP_CENTER].push(input);

    // Bias the SearchBox results towards current map's viewport.
    map.addListener('bounds_changed', () => {
      searchBox.setBounds(map.getBounds() as google.maps.LatLngBounds);
    });

    let markers: google.maps.Marker[] = [];

    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    searchBox.addListener('places_changed', () => {
      if (!searchBox.getPlaces || typeof searchBox.getPlaces !== 'function') {
        console.error('SearchBox getPlaces method is not available.');
        return;
      }
      const places = searchBox.getPlaces();
      console.log(places);

      // if ((places ?? []).length == 0) {
      //   return;
      // }

      // Clear out the old markers.
      markers.forEach((marker) => {
        marker.setMap(null);
      });
      markers = [];

      // For each place, get the icon, name and location.
      const bounds = new google.maps.LatLngBounds();

      places?.forEach((place) => {
        if (!place.geometry || !place.geometry.location) {
          console.log('Returned place contains no geometry');
          return;
        }

        const icon = {
          url: place.icon as string,
          size: new google.maps.Size(71, 71),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(17, 34),
          scaledSize: new google.maps.Size(25, 25),
        };

        // Create a marker for each place.
        markers.push(
          new google.maps.Marker({
            map,
            icon,
            title: place.name,
            position: place.geometry.location,
          })
        );

        if (place.geometry.viewport) {
          // Only geocodes have viewport.
          bounds.union(place.geometry.viewport);
        } else {
          bounds.extend(place.geometry.location);
        }
      });
      map.fitBounds(bounds);
    });
  }

  ngOnDestroy(): void {
    if (this.clickListener) {
      this.googleMaps.event.removeListener(this.clickListener);
    }
  }

  private getGoogleMaps(): Promise<any> {
    const win = window as any;
    const googleModule = win.google;

    if (googleModule && googleModule.maps) {
      return Promise.resolve(googleModule.maps);
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      script.onload = () => {
        const loadedGoogleModule = win.google;

        if (loadedGoogleModule && loadedGoogleModule.maps) {
          resolve(loadedGoogleModule.maps);
        } else {
          reject('Google maps SDK not available.');
        }
      };
    });
  }
}
