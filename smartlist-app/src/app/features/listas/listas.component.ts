import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SmartListDataService } from '../../core/data/smart-list-data.service';

@Component({
  selector: 'app-listas',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './listas.component.html',
  styleUrl: './listas.component.css'
})
export class ListasComponent {
  readonly data = inject(SmartListDataService);
  readonly lists = this.data.lists;

  deleteList(id: string, name: string): void {
    if (confirm(`Excluir a lista "${name}"?`)) {
      this.data.deleteList(id);
    }
  }
}
