import { MatTableDataSource } from '@angular/material/table';
import { ViewChild, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { FormGroup } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import {
  ConfirmDialogComponent, ConfirmDialogData,
  MessageDialogComponent, MessageDialogData, MessageType, MainDataService
} from '../../shared/shared.module';
import { BackendService } from '../backend.service';
import { NewworkspaceComponent } from './newworkspace/newworkspace.component';
import { EditworkspaceComponent } from './editworkspace/editworkspace.component';
import { IdAndName, IdRoleData } from '../superadmin.interfaces';

@Component({
  templateUrl: './workspaces.component.html',
  styleUrls: ['./workspaces.component.css']
})
export class WorkspacesComponent implements OnInit {
  workspaces: MatTableDataSource<IdAndName>;
  displayedColumns = ['selectCheckbox', 'name'];
  tableSelectionCheckbox = new SelectionModel <IdAndName>(true, []);
  tableSelectionRow = new SelectionModel <IdAndName>(false, []);
  selectedWorkspaceId = 0;
  selectedWorkspaceName = '';
  pendingUserChanges = false;
  userListDatasource: MatTableDataSource<IdRoleData>;
  displayedUserColumns = ['selectCheckbox', 'name'];

  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private backendService: BackendService,
    private mainDataService: MainDataService,
    private newWorkspaceDialog: MatDialog,
    private editworkspaceDialog: MatDialog,
    private deleteConfirmDialog: MatDialog,
    private messsageDialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.tableSelectionRow.changed.subscribe(
      r => {
        if (r.added.length > 0) {
          this.selectedWorkspaceId = r.added[0].id;
          this.selectedWorkspaceName = r.added[0].name;
        } else {
          this.selectedWorkspaceId = 0;
          this.selectedWorkspaceName = '';
        }
        this.updateUserList();
      }
    );
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.mainDataService.showLoadingAnimation();
      this.updateWorkspaceList();
    });
  }

  addObject(): void {
    const dialogRef = this.newWorkspaceDialog.open(NewworkspaceComponent, {
      width: '600px',
      data: {
        name: ''
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) {
        return;
      }

      const newName = (<FormGroup>result).get('name').value;
      if (this.workspaceNameExists(newName)) {
        this.snackBar.open('Arbeitsbereich mit diesem namen bereits vorhanden!', 'Fehler', { duration: 1000 });
        return;
      }

      this.backendService.addWorkspace(newName)
        .subscribe(() => {
          this.snackBar.open('Arbeitsbereich hinzugefügt', '', { duration: 1000 });
          this.updateWorkspaceList();
        });
    });
  }

  private workspaceNameExists(newName: string): boolean {
    return this.workspaces.data
      .map(ws => ws.name)
      .includes(newName);
  }

  changeObject(): void {
    let selectedRows = this.tableSelectionRow.selected;
    if (selectedRows.length === 0) {
      selectedRows = this.tableSelectionCheckbox.selected;
    }
    if (selectedRows.length === 0) {
      this.messsageDialog.open(MessageDialogComponent, {
        width: '400px',
        data: <MessageDialogData>{
          title: 'Arbeitsbereich ändern',
          content: 'Bitte markieren Sie erst einen Arbeitsbereich!',
          type: MessageType.error
        }
      });
    } else {
      const dialogRef = this.editworkspaceDialog.open(EditworkspaceComponent, {
        width: '600px',
        data: selectedRows[0].name
      });

      dialogRef.afterClosed().subscribe(result => {
        if (typeof result !== 'undefined') {
          if (result !== false) {
            this.mainDataService.showLoadingAnimation();
            this.backendService.renameWorkspace(
              selectedRows[0].id,
              (<FormGroup>result).get('name').value
            )
              .subscribe(
                respOk => {
                  if (respOk !== false) {
                    this.snackBar.open('Arbeitsbereich geändert', '', { duration: 1000 });
                    this.updateWorkspaceList();
                  } else {
                    this.mainDataService.stopLoadingAnimation();
                    this.snackBar.open('Konnte Arbeitsbereich nicht ändern', 'Fehler', { duration: 2000 });
                  }
                }
              );
          }
        }
      });
    }
  }

  deleteObject(): void {
    let selectedRows = this.tableSelectionCheckbox.selected;
    if (selectedRows.length === 0) {
      selectedRows = this.tableSelectionRow.selected;
    }
    if (selectedRows.length === 0) {
      this.messsageDialog.open(MessageDialogComponent, {
        width: '400px',
        data: <MessageDialogData>{
          title: 'Löschen von Arbeitsbereichen',
          content: 'Bitte markieren Sie erst Arbeitsbereich/e!',
          type: MessageType.error
        }
      });
    } else {
      let prompt;
      if (selectedRows.length > 1) {
        prompt = `Sollen ${selectedRows.length} Arbeitsbereiche gelöscht werden?`;
      } else {
        prompt = `Arbeitsbereich "${selectedRows[0].name}" gelöscht werden?`;
      }
      const dialogRef = this.deleteConfirmDialog.open(ConfirmDialogComponent, {
        width: '400px',
        data: <ConfirmDialogData>{
          title: 'Löschen von Arbeitsbereichen',
          content: prompt,
          confirmbuttonlabel: 'Arbeitsbereich/e löschen',
          showcancel: true
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result !== false) {
          const workspacesToDelete = [];
          selectedRows.forEach((r: IdAndName) => workspacesToDelete.push(r.id));
          this.mainDataService.showLoadingAnimation();
          this.backendService.deleteWorkspaces(workspacesToDelete).subscribe(
            respOk => {
              if (respOk !== false) {
                this.snackBar.open('Arbeitsbereich/e gelöscht', '', { duration: 1000 });
                this.updateWorkspaceList();
              } else {
                this.mainDataService.stopLoadingAnimation();
                this.snackBar.open('Konnte Arbeitsbereich/e nicht löschen', 'Fehler', { duration: 1000 });
              }
            }
          );
        }
      });
    }
  }

  updateUserList(): void {
    this.pendingUserChanges = false;
    if (this.selectedWorkspaceId > 0) {
      this.mainDataService.showLoadingAnimation();
      this.backendService.getUsersByWorkspace(this.selectedWorkspaceId).subscribe(dataresponse => {
        this.userListDatasource = new MatTableDataSource(dataresponse);
        this.mainDataService.stopLoadingAnimation();
      });
    } else {
      this.userListDatasource = null;
    }
  }

  selectUser(ws: IdRoleData, role: string): void {
    if (ws.role === role) {
      ws.role = '';
    } else {
      ws.role = role;
    }
    this.pendingUserChanges = true;
  }

  saveUsers():void {
    this.pendingUserChanges = false;
    if (this.selectedWorkspaceId > 0) {
      this.mainDataService.showLoadingAnimation();
      this.backendService.setUsersByWorkspace(this.selectedWorkspaceId, this.userListDatasource.data).subscribe(
        respOk => {
          this.mainDataService.stopLoadingAnimation();
          if (respOk !== false) {
            this.snackBar.open('Zugriffsrechte geändert', '', { duration: 1000 });
          } else {
            this.snackBar.open('Konnte Zugriffsrechte nicht ändern', 'Fehler', { duration: 2000 });
          }
        }
      );
    } else {
      this.userListDatasource = null;
    }
  }

  updateWorkspaceList(): void {
    this.backendService.getWorkspaces().subscribe(dataresponse => {
      this.workspaces = new MatTableDataSource(dataresponse);
      this.workspaces.sort = this.sort;
      this.tableSelectionCheckbox.clear();
      this.tableSelectionRow.clear();
    });
  }

  isAllSelected(): boolean {
    const numSelected = this.tableSelectionCheckbox.selected.length;
    const numRows = this.workspaces.data.length;
    return numSelected === numRows;
  }

  masterToggle(): void {
    if (this.isAllSelected()) {
      this.tableSelectionCheckbox.clear();
    } else {
      this.workspaces.data.forEach(row => this.tableSelectionCheckbox.select(row));
    }
  }

  selectRow(row: IdAndName): void {
    this.tableSelectionRow.select(row);
  }
}
