import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { CulottelistComponent } from "./projects/culottelist/culottelist.component";
import { AboutComponent } from "./about/about.component";
import { IdComponent } from "./id/id.component";
import { DonateComponent } from './donate/donate.component';

const routes: Routes = [
  { path: "", component: CulottelistComponent },
  { path: "culottelist", component: CulottelistComponent },
  { path: "about", component: AboutComponent },
  { path: "candidate", component: CulottelistComponent },
  { path: "candidate/:address", component: IdComponent },
  { path: "donate", component: DonateComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
