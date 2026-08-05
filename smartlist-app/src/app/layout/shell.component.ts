import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';
import { SmartListDataService } from '../core/data/smart-list-data.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.css'
})
export class ShellComponent {

  private readonly data = inject(SmartListDataService);
  private readonly storageKey = 'smartlist-user-name';

  // Controla o estado do menu mobile
  menuOpen = false;
  readonly userName = computed(() => this.data.getUserProfile().name || this.getStoredUserName());
  showNamePrompt = signal(!this.data.getUserProfile().name && !this.getStoredUserName());
  draftName = '';

  readonly menuItems = [
    {
      label: 'Início',
      path: '/',
      icon: '🏠'
    },
    {
      label: 'Minhas Listas',
      path: '/listas',
      icon: '🛒'
    },
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: '📊'
    },
    {
      label: 'Produtos',
      path: '/produtos',
      icon: '📦'
    },
    {
      label: 'Categorias',
      path: '/categorias',
      icon: '🗂'
    },
    {
      label: 'Locais',
      path: '/locais',
      icon: '📍'
    },
    {
      label: 'Histórico',
      path: '/historico',
      icon: '🕐'
    },
    {
      label: 'Relatórios',
      path: '/relatorios',
      icon: '📄'
    },
    {
      label: 'Configurações',
      path: '/configuracoes',
      icon: '⚙'
    }
  ];

  private getStoredUserName(): string {
    if (typeof window === 'undefined') return '';
    return window.localStorage.getItem(this.storageKey) ?? '';
  }

  saveUserName(): void {
    const name = this.draftName.trim();
    if (!name) return;

    this.data.updateUserProfile({ name });
    this.showNamePrompt.set(false);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(this.storageKey, name);
    }
  }

  skipUserName(): void {
    this.data.updateUserProfile({ name: 'visitante' });
    this.showNamePrompt.set(false);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(this.storageKey, 'visitante');
    }
  }

  /**
   * Abre ou fecha o menu mobile
   */
  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  /**
   * Fecha o menu mobile
   */
  closeMenu(): void {
    this.menuOpen = false;
  }
}