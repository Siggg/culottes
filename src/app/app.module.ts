import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {SuiModule} from 'ng2-semantic-ui';
import { CulottelistComponent } from './projects/culottelist/culottelist.component';
import { AboutComponent } from './about/about.component';
import { OpenelectionComponent } from './projects/electionTabs/openelection/openelection.component';
import { CompletedelectionComponent } from './projects/electionTabs/completedelection/completedelection.component';

@NgModule({
  declarations: [
    AppComponent,
    CulottelistComponent,
    AboutComponent,
    OpenelectionComponent,
    CompletedelectionComponent,
  ],
  imports: [
	SuiModule,
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
