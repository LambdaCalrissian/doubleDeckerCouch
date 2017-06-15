import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { HttpModule } from '@angular/http';

import { RoutingModule } from './routing/routing.module';

import { WebsocketService } from './websocket.service';
import { SoundService } from './sound.service';

import { AppComponent } from './app.component';
import { RouteContentComponent } from './route-content/route-content.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';

@NgModule({
  imports: [
    RoutingModule,
    BrowserModule,
    FlexLayoutModule,
    HttpModule,
  ],
  declarations: [
    AppComponent,
    RouteContentComponent,
    HeaderComponent,
    FooterComponent,
  ],
  providers: [
    WebsocketService,
    SoundService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
