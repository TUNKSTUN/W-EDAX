import { NgModule, importProvidersFrom } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FooterComponent } from './footer/footer.component';
import { RouterModule } from '@angular/router';
import { KeywordSearchComponent } from './keyword-seach/keyword-search.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { Routes } from '@angular/router';
import { routes } from './routes';
@NgModule({
  declarations: [
    AppComponent,
    FooterComponent,
    KeywordSearchComponent,
    NotFoundComponent
  ],
  imports: [
    AppModule,
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'top', // Scrolls to top on route change
    }),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
