import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { routes } from './app/routes';
import { FIREBASE_OPTIONS } from '@angular/fire/compat';
import { AuthService } from './app/Services/auth.service'
import { provideFirebaseApp } from '@angular/fire/app';
import { provideAuth } from '@angular/fire/auth';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { environment } from './environments/environment';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => getAuth()),
    { provide: FIREBASE_OPTIONS, useValue: environment.firebaseConfig },
  ]
}).catch(err => console.error(err));
