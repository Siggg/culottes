import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CulottelistComponent } from './projects/culottelist/culottelist.component';
import { AboutComponent } from './about/about.component';

const routes: Routes = [
	{ path: '', component: CulottelistComponent},
	{ path: 'culottelist', component: CulottelistComponent},
	{ path: 'about', component: AboutComponent},
  ];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
