import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SmartListDataService } from '../../core/data/smart-list-data.service';

@Component({
  selector: 'app-novo-produto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './novo-produto.component.html',
  styleUrl: './novo-produto.component.css'
})
export class NovoProdutoComponent {
  readonly data = inject(SmartListDataService);
  private readonly router = inject(Router);

  readonly categories = this.data.getVisibleCategories();

  form = {
    name: '',
    categoryId: this.categories[0]?.id ?? '',
    category: this.categories[0]?.name ?? '',
    brand: '',
    averagePrice: 0,
    notes: ''
  };

  error = '';

  onCategoryChange(categoryId: string): void {
    this.form.categoryId = categoryId;
    this.form.category = this.data.getCategoryById(categoryId)?.name ?? '';
  }

  submit(): void {
    if (!this.form.name.trim() || !this.form.category) {
      this.error = 'Nome e categoria são obrigatórios.';
      return;
    }

    this.data.addProduct({
      name: this.form.name.trim(),
      category: this.form.category,
      categoryId: this.form.categoryId,
      brand: this.form.brand.trim(),
      averagePrice: this.form.averagePrice,
      notes: this.form.notes.trim()
    });

    this.router.navigate(['/produtos']);
  }
}
