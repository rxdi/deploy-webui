import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ListComponent } from './list/list.component';
import { DetailsComponent } from './details/details.component';

const routes: Routes = [
  {
    path: '', pathMatch: 'full', redirectTo: 'list'
  },
  {
    path: 'list', component: ListComponent
  },
  {
    path: 'details/:file', component: DetailsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FoldersRoutingModule { }
