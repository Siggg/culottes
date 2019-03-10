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

import { SuiModule } from "ng2-semantic-ui";
import { CulottelistComponent } from "./projects/culottelist/culottelist.component";
import { AboutComponent } from "./about/about.component";
import { OpenelectionComponent } from "./projects/electionTabs/openelection/openelection.component";
import { CompletedelectionComponent } from "./projects/electionTabs/completedelection/completedelection.component";
import { IdComponent } from './id/id.component';
import { DonateComponent } from './donate/donate.component';
import { NewCandidateComponent } from './new-candidate/new-candidate.component';

@NgModule({
  declarations: [
    AppComponent,
    CulottelistComponent,
    AboutComponent,
    OpenelectionComponent,
	CompletedelectionComponent,
	IdComponent,
	DonateComponent,
	NewCandidateComponent
  ],
  imports: [
    SuiModule,
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
