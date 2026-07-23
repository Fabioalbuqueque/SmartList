import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PurchaseLocation, SmartListDataService } from '../../core/data/smart-list-data.service';

@Component({
  selector: 'app-locais',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './locais.component.html',
  styleUrl: './locais.component.css'
})
export class LocaisComponent {
  readonly data = inject(SmartListDataService);
  readonly locations = this.data.locations;

  editingId: string | null = null;
  editForm: Partial<PurchaseLocation> = {};

  startEdit(location: PurchaseLocation): void {
    this.editingId = location.id;
    this.editForm = { name: location.name, city: location.city };
  }

  saveEdit(): void {
    if (!this.editingId) return;
    this.data.updateLocation(this.editingId, this.editForm);
    this.editingId = null;
  }

  deleteLocation(id: string, name: string): void {
    if (confirm(`Excluir o local "${name}"?`)) {
      this.data.deleteLocation(id);
    }
  }
}
