import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { ContactComponent } from './contact/contact.component';
import { GuestbookComponent } from './guestbook/guestbook.component';
import { ArticlesComponent } from './article/article.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'guestbook', component: GuestbookComponent },
  { path: 'article/:id', component: ArticlesComponent },
  { path: '**', redirectTo: '', pathMatch: 'full' }, // Wildcard route should be last
];
