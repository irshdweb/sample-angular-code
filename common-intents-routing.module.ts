import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Shell } from '@app/shell/shell.service';
import { extract } from '@app/core';
import { CommonIntentsComponent } from '@app/common-intents/common-intents.component';
import { CommonIntentsCreateComponent } from '@app/common-intents/common-intents-create/common-intents-create.component';

const routes: Routes = [
  Shell.childRoutes([
    { path: 'common-intents', component: CommonIntentsComponent, data: { title: extract('Common Intents') } },
    {
      path: 'common-intents/create',
      component: CommonIntentsCreateComponent,
      data: { title: extract('Create Common Intents') }
    },
    {
      path: 'common-intents/update/:id',
      component: CommonIntentsCreateComponent,
      data: { title: extract('Update Common Intents') }
    }
  ])
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CommonIntentsRoutingModule {}
