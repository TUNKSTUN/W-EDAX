import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private apiUrl: string = '';

  constructor() {
    // Fetch the API URL from an external source or environment variable
    this.apiUrl = environment.apiUrl; // Set this dynamically from environment or config file
  }

  getApiUrl(): string {
    return this.apiUrl;
  }
}
