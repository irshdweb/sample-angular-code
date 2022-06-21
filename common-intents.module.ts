import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CommonIntentsRoutingModule } from './common-intents-routing.module';
import { CommonIntentsComponent } from './common-intents.component';
import { CommonIntentsCreateComponent } from './common-intents-create/common-intents-create.component';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '@app/core';
import { SharedModule } from '@app/shared';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '@app/material.module';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { ModalModule, TooltipModule } from 'ngx-bootstrap';
import { CommonIntentsViewComponent } from './common-intents-view/common-intents-view.component';

@NgModule({
  declarations: [CommonIntentsComponent, CommonIntentsCreateComponent, CommonIntentsViewComponent],
  imports: [
    CommonModule,
    CommonIntentsRoutingModule,
    TranslateModule,
    CoreModule,
    SharedModule,
    FormsModule,
    MaterialModule,
    ReactiveFormsModule,
    ScrollingModule,
    ModalModule.forRoot(),
    TooltipModule.forRoot()
  ],
  entryComponents: [CommonIntentsViewComponent]
})
export class CommonIntentsModule {}
