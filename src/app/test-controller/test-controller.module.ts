import { IqbComponentsModule } from 'iqb-components';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ReviewDialogComponent } from './components/review-dialog/review-dialog.component';
import { unitRouteGuards } from './routing/unit-route-guards';
import { TestControllerComponent } from './components/test-controller/test-controller.component';
import { UnithostComponent } from './components/unithost/unithost.component';
import { TestControllerRoutingModule } from './routing/test-controller-routing.module';
import { TestStatusComponent } from './components/test-status/test-status.component';
import { UnitMenuComponent } from './components/unit-menu/unit-menu.component';
import { testControllerRouteGuards } from './routing/test-controller-route-guards';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';

export { TestControllerService } from './services/test-controller.service';

@NgModule({
  imports: [
    CommonModule,
    TestControllerRoutingModule,
    MatProgressSpinnerModule,
    FlexLayoutModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatCheckboxModule,
    MatRadioModule,
    ReactiveFormsModule,
    MatCardModule,
    MatDialogModule,
    MatProgressBarModule,
    MatInputModule,
    MatFormFieldModule,
    MatMenuModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    IqbComponentsModule.forChild(),
    DragDropModule,
    MatButtonToggleModule,
    FormsModule,
    MatSidenavModule,
    MatDividerModule
    MatListModule
  ],
  declarations: [
    UnithostComponent,
    TestControllerComponent,
    ReviewDialogComponent,
    TestStatusComponent,
    UnitMenuComponent
  ],
  entryComponents: [
    ReviewDialogComponent
  ],
  providers: [
    unitRouteGuards,
    testControllerRouteGuards
  ],
  exports: [
    TestControllerComponent
  ]
})
export class TestControllerModule {}
