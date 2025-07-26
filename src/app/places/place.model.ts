import { PlaceLocation } from "./location.model";

export class Place {
  constructor(
    public id: string | null,
    public title: string | undefined | null,
    public description: string | undefined | null,
    public imageUrl: string,
    public price: number | undefined | null,
    public availableFrom: Date,
    public availableTo: Date,
    public userId: string | null,
    public location: PlaceLocation | undefined | null,
  ) {}
}
