import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { AppRoutingModule } from "./app-routing.module";

import { AppComponent } from "./app.component";
import { MetaModule } from "./meta/meta.module";
import { CommonModule } from "@angular/common";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import {
  MatButtonModule,
  MatCardModule,
  MatFormFieldModule,
  MatInputModule,
  MatToolbarModule
} from "@angular/material";

// import { SuiModule } from "ng2-semantic-ui";
import { CulottelistComponent } from "./projects/culottelist/culottelist.component";
import { AboutComponent } from "./about/about.component";
import { OpentrialComponent } from "./projects/trials/open_trial/open_trial.component";
import { ClosedtrialComponent } from "./projects/trials/closed_trial/closed_trial.component";
import { IdComponent } from './id/id.component';
import { DonateComponent } from './donate/donate.component';
import { NewCitizenComponent } from './new-citizen/new-citizen.component';

@NgModule({
  declarations: [
    AppComponent,
    CulottelistComponent,
    AboutComponent,
    OpentrialComponent,
    ClosedtrialComponent,
    IdComponent,
    DonateComponent,
    NewCitizenComponent
  ],
  imports: [
  //  SuiModule,
    BrowserAnimationsModule,
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatToolbarModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    MetaModule,
    AppRoutingModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
