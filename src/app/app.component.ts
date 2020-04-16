import { MainDataService } from './maindata.service';
import {Component, OnDestroy, OnInit} from '@angular/core';
import { BackendService } from './backend.service';
import { LoginData } from './app.interfaces';
import {CustomtextService, ServerError} from 'iqb-components';
import { appconfig } from './app.config';
import {Subscription} from "rxjs";
import {debounceTime} from "rxjs/operators";

@Component({
  selector: 'tc-root',
  templateUrl: './app.component.html',
  // styleUrls: ['./app.component.scss']
})


export class AppComponent implements OnInit, OnDestroy {
  private appErrorSubscription: Subscription = null;
  showError = false;
  private appDelayedProcessesSubscription: Subscription = null;
  showSpinner = false;

  constructor (
    public mds: MainDataService,
    private bs: BackendService,
    private cts: CustomtextService
  ) { }

  private static getStringFromLocalStorage(key: string) {
    const storageEntry = localStorage.getItem(key);
    if (storageEntry !== null) {
      if (storageEntry.length > 0) {
        return (storageEntry as string);
      }
    }
    return '';
  }

  closeErrorBox() {
    this.showError = false;
  }

  ngOnInit() {
    setTimeout(() => {
      this.mds.addCustomtextsFromDefList(appconfig.customtextsApp);
      this.mds.addCustomtextsFromDefList(appconfig.customtextsLogin);
      this.mds.addCustomtextsFromDefList(appconfig.customtextsBooklet);

      this.appErrorSubscription = this.mds.appError$.subscribe(err => {
        if (err) {
          this.showError = true;
        }
      });

      this.appDelayedProcessesSubscription = this.mds.delayedProcessesCount$.pipe(
        debounceTime(500)
      ).subscribe( c => {
        this.showSpinner = c > 0;
      });

      window.addEventListener('message', (event: MessageEvent) => {
        const msgData = event.data;
        const msgType = msgData['type'];
        if ((msgType !== undefined) && (msgType !== null)) {
          if (msgType.substr(0, 3) === 'vo.') {
            this.mds.postMessage$.next(event);
          }
        }
      });

      this.bs.getSysConfig().subscribe(sc => {
        this.mds.setDefaultCustomtexts(sc);
        this.mds.addCustomtextsFromDefList(appconfig.customtextsApp);
        // restore login status if stored in localStorage
        const adminToken = AppComponent.getStringFromLocalStorage('at');
        if (adminToken) {
          this.bs.getAdminSession(adminToken).subscribe(
            (admindata: LoginData) => {
              if (admindata instanceof ServerError) {
                this.mds.setNewLoginData();
              } else {
                this.mds.setNewLoginData(admindata);
              }
            }
          );
        } else {
          const loginToken = AppComponent.getStringFromLocalStorage('lt');
          if (loginToken) {
            const personToken = AppComponent.getStringFromLocalStorage('pt');
            const code = AppComponent.getStringFromLocalStorage('c');

            this.bs.getSession(loginToken, personToken).subscribe(ld => {
              if (ld instanceof ServerError) {
                this.mds.setNewLoginData();
              } else {
                const loginData = ld as LoginData;
                loginData.loginToken = loginToken;
                loginData.personToken = personToken;
                if (personToken.length === 0) {
                  loginData.code = code;
                  loginData.testId = 0;
                }
                this.mds.setNewLoginData(loginData);
                if (loginData.customTexts) {
                  this.cts.addCustomTexts(loginData.customTexts);
                }
              }
            });
          } else {
            this.mds.setNewLoginData();
            this.mds.addCustomtextsFromDefList(appconfig.customtextsLogin);
            this.mds.addCustomtextsFromDefList(appconfig.customtextsBooklet);
          }
        }
      });
    });
  }

  ngOnDestroy() {
    if (this.appErrorSubscription !== null) {
      this.appErrorSubscription.unsubscribe();
    }
    if (this.appDelayedProcessesSubscription !== null) {
      this.appDelayedProcessesSubscription.unsubscribe();
    }
  }
}
