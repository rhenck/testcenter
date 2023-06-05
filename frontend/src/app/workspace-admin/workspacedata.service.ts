import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject } from 'rxjs';
import { MainDataService } from '../shared/shared.module';
import { BackendService } from './backend.service';
import { ReportType } from './workspace.interfaces';
import { FileService } from '../shared/services/file.service';
import { MessageService } from '../shared/services/message.service';

@Injectable({
  providedIn: 'root'
})

@Injectable()
export class WorkspaceDataService {
  workspaceID!: string; // Initialized on route activation
  wsRole = 'RW';
  wsName = '';
  workspaceid$: BehaviorSubject<number>;

  constructor(
    private backendService: BackendService,
    private deleteConfirmDialog: MatDialog,
    private messageService: MessageService,
    public snackBar: MatSnackBar
  ) {
    this.workspaceid$ = new BehaviorSubject<number>(NaN);
  }

  downloadReport(dataIds: string[], reportType: ReportType, filename: string): void {
    this.backendService.getReport(this.workspaceID, reportType, dataIds)
      .subscribe((response: Blob) => {
        if (response.size > 0) {
          FileService.saveBlobToFile(response, filename);
        } else {
          this.messageService.showError('Keine Daten verfügbar.');
        }
      });
  }
}
