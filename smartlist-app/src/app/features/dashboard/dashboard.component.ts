import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SmartListDataService } from '../../core/data/smart-list-data.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  readonly data = inject(SmartListDataService);

  readonly month = this.data.getCurrentMonth();
  readonly summary = computed(() => this.data.getSummary(this.month));
  readonly categorySpending = computed(() => this.data.getSpendingByCategory());
  readonly monthlyEvolution = computed(() => this.data.getMonthlyEvolution());
  readonly topProducts = computed(() => this.data.getTopProducts());
  readonly listTypeSpending = computed(() => this.data.getSpendingByListType());
  readonly locationRanking = computed(() => this.data.getLocationRanking());
  readonly recentLists = computed(() => this.data.getRecentLists());
  readonly priceVariations = computed(() => this.data.getPriceVariations());
  readonly goalProgress = computed(() => this.data.getGoalProgress());

  readonly maxMonthly = computed(() => {
    const values = this.monthlyEvolution().map((m) => m.total);
    return Math.max(...values, 1);
  });

  readonly medals = ['🥇', '🥈', '🥉'];
}
