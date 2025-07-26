import { Component, OnInit } from '@angular/core';
import { AuthResponseData, AuthService } from './auth.service';
import { AlertController, LoadingController } from '@ionic/angular';

import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
  standalone: false,
})
export class AuthPage implements OnInit {
  isLoading = false;
  isLogin = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {}

  authenticate(email: string, password: string) {
    this.isLoading = true;

    this.loadingCtrl
      .create({
        keyboardClose: true,
        message: 'Logging in...',
        spinner: 'dots',
      })
      .then((loadingEl) => {
        loadingEl.present();
        let authObs: Observable<AuthResponseData>;
        console.log('Is Login:', this.isLogin);

        if (this.isLogin) {
          authObs = this.authService.login(email, password);
        } else {
          authObs = this.authService.signup(email, password);
        }

        authObs.subscribe(
          (resData) => {
            this.isLoading = false;
            loadingEl.dismiss();
            this.router.navigateByUrl('/places/tabs/discover');
          },
          (errRes) => {
            this.isLoading = false;
            loadingEl.dismiss();

            const code = errRes.error?.error?.message;
            let message = 'Could not sign you up. Please try again.';

            if (code === 'EMAIL_EXISTS') {
              message = 'This email address already exists!';
            } else if (code === 'EMAIL_NOT_FOUND') {
              message = 'This email address could not be found!';
            } else if (code === 'INVALID_PASSWORD') {
              message = 'This password is not correct!';  
            } else if (code === 'INVALID_LOGIN_CREDENTIALS') {
              message = 'Invalid login credentials. Please try again.';
            }

            this.showAlert(message);
          }
        );
      });
  }

  onSubmit(form: NgForm) {
    console.log(form);
    if (!form.valid) {
      return;
    }

    const email = form.value.email;
    const password = form.value.password;

    this.authenticate(email, password);
    form.reset();
  }

  private showAlert(message: string) {
    this.alertCtrl
      .create({
        header: 'Authentication failed',
        message: message,
        buttons: ['Okay'],
      })
      .then((alertEl) => {
        alertEl.present();
      });
  }

  onSwitchAuthMode() {
    this.isLogin = !this.isLogin;
  }
}
