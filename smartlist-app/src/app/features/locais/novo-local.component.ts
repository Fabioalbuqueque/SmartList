import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SmartListDataService } from '../../core/data/smart-list-data.service';

@Component({
  selector: 'app-novo-local',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './novo-local.component.html',
  styleUrl: './novo-local.component.css'
})
export class NovoLocalComponent {
  private readonly data = inject(SmartListDataService);
  private readonly router = inject(Router);

  form = {
    name: '',
    city: '',
    purchases: 0,
    total: 0
  };

  submit(): void {
    this.data.addLocation({
      name: this.form.name.trim(),
      city: this.form.city.trim()
    });

    this.router.navigate(['/locais']);
  }
}
