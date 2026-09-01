import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SmartListDataService } from '../../core/data/smart-list-data.service';
import { GeolocationService } from '../../core/geolocation/geolocation.service';

@Component({
  selector: 'app-nova-lista',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nova-lista.component.html',
  styleUrl: './nova-lista.component.css'
})
export class NovaListaComponent implements OnInit {
  readonly data = inject(SmartListDataService);
  private readonly router = inject(Router);
  private readonly geolocation = inject(GeolocationService);

  readonly listTypes = this.data.listTypes;

  form = {
    name: '',
    responsible: '',
    type: 'Doméstica',
    location: '',
    locationId: '',
    date: '',
    notes: ''
  };

  error = '';
  locationStatus = '';
  isLocating = false;
  showLocationSuggestions = false;

  ngOnInit(): void {
    this.useCurrentLocation();
  }

  get locationSuggestions() {
    return this.data.searchLocations(this.form.location);
  }

  selectLocation(id: string, name: string): void {
    this.form.locationId = id;
    this.form.location = name;
    this.showLocationSuggestions = false;
    this.locationStatus = '';
  }

  useCurrentLocation(): void {
    if (!navigator.geolocation) {
      this.locationStatus = 'Seu navegador não suporta geolocalização.';
      return;
    }

    this.isLocating = true;
    this.locationStatus = 'Obtendo sua localização em tempo real...';
    this.showLocationSuggestions = false;

    this.geolocation
      .getCurrentAddress()
      .then(({ address }) => {
        this.form.location = address;
        this.form.locationId = '';
        this.locationStatus = 'Localização atual detectada.';
        this.isLocating = false;
      })
      .catch(() => {
        this.locationStatus = 'Não foi possível obter a localização. Permita o acesso ou informe o local manualmente.';
        this.isLocating = false;
      });
  }

  submit(): void {
    this.error = '';
    if (!this.form.name.trim() || !this.form.responsible.trim() || !this.form.type || !this.form.location.trim() || !this.form.date) {
      this.error = 'Preencha todos os campos obrigatórios (nome, responsável, tipo, local e data).';
      return;
    }

    const created = this.data.addList({
      name: this.form.name.trim(),
      responsible: this.form.responsible.trim(),
      type: this.form.type,
      location: this.form.location.trim(),
      locationId: this.form.locationId || undefined,
      date: this.form.date,
      notes: this.form.notes.trim()
    });

    this.router.navigate(['/listas', created.id]);
  }
}
