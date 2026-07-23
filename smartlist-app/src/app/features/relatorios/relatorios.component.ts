import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SmartListDataService } from '../../core/data/smart-list-data.service';

@Component({
  selector: 'app-relatorios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './relatorios.component.html',
  styleUrl: './relatorios.component.css'
})
export class RelatoriosComponent {
  readonly data = inject(SmartListDataService);

  readonly reports = [
    'Gastos por categoria',
    'Gastos por mercado',
    'Evolução mensal',
    'Produtos mais comprados',
    'Produtos com maior aumento de preço',
    'Histórico completo'
  ];

  exportReport(report: string): void {
    this.data.downloadCsv(report);
  }
}
