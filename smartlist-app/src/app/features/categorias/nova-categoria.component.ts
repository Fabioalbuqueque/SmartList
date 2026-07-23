import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SmartListDataService } from '../../core/data/smart-list-data.service';

@Component({
  selector: 'app-nova-categoria',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nova-categoria.component.html',
  styleUrl: './nova-categoria.component.css'
})
export class NovaCategoriaComponent {
  private readonly data = inject(SmartListDataService);
  private readonly router = inject(Router);

  form = {
    name: '',
    icon: '📦',
    color: '#2c5aa0',
    isDefault: false
  };

  submit(): void {
    this.data.addCategory({
      name: this.form.name.trim(),
      icon: this.form.icon,
      color: this.form.color,
      isDefault: this.form.isDefault
    });

    this.router.navigate(['/categorias']);
  }
}
