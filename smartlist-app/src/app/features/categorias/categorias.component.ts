import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Category, SmartListDataService } from '../../core/data/smart-list-data.service';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './categorias.component.html',
  styleUrl: './categorias.component.css'
})
export class CategoriasComponent {
  readonly data = inject(SmartListDataService);
  readonly categories = this.data.categories;

  editingId: string | null = null;
  editForm: Partial<Category> = {};
  message = '';

  startEdit(category: Category): void {
    this.editingId = category.id;
    this.editForm = { ...category };
  }

  saveEdit(): void {
    if (!this.editingId) return;
    this.data.updateCategory(this.editingId, this.editForm);
    this.editingId = null;
  }

  deleteCategory(id: string, name: string, isDefault: boolean): void {
    if (isDefault) {
      this.message = 'Categorias padrão não podem ser excluídas. Use ocultar.';
      return;
    }
    if (confirm(`Excluir a categoria "${name}"?`)) {
      if (!this.data.deleteCategory(id)) {
        this.message = 'Não foi possível excluir esta categoria.';
      }
    }
  }

  hideCategory(id: string, name: string): void {
    if (confirm(`Ocultar a categoria "${name}"?`)) {
      this.data.hideCategory(id);
    }
  }
}
