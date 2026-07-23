import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HistoryFilters, SmartListDataService } from '../../core/data/smart-list-data.service';

@Component({
  selector: 'app-historico',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './historico.component.html',
  styleUrl: './historico.component.css'
})
export class HistoricoComponent {
  readonly data = inject(SmartListDataService);

  readonly listTypes = this.data.listTypes;
  readonly categories = this.data.categories;
  readonly products = this.data.products;

  filters = signal<HistoryFilters>({});

  readonly results = computed(() => this.data.filterLists(this.filters()));

  updateFilter(key: keyof HistoryFilters, value: string): void {
    this.filters.update((f) => ({ ...f, [key]: value || undefined }));
  }

  clearFilters(): void {
    this.filters.set({});
  }
}
