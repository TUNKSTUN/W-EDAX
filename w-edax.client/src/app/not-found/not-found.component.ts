import { Component } from '@angular/core';

@Component({
  selector: 'app-not-found',
  imports: [],
  standalone: true,
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent {
  message = "Oops! The page you're looking for doesn't exist.";
}
