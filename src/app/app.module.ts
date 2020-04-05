import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { AppRoutingModule } from "./app-routing.module";
import { RouterModule } from "@angular/router";

import { AppComponent } from "./app.component";
import { CommonModule } from "@angular/common";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatToolbarModule } from "@angular/material/toolbar";

// import { SuiModule } from "ng2-semantic-ui";
import {UtilModule} from './util/util.module';
import { RevolutionComponent } from "./revolution/revolution.component";
import { AboutComponent } from "./about/about.component";
import { DonateComponent } from "./donate/donate.component";
import { CitizenComponent } from "./citizen/citizen.component";
import { FactoryComponent } from "./factory/factory.component";

import { ClipboardModule } from 'ngx-clipboard';

@NgModule({
  declarations: [
    AppComponent,
    RevolutionComponent,
    AboutComponent,
    DonateComponent,
    CitizenComponent,
    FactoryComponent
  ],
  imports: [
    //  SuiModule,
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatToolbarModule,
    FormsModule,
    ClipboardModule,
    HttpClientModule,
    RouterModule,
    AppRoutingModule,
    UtilModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
