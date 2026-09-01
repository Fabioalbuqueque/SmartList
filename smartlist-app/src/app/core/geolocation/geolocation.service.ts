import { Injectable } from '@angular/core';

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

@Injectable({ providedIn: 'root' })
export class GeolocationService {
  getCurrentCoordinates(): Promise<GeoCoordinates> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalização não suportada'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) =>
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }),
        (error) => reject(error),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    });
  }

  async reverseGeocode(latitude: number, longitude: number): Promise<string> {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
      {
        headers: {
          Accept: 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Falha ao buscar endereço');
    }

    const data = (await response.json()) as { display_name?: string };
    return data.display_name ?? `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
  }

  async getCurrentAddress(): Promise<{ address: string; coordinates: GeoCoordinates }> {
    const coordinates = await this.getCurrentCoordinates();
    const address = await this.reverseGeocode(coordinates.latitude, coordinates.longitude);
    return { address, coordinates };
  }
}
