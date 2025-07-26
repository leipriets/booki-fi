import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-places',
  templateUrl: './places.page.html',
  styleUrls: ['./places.page.scss'],
  standalone: false
})
export class PlacesPage implements OnInit {
  isAdmin = false;

  constructor(private authService: AuthService) { }

  ngOnInit() {
    
    this.authService.email.subscribe((email) => {
      if (email == 'admin@mail.com') this.isAdmin = true;
    });
  }

  ionViewDidEnter() {
    this.authService.email.subscribe((email) => {
      if (email == 'admin@mail.com') this.isAdmin = true;
      console.log(email);
    }); 
  }

}
