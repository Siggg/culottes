import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { CulottelistComponent } from "./projects/culottelist/culottelist.component";
import { AboutComponent } from "./about/about.component";
import { IdComponent } from "./id/id.component";
import { DonateComponent } from './donate/donate.component';
import { NewCitizenComponent } from './new-citizen/new-citizen.component';

const routes: Routes = [
  { path: "", component: CulottelistComponent },
  { path: "culottelist", component: CulottelistComponent },
  { path: "about", component: AboutComponent },
  { path: "citizen", component: NewCitizenComponent },
  { path: "citizen/:address", component: IdComponent },
  { path: "donate", component: DonateComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
