import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule, Routes } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

import { ControlComponent } from '../control/control.component';
import { WatchComponent } from '../watch/watch.component';
import { VrViewerComponent } from '../vr-viewer/vr-viewer.component';

const appRoutes: Routes = [
  { path: '', redirectTo: '/control', pathMatch: 'full' },
  { path: 'control', component: ControlComponent },
  { path: 'watch', component: WatchComponent },
  { path: 'vr', component: VrViewerComponent },
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
    VrViewerComponent,
  ],
  exports: [ RouterModule ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
  ],
})
export class RoutingModule { }
