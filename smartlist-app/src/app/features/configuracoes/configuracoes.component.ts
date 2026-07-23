import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SmartListDataService } from '../../core/data/smart-list-data.service';

@Component({
  selector: 'app-configuracoes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configuracoes.component.html',
  styleUrl: './configuracoes.component.css'
})
export class ConfiguracoesComponent {
  readonly data = inject(SmartListDataService);

  readonly categories = this.data.categories;
  readonly month = this.data.getCurrentMonth();

  generalGoal = this.data.getGoalsForMonth().general;
  categoryGoals: Record<string, number> = { ...this.data.getGoalsForMonth().byCategory };

  message = '';

  saveGoals(): void {
    this.data.setGoals({
      month: this.month,
      general: Number(this.generalGoal) || 0,
      byCategory: Object.fromEntries(
        Object.entries(this.categoryGoals).filter(([, v]) => v > 0).map(([k, v]) => [k, Number(v)])
      )
    });
    this.message = 'Metas salvas com sucesso!';
  }

  updateCategoryGoal(categoryId: string, value: string): void {
    const num = Number(value);
    if (num > 0) {
      this.categoryGoals[categoryId] = num;
    } else {
      delete this.categoryGoals[categoryId];
    }
  }
}
