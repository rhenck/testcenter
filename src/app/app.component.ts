import {
  Component, Inject, OnDestroy, OnInit
} from '@angular/core';
import { Subscription } from 'rxjs';
import { CustomtextService } from 'iqb-components';
import { MainDataService } from './maindata.service';
import { BackendService } from './backend.service';
import { AppError } from './app.interfaces';

@Component({
  selector: 'tc-root',
  templateUrl: './app.component.html'
})

export class AppComponent implements OnInit, OnDestroy {
  private appErrorSubscription: Subscription = null;

  showError = false;

  errorData: AppError;

  constructor(
    public mds: MainDataService,
    private bs: BackendService,
    private cts: CustomtextService,
    @Inject('API_VERSION_EXPECTED') private readonly expectedApiVersion: string
  ) { }

  private static isValidVersion(expectedVersion: string, reportedVersion: string): boolean {
    if (expectedVersion) {
      const searchPattern = /\d+/g;
      const expectedVersionNumbers = expectedVersion.match(searchPattern);
      if (!expectedVersionNumbers) {
        return false;
      }
      if (!reportedVersion) {
        return false;
      }
      const reportedVersionNumbers = reportedVersion.match(searchPattern);
      if (!reportedVersionNumbers) {
        return false;
      }
      if (reportedVersionNumbers[0] !== expectedVersionNumbers[0]) {
        return false;
      }
      if (expectedVersionNumbers.length > 1) {
        if ((reportedVersionNumbers.length < 2) || +reportedVersionNumbers[1] < +expectedVersionNumbers[1]) {
          return false;
        }
        if ((expectedVersionNumbers.length > 2) && reportedVersionNumbers[1] === expectedVersionNumbers[1]) {
          if ((reportedVersionNumbers.length < 3) || +reportedVersionNumbers[2] < +expectedVersionNumbers[2]) {
            return false;
          }
        }
      }
    }
    return true;
  }

  private static localTime(date: Date): string {
    const year = date.getFullYear();
    const month = (`0${date.getMonth() + 1}`).slice(-2);
    const day = (`0${date.getDate()}`).slice(-2);
    const hours = (`0${date.getHours()}`).slice(-2);
    const minutes = (`0${date.getMinutes()}`).slice(-2);
    const seconds = (`0${date.getSeconds()}`).slice(-2);
    return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
  }

  closeErrorBox(): void {
    this.showError = false;
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.mds.appConfig.setDefaultCustomTexts();

      this.appErrorSubscription = this.mds.appError$.subscribe(err => {
        if (err && !this.mds.errorReportingSilent) {
          this.errorData = err;
          this.showError = true;
        }
      });

      window.addEventListener('message', (event: MessageEvent) => {
        const msgData = event.data;
        const msgType = msgData.type;
        if ((msgType !== undefined) && (msgType !== null)) {
          if (msgType.substr(0, 2) === 'vo') {
            this.mds.postMessage$.next(event);
          }
        }
      });

      this.setupFocusListeners();

      this.bs.getSysConfig().subscribe(sysConfig => {
        if (!sysConfig) {
          this.mds.isApiValid = false; // push on this.mds.appError$ ?
          return;
        }
        this.cts.addCustomTexts(sysConfig.customTexts);
        const authData = MainDataService.getAuthData();
        if (authData) {
          this.cts.addCustomTexts(authData.customTexts);
        }
        this.mds.isApiValid = AppComponent.isValidVersion(this.expectedApiVersion, sysConfig.version);
        if (!this.mds.isApiValid) {
          this.mds.appError$.next({
            label: 'Server-Problem: API-Version ungültig',
            description: `erwartet: ${this.expectedApiVersion}, gefunden: ${sysConfig.version}`,
            category: 'FATAL'
          });
        }
        const clientTime = new Date();
        const serverTime = new Date(sysConfig.serverTimestamp);
        if (Math.abs(sysConfig.serverTimestamp - clientTime.getTime()) > 90000) {
          this.mds.appError$.next({
            label: 'Server- und Client-Uhr stimmen nicht überein.',
            description: `Server-Zeit: ${AppComponent.localTime(serverTime)}, 
              Client-Zeit: ${AppComponent.localTime(clientTime)}`,
            category: 'FATAL'
          });
        }
        this.mds.setTestConfig(sysConfig.testConfig);
      });

      this.bs.getSysCheckInfo().subscribe(sysChecks => {
        this.mds.sysCheckAvailable = !!sysChecks;
      });
    });
  }

  private setupFocusListeners() {
    let hidden = '';
    let visibilityChange = '';
    if (typeof document.hidden !== 'undefined') { // Opera 12.10 and Firefox 18 and later support
      hidden = 'hidden';
      visibilityChange = 'visibilitychange';
      // eslint-disable-next-line @typescript-eslint/dot-notation
    } else if (typeof document['msHidden'] !== 'undefined') {
      hidden = 'msHidden';
      visibilityChange = 'msvisibilitychange';
      // eslint-disable-next-line @typescript-eslint/dot-notation
    } else if (typeof document['mozHidden'] !== 'undefined') {
      hidden = 'mozHidden';
      visibilityChange = 'mozHidden';
      // eslint-disable-next-line @typescript-eslint/dot-notation
    } else if (typeof document['webkitHidden'] !== 'undefined') {
      hidden = 'webkitHidden';
      visibilityChange = 'webkitvisibilitychange';
    }
    if (hidden && visibilityChange) {
      document.addEventListener(visibilityChange, () => {
        this.mds.appWindowHasFocus$.next(!document[hidden]);
      }, false);
    }
    window.addEventListener('blur', () => {
      this.mds.appWindowHasFocus$.next(document.hasFocus());
    });
    window.addEventListener('focus', () => {
      this.mds.appWindowHasFocus$.next(document.hasFocus());
    });
    window.addEventListener('unload', () => {
      this.mds.appWindowHasFocus$.next(!document[hidden]);
    });
  }

  ngOnDestroy(): void {
    if (this.appErrorSubscription !== null) {
      this.appErrorSubscription.unsubscribe();
    }
  }
}
