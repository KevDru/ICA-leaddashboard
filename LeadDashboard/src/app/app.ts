import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Statistics } from "./statistics/statistics";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Statistics],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('LeadDashboard');
}
