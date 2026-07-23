import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.css'
})
export class ShellComponent {

  // Controla o estado do menu mobile
  menuOpen = false;

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