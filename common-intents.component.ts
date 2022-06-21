import { Component, OnDestroy, OnInit } from '@angular/core';
import { Intent } from '@app/intents/intent.model';
import { Subscription } from 'rxjs';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { IntentService } from '@app/intents/intent.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { PermissionsService } from '@app/core/authentication/permissions.service';
import permissionCodes from '../../assets/data/cam_permission_codes.json';
import { IntentViewComponent } from '@app/intents/intent-view/intent-view.component';
import { ConfirmModalComponent } from '@app/shared/components/confirm-modal/confirm-modal.component';
import { extract } from '@app/core';
import { MatRadioButton, MatRadioChange } from '@angular/material/radio';
import { IntentPermissionContext } from '@app/intents/intents.component';
import { CommonIntentsService } from '@app/common-intents/common-intents.service';
import { CommonIntentsModel } from '@app/shared/models/common-intents.model';
import { CommonIntentsViewComponent } from '@app/common-intents/common-intents-view/common-intents-view.component';

@Component({
  selector: 'app-common-intents',
  templateUrl: './common-intents.component.html',
  styleUrls: ['./common-intents.component.scss']
})
export class CommonIntentsComponent implements OnInit, OnDestroy {
  intents: CommonIntentsModel[];
  subscription: Subscription;
  bsModalRef: BsModalRef;
  searchInput: FormControl = new FormControl('');
  intentPermissions: IntentPermissionContext;

  constructor(
    private router: Router,
    private commonIntentsService: CommonIntentsService,
    private bsModalService: BsModalService,
    private matSnackBar: MatSnackBar,
    private ngxService: NgxUiLoaderService,
    private permissionService: PermissionsService
  ) {}

  ngOnInit(): void {
    this.listIntents();
    // TODO Pls note this can not be done in *ngIf function call in view since it runs several time
    // Get and set existing permission for button actions
    this.intentPermissions = {
      list: this.permissionService.isAllowedPermission(permissionCodes.STT_INTENT_LIST),
      create: this.permissionService.isAllowedPermission(permissionCodes.STT_INTENT_CREATE),
      view: this.permissionService.isAllowedPermission(permissionCodes.STT_INTENT_VIEW),
      update: this.permissionService.isAllowedPermission(permissionCodes.STT_INTENT_UPDATE),
      delete: this.permissionService.isAllowedPermission(permissionCodes.STT_INTENT_DELETE)
    };
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * List intents for index and search
   * @param name
   */
  listIntents(name: string = '') {
    this.ngxService.startLoader('content-loader');
    this.subscription = this.commonIntentsService.list(name).subscribe((intents: CommonIntentsModel[]) => {
      this.intents = intents;
      this.ngxService.stopLoader('content-loader');
    });
  }

  /**
   * Intent name search
   */
  search() {
    this.listIntents(this.searchInput.value);
  }

  /**
   * Clear search field and re fetch intents
   */
  clearSearch() {
    this.searchInput.setValue('');
    this.listIntents('');
  }

  /**
   * Load edit view with details
   * @param data
   */
  editIntent(data: any) {
    this.router.navigate([`/common-intents/update/${data.id}`]);
  }

  /**
   * View intent details na popup
   * @param intent
   */
  viewIntent(intent: CommonIntentsModel) {
    // Check if the user has view permission
    if (this.intentPermissions.view) {
      const initialState = {
        title: 'View Common Intent Details',
        intent: intent
      };
      this.bsModalRef = this.bsModalService.show(CommonIntentsViewComponent, { initialState });
    } else {
      this.matSnackBar.open('You have not been authorized to view this intent', 'X', {
        duration: 5000,
        horizontalPosition: 'end',
        panelClass: 'error-msg'
      });
    }
  }

  /**
   * Copy to clipboard
   * TODO got this solution form stake overflow
   * @param data intent data
   */
  copyUrl(data: any) {
    document.addEventListener('copy', (event: ClipboardEvent) => {
      event.clipboardData.setData('text/plain', data.unique_id);
      event.preventDefault();
      document.removeEventListener('copy', null);
    });
    document.execCommand('copy');
    this.matSnackBar.open('Intent Code Copied', 'X', {
      duration: 5000,
      horizontalPosition: 'end',
      panelClass: 'success-msg'
    });
  }

  /**
   * Handles the delete event of the list
   * @param id
   * @param index
   */
  openConfirmDialog(id: number, index: number) {
    const config = {
      class: 'modal-danger',
      ignoreBackdropClick: true,
      initialState: {
        style: 'alert-danger'
      }
    };
    this.bsModalRef = this.bsModalService.show(ConfirmModalComponent, config);
    this.bsModalRef.content.onClose.subscribe((result: any) => {
      if (result) {
        this.ngxService.startLoader('content-loader');
        this.commonIntentsService.delete(id).subscribe(
          (response: { status_code: string }) => {
            if (response.status_code === 'SUCCESS') {
              this.matSnackBar.open(extract('Intent deleted successfully'), 'X', {
                duration: 5000,
                horizontalPosition: 'end',
                panelClass: 'success-msg'
              });
              this.intents.splice(index, 1);
            } else if (response.status_code === 'RECORD_HAS_DEPENDENCIES') {
              this.matSnackBar.open(extract('Intent in use.'), 'X', {
                duration: 5000,
                horizontalPosition: 'end',
                panelClass: 'error-msg'
              });
            }
            this.ngxService.stopLoader('content-loader');
          },
          (error: { status_code: string }) => {
            if (error && error.status_code === 'RECORD_HAS_DEPENDENCIES') {
              this.matSnackBar.open(extract('Intent in use.'), 'X', {
                duration: 5000,
                horizontalPosition: 'end',
                panelClass: 'error-msg'
              });
            }
            this.ngxService.stopLoader('content-loader');
          }
        );
      }
    });
  }
}
