import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { RevolutionComponent } from "./revolution/revolution.component";
import { AboutComponent } from "./about/about.component";
import { DonateComponent } from "./donate/donate.component";
import { CitizenComponent } from "./citizen/citizen.component";
import { FactoryComponent } from "./factory/factory.component";

const routes: Routes = [
  { path: "", component: RevolutionComponent },
  { path: "revolution", component: RevolutionComponent },
  { path: "revolution/:address", component: RevolutionComponent },
  { path: "about", component: AboutComponent },
  { path: "citizen", component: CitizenComponent },
  { path: "citizen/:address", component: CitizenComponent },
  { path: "factory", component: FactoryComponent },
  { path: "donate", component: DonateComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true, onSameUrlNavigation: "reload" })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
