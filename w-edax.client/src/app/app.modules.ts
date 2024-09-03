import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router'; // Import RouterModule

import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { ContactComponent } from './contact/contact.component';
import { GuestbookComponent } from './guestbook/guestbook.component';
import { FooterComponent } from './footer/footer.component'; // Import FooterComponent
import { AngularFireModule } from '@angular/fire/compat';
import { routes } from './routes'; // Import routes
import { environment } from '../environments/environment';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes), // Configure the router with the routes
    AngularFireModule.initializeApp(environment.firebaseConfig),
    HttpClientModule, FormsModule
  ],
  providers: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
