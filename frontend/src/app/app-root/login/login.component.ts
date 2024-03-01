import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { matchesUA } from 'browserslist-useragent';
import UAParser from 'ua-parser-js';
import { MainDataService } from '../../shared/shared.module';
import { AuthData } from '../../app.interfaces';
import { BackendService } from '../../backend.service';
import browsersJson from '../../../../../definitions/browsers.json';

@Component({
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit, OnDestroy {
  static oldLoginName = '';
  private routingSubscription: Subscription | null = null;
  returnTo = '';
  problemText = '';
  problemCode = 0;
  showPassword = false;
  unsupportedBrowser: string[] = [];

  loginForm = new FormGroup({
    name: new FormControl(LoginComponent.oldLoginName, [Validators.required, Validators.minLength(3)]),
    pw: new FormControl('')
  });

  constructor(
    public mainDataService: MainDataService,
    private backendService: BackendService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.mainDataService.appSubTitle$.next('Bitte anmelden');
    this.routingSubscription = this.route.params
      .subscribe(params => { this.returnTo = params.returnTo; });
    this.checkBrowser();
  }

  login(loginType: 'admin' | 'login' = 'login'): void {
    const loginData = this.loginForm.value;
    if (!loginData.name) {
      return;
    }
    LoginComponent.oldLoginName = loginData.name;
    this.problemText = '';
    this.problemCode = 0;
    this.backendService.login(loginType, loginData.name, loginData.pw ?? '').subscribe({
      next: authData => {
        const authDataTyped = authData as AuthData;
        this.mainDataService.setAuthData(authDataTyped);
        if (this.returnTo) {
          this.router.navigateByUrl(this.returnTo).then(navOk => {
            if (!navOk) {
              this.router.navigate(['/r']);
            }
          });
        } else if (!authData.flags.includes('codeRequired') && loginType === 'login') {
          if (authData.claims.test && authData.claims.test.length === 1 && Object.keys(authData.claims).length === 1) {
            this.backendService.startTest(authData.claims.test[0].id).subscribe(testId => {
              this.router.navigate(['/t', testId]);
            });
          } else {
            this.router.navigate(['/r/starter']);
          }
        } else {
          this.router.navigate(['/r']);
        }
      },
      error: error => {
        this.problemCode = error.code;
        if (error.code === 400) {
          this.problemText = 'Anmeldedaten sind nicht gültig. Bitte noch einmal versuchen!';
        } else if (error.code === 401) {
          this.problemText = 'Anmeldung abgelehnt. Anmeldedaten sind noch nicht freigeben.';
        } else if (error.code === 204) {
          this.problemText = 'Anmeldedaten sind gültig, aber es sind keine Arbeitsbereiche oder Tests freigegeben.';
        } else if (error.code === 410) {
          this.problemText = 'Anmeldedaten sind abgelaufen';
        } else {
          this.problemText = 'Problem bei der Anmeldung.';
          throw error;
        }
        this.loginForm.reset();
      }
    });
  }

  clearWarning(): void {
    this.problemText = '';
    this.problemCode = 0;
  }

  private checkBrowser() {
    const browser = new UAParser().getBrowser();

    let userAgent: string = window.navigator.userAgent;
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1805967
    if ((browser.name === 'Firefox') && (userAgent.match(/rv:109/))) {
      userAgent = userAgent.replace(/rv:109/, `rv:${browser.version}`);
    }

    this.unsupportedBrowser =
      matchesUA(userAgent, { path: 'dont let me empty', browsers: browsersJson.browsers }) ?
        [] :
        [browser.name ?? '--', browser.version ?? '--'];
  }

  ngOnDestroy(): void {
    if (this.routingSubscription !== null) {
      this.routingSubscription.unsubscribe();
    }
  }
}
