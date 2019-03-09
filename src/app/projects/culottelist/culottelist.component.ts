import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-culottelist',
  templateUrl: './culottelist.component.html',
  styleUrls: ['./culottelist.component.css']
})
export class CulottelistComponent implements OnInit {

	title: String = "Open Source Contributors"
	purpose: String = "Owners of addresses are frequent contributors to Open Source projects"

  constructor() { }

  ngOnInit() {
  }

}
