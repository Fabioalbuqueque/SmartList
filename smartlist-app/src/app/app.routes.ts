import { Routes } from '@angular/router';
import { ShellComponent } from './layout/shell.component';

export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: '', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'listas', loadComponent: () => import('./features/listas/listas.component').then(m => m.ListasComponent) },
      { path: 'listas/nova', loadComponent: () => import('./features/listas/nova-lista.component').then(m => m.NovaListaComponent) },
      { path: 'listas/:id', loadComponent: () => import('./features/listas/lista-detalhe.component').then(m => m.ListaDetalheComponent) },
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'produtos', loadComponent: () => import('./features/produtos/produtos.component').then(m => m.ProdutosComponent) },
      { path: 'produtos/novo', loadComponent: () => import('./features/produtos/novo-produto.component').then(m => m.NovoProdutoComponent) },
      { path: 'categorias', loadComponent: () => import('./features/categorias/categorias.component').then(m => m.CategoriasComponent) },
      { path: 'categorias/nova', loadComponent: () => import('./features/categorias/nova-categoria.component').then(m => m.NovaCategoriaComponent) },
      { path: 'locais', loadComponent: () => import('./features/locais/locais.component').then(m => m.LocaisComponent) },
      { path: 'locais/novo', loadComponent: () => import('./features/locais/novo-local.component').then(m => m.NovoLocalComponent) },
      { path: 'historico', loadComponent: () => import('./features/historico/historico.component').then(m => m.HistoricoComponent) },
      { path: 'relatorios', loadComponent: () => import('./features/relatorios/relatorios.component').then(m => m.RelatoriosComponent) },
      { path: 'configuracoes', loadComponent: () => import('./features/configuracoes/configuracoes.component').then(m => m.ConfiguracoesComponent) }
    ]
  },
  { path: '**', redirectTo: '' }
];
