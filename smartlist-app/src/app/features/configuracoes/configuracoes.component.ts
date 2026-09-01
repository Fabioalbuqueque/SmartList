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
  profileName = this.data.getUserProfile().name;
  establishmentLocationLabel = this.data.getUserProfile().establishmentLocation?.label ?? '';
  locationStatus = '';
  isLocating = false;

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

  saveProfile(): void {
    this.data.updateUserProfile({
      name: this.profileName.trim(),
      establishmentLocation: this.establishmentLocationLabel
        ? {
            label: this.establishmentLocationLabel
          }
        : undefined
    });
    this.message = 'Perfil salvo com sucesso!';
  }

  async searchLocationByText(): Promise<void> {
    const query = this.establishmentLocationLabel.trim();
    if (!query) {
      this.locationStatus = 'Digite um endereço ou nome do estabelecimento.';
      return;
    }

    this.isLocating = true;
    this.locationStatus = 'Buscando localização...';

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&addressdetails=1&q=${encodeURIComponent(query)}`,
        {
          headers: {
            Accept: 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Falha na busca');
      }

      const results = await response.json() as Array<{ lat: string; lon: string; display_name: string }>;
      const match = results[0];

      if (!match) {
        this.locationStatus = 'Nenhum resultado encontrado para esse endereço ou nome.';
        this.isLocating = false;
        return;
      }

      this.data.updateUserProfile({
        establishmentLocation: {
          latitude: Number(match.lat),
          longitude: Number(match.lon),
          label: query
        }
      });

      this.locationStatus = `Localização encontrada: ${match.display_name}`;
      this.isLocating = false;
    } catch {
      this.locationStatus = 'Não foi possível buscar a localização. Verifique o endereço ou tente novamente.';
      this.isLocating = false;
    }
  }

  detectLocation(): void {
    if (!navigator.geolocation) {
      this.locationStatus = 'Seu navegador não suporta geolocalização.';
      return;
    }

    this.isLocating = true;
    this.locationStatus = 'Buscando sua localização...';

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const label = this.establishmentLocationLabel || 'Estabelecimento localizado';
        this.data.updateUserProfile({
          establishmentLocation: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            label
          }
        });
        this.locationStatus = 'Localização capturada com sucesso.';
        this.isLocating = false;
      },
      () => {
        this.locationStatus = 'Não foi possível obter a localização.';
        this.isLocating = false;
      }
    );
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
