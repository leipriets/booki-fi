import { Injectable } from '@angular/core';
import { Place } from './place.model';
import { AuthService } from '../auth/auth.service';
import { BehaviorSubject, delay, map, of, switchMap, take, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { PlaceLocation } from './location.model';

interface PlaceData {
  availableFrom: string;
  availableTo: string;
  description: string;
  imageUrl: string;
  price: number;
  title: string;
  userId: string;
  location?: PlaceLocation;
}

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  private _places = new BehaviorSubject<Place[]>([]);

  get places() {
    return this._places.asObservable();
  }

  constructor(private authService: AuthService, private http: HttpClient) {}

  fetchPlaces(search?: string) {
    return this.authService.token.pipe(
      take(1),
      switchMap((token) => {
        const placeUrl = `https://ionic-angular-course-c2f51-default-rtdb.asia-southeast1.firebasedatabase.app/offered-places.json?auth=${token}`;

        if (search && search.trim().length > 0) {
          return this.http.get<{ [key: string]: PlaceData }>(
            placeUrl + `&orderBy="title"&startAt="${search}"`
          );
        } else {
          return this.http.get<{ [key: string]: PlaceData }>(placeUrl);
        }
      }),
      map((resData) => {
        const places: Place[] = [];
        for (const key in resData) {
          if (resData.hasOwnProperty(key)) {
            places.push(
              new Place(
                key,
                resData[key].title,
                resData[key].description,
                resData[key].imageUrl,
                resData[key].price,
                new Date(resData[key].availableFrom),
                new Date(resData[key].availableTo),
                resData[key].userId,
                resData[key].location
              )
            );
          }
        }
        return places;
      }),
      tap((places) => {
        this._places.next(places);
      })
    );
  }

  getPlace(id: string | null) {
    return this.authService.token.pipe(
      take(1),
      switchMap((token) => {
        return this.http
          .get<PlaceData>(
            `https://ionic-angular-course-c2f51-default-rtdb.asia-southeast1.firebasedatabase.app/offered-places/${id}.json?auth=${token}`
          )
          .pipe(
            map((placeData) => {
              return new Place(
                id,
                placeData.title,
                placeData.description,
                placeData.imageUrl,
                placeData.price,
                new Date(placeData.availableFrom),
                new Date(placeData.availableTo),
                placeData.userId,
                placeData.location
              );
            })
          );
      })
    );
  }

  uploadImage(image: File) {
    const uploadData = new FormData();
    uploadData.append('image', image);

    return this.authService.token.pipe(
      take(1),
      switchMap((token) => {
        return this.http.post<{ imageUrl: string; imagePath: string }>(
          'https://storeimage-2dxuz5epea-uc.a.run.app',
          uploadData,
          {
            headers: {
              Authorization: 'Bearer ' + token,
            },
          }
        );
      })
    );
  }

  addPlace(
    title: string | undefined | null,
    description: string | undefined | null,
    price: number | undefined | null,
    dateFrom: Date,
    dateTo: Date,
    location: PlaceLocation | undefined | null,
    imageUrl: string
  ) {
    let generatedId: string;
    let fetchUserId: string | null = null;
    let newPlace: Place;
    return this.authService.userId.pipe(
      take(1),
      switchMap((userId) => {
        fetchUserId = userId;
        return this.authService.token;
      }),
      take(1),
      switchMap((token) => {
        if (!fetchUserId) {
          throw new Error('User not found.');
        }
        newPlace = new Place(
          Math.random().toString(),
          title,
          description,
          imageUrl,
          price,
          dateFrom,
          dateTo,
          fetchUserId,
          location
        );

        return this.http.post<{ name: string }>(
          `https://ionic-angular-course-c2f51-default-rtdb.asia-southeast1.firebasedatabase.app/offered-places.json?auth=${token}`,
          { ...newPlace, id: null }
        );
      }),
      switchMap((resData) => {
        generatedId = resData.name;
        return this.places;
      }),
      take(1),
      tap((places) => {
        newPlace.id = generatedId;
        this._places.next(places.concat(newPlace));
      })
    );
  }

  updatePlace(placeId: string, title: string, description: string) {
    let updatedPlaces: Place[];
    let fetchedToken: string | null = null;

    return this.authService.token.pipe(
      take(1),
      switchMap((token) => {
        fetchedToken = token;
        return this.places;
      }),
      take(1),
      switchMap((places) => {
        if (!places || places.length <= 0) {
          return this.fetchPlaces();
        } else {
          return of(places);
        }
      }),
      switchMap((places) => {
        const updatedPlaceIndex = places.findIndex((pl) => pl.id === placeId);
        updatedPlaces = [...places];
        const oldPlace = updatedPlaces[updatedPlaceIndex];
        updatedPlaces[updatedPlaceIndex] = new Place(
          oldPlace.id,
          title,
          description,
          oldPlace.imageUrl,
          oldPlace.price,
          oldPlace.availableFrom,
          oldPlace.availableTo,
          oldPlace.userId,
          oldPlace.location
        );

        return this.http.put(
          `https://ionic-angular-course-c2f51-default-rtdb.asia-southeast1.firebasedatabase.app/offered-places/${placeId}.json?auth=${fetchedToken}`,
          {
            ...updatedPlaces[updatedPlaceIndex],
            id: null,
          }
        );
      }),
      tap(() => {
        this._places.next(updatedPlaces);
      })
    );
  }
}
