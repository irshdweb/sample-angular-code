import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { Agent } from '@app/agents/agent.model';
import { AgentService } from '@app/agents/agent.service';
import { Flow } from '@app/flows/flow.model';
import { FlowService } from '@app/flows/flow.service';
import { Callback } from '@app/shared/models/callback/callback.model';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subject, Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { CallbackService } from '../callback.service';
import * as _ from 'lodash';
import { APIResponse } from '@app/shared/services/callback-storage.service';

@Component({
  selector: 'app-create-callback',
  templateUrl: './create-callback.component.html',
  styleUrls: ['./create-callback.component.scss']
})
export class CreateCallbackComponent implements OnInit {
  title: string;
  updateCallback: Callback;
  isUpdate: boolean;
  flowId: number;

  callbackForm: FormGroup;

  agentId: string;
  flowsList: Flow[] = [];

  flowSubscription: Subscription;

  onClose: Subject<any>;

  get name(): FormControl {
    return this.callbackForm.get('name') as FormControl;
  }

  get flow(): FormControl {
    return this.callbackForm.get('flow') as FormControl;
  }

  constructor(
    public bsModalRef: BsModalRef,
    private formBuilder: FormBuilder,
    private flowService: FlowService,
    private callbackService: CallbackService,
    private ngxService: NgxUiLoaderService,
    private matSnackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.onClose = new Subject();

    this.subscribeToFlowList();

    // set current agent
    const agent = JSON.parse(localStorage.getItem('agent'));
    this.agentId = String(agent.id);

    this.initForm();

    this.listFlows();

    if (this.isUpdate) {
      this.setEditData();
    }
  }

  setEditData() {
    this.name.setValue(this.updateCallback.name);
    this.flowId = this.updateCallback.flowId;
    this.flow.setValue(this.updateCallback.flowName);

    // only if callback data has no flow name.
    this.flowService.showFlow(this.updateCallback.flowId).subscribe((response: { data: any; status_code: string }) => {
      this.flow.setValue(response.data.name);
    });
  }

  initForm() {
    this.callbackForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      flow: ['', [Validators.required, this.validateFlow]]
    });
  }

  validateFlow = (formControl: FormControl) => {
    if (formControl && formControl.valid && formControl.value && !this.flowId) {
      return {
        invalidFlow: {
          valid: false
        }
      };
    }
  };

  subscribeToFlowList() {
    // Get the flow list
    this.flowSubscription = this.flowService.flowsChanged.subscribe(
      (flows: Flow[]) => {
        this.flowsList = flows;

        if (this.flowId) {
          /* const index = _.findIndex(flows, {id: String(this.flowId)});
          if (flows[index]) {
            this.flowId = this.flowId;
            this.flow.setValue(flows[index].name);
            this.flow.disable();
          } */
          this.flowId = this.flowId;
          this.flow.disable();
        }

        this.ngxService.stopLoader('content-loader');
      },
      error => {
        this.ngxService.stopLoader('content-loader');
      }
    );
  }

  listFlows() {
    this.ngxService.startLoader('content-loader');
    this.flowService.listAgentFlows('', '', this.agentId);
  }

  /**
   * Set the flow ID when select through type ahead
   * @param event
   */
  selectFlow(event: any) {
    this.flowId = event.item.id;
    this.flow.updateValueAndValidity();
  }

  /**
   * If user manually input into flow field, reset all data
   */
  onUserManualInputFlow() {
    this.flowId = null;
    this.flow.updateValueAndValidity();
  }

  submit() {
    if (this.callbackForm.valid) {
      if (this.isUpdate) {
        this.update();
      } else {
        this.create();
      }
    } else {
      this.name.markAsTouched();
      this.flow.markAsTouched();

      this.matSnackBar.open('Please fill the fields with correct data.', 'x', {
        duration: 5000,
        horizontalPosition: 'end',
        panelClass: 'error-msg'
      });
    }
  }

  create() {
    const callback = new Callback();
    callback.name = this.name.value;
    callback.flowId = this.flowId;
    this.ngxService.startLoader('content-loader');
    this.callbackService.create(callback).subscribe(
      (res: APIResponse<Callback>) => {
        this.ngxService.stopLoader('content-loader');
        if (res.status_code === 'SUCCESS') {
          this.matSnackBar.open('Callback created successfully.', 'x', {
            duration: 5000,
            horizontalPosition: 'end',
            panelClass: 'success-msg'
          });
          this.bsModalRef.hide();
          this.onClose.next(res.data);
        } else {
          this.matSnackBar.open('Failed to create callback.', 'x', {
            duration: 5000,
            horizontalPosition: 'end',
            panelClass: 'error-msg'
          });
        }
      },
      (err: { data: any; status_code: string }) => {
        this.ngxService.stopLoader('content-loader');
        if (err.status_code === 'DUPLICATE_RECORD') {
          this.matSnackBar.open('Record exists with same callback name.', 'x', {
            duration: 5000,
            horizontalPosition: 'end',
            panelClass: 'error-msg'
          });
        } else {
          this.matSnackBar.open('Failed to create callback.', 'x', {
            duration: 5000,
            horizontalPosition: 'end',
            panelClass: 'error-msg'
          });
        }
      }
    );
  }

  update() {
    this.updateCallback.name = this.name.value;
    this.updateCallback.flowId = this.flowId;
    this.ngxService.startLoader('content-loader');
    this.callbackService.update(this.updateCallback).subscribe(
      (res: { data: any; status_code: string }) => {
        this.ngxService.stopLoader('content-loader');
        if (res.status_code === 'SUCCESS') {
          this.matSnackBar.open('Callback has been updated successfully.', 'x', {
            duration: 5000,
            horizontalPosition: 'end',
            panelClass: 'success-msg'
          });
          this.bsModalRef.hide();
          this.onClose.next();
        } else {
          this.matSnackBar.open('Failed to update callback.', 'x', {
            duration: 5000,
            horizontalPosition: 'end',
            panelClass: 'error-msg'
          });
        }
      },
      (err: { data: any; status_code: string }) => {
        this.ngxService.stopLoader('content-loader');
        if (err.status_code === 'DUPLICATE_RECORD') {
          this.matSnackBar.open('Record exists with same callback name.', 'x', {
            duration: 5000,
            horizontalPosition: 'end',
            panelClass: 'error-msg'
          });
        } else {
          this.matSnackBar.open('Failed to update callback.', 'x', {
            duration: 5000,
            horizontalPosition: 'end',
            panelClass: 'error-msg'
          });
        }
      }
    );
  }

  reset() {
    this.callbackForm.reset();
  }
}
