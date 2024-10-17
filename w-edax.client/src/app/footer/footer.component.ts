import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {

  constructor(private router: Router) {}

  navigateTo(route: string) {
    this.router.navigate([route]).then(() => {
      // Scroll to top after navigation
      window.scrollTo(0, 0);
    });
  }
}
