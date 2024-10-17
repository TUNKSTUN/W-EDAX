import { importProvidersFrom, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth, Auth } from '@angular/fire/auth';
import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { GuestbookComponent } from './guestbook/guestbook.component';
import { FIREBASE_OPTIONS } from '@angular/fire/compat';
import { AuthService } from './Services/auth.service'
import { routes } from './routes'
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FooterComponent } from './footer/footer.component';
import { RouterModule } from '@angular/router';
import { KeywordSearchComponent } from './keyword-seach/keyword-search.component';

@NgModule({
  declarations: [
    AppComponent,
    FooterComponent,
    KeywordSearchComponent
    // other components
  ],
  imports: [
    AppModule,
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
