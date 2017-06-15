import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule, Routes } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

import { ControlComponent } from '../control/control.component';
import { WatchComponent } from '../watch/watch.component';

const appRoutes: Routes = [
  { path: '', redirectTo: '/control', pathMatch: 'full' },
  { path: 'control', component: ControlComponent },
  { path: 'watch', component: WatchComponent },
]

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(appRoutes),
    FlexLayoutModule,
  ],
  declarations: [
    ControlComponent,
    WatchComponent,
  ],
  exports: [ RouterModule ]
})
export class RoutingModule { }
