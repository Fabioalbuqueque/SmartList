import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Product, SmartListDataService } from '../../core/data/smart-list-data.service';

@Component({
  selector: 'app-produtos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './produtos.component.html',
  styleUrl: './produtos.component.css'
})
export class ProdutosComponent {
  readonly data = inject(SmartListDataService);
  readonly products = this.data.products;
  readonly categories = this.data.categories;

  editingId = signal<string | null>(null);
  editForm: Partial<Product> = {};

  startEdit(product: Product): void {
    this.editingId.set(product.id);
    this.editForm = { ...product };
  }

  saveEdit(): void {
    const id = this.editingId();
    if (!id) return;
    this.data.updateProduct(id, this.editForm);
    this.editingId.set(null);
  }

  cancelEdit(): void {
    this.editingId.set(null);
  }

  deleteProduct(id: string, name: string): void {
    if (confirm(`Excluir o produto "${name}"?`)) {
      this.data.deleteProduct(id);
    }
  }
}
