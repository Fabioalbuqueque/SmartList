import { describe, expect, it, beforeEach } from 'vitest';
import { SmartListDataService } from './smart-list-data.service';

describe('SmartListDataService', () => {
  let service: SmartListDataService;

  beforeEach(() => {
    localStorage.clear();
    service = new SmartListDataService();
  });

  it('deve calcular subtotal, total e quantidade de itens ao adicionar um produto à lista', () => {
    service.addList({
      name: 'Compras da semana',
      responsible: 'Maria',
      type: 'Doméstica',
      location: 'Mercado',
      date: '2026-07-20',
      notes: 'Itens básicos'
    });

    const listId = service.lists()[service.lists().length - 1].id;

    service.addItemToList(listId, {
      productId: 'p1',
      categoryId: 'c1',
      quantity: 2,
      unitValue: 29.9,
      notes: 'Pacote grande'
    });

    const updatedList = service.lists().find((list) => list.id === listId)!;

    expect(updatedList.items).toBe(2);
    expect(updatedList.total).toBeCloseTo(59.8);
    expect(updatedList.products.length).toBe(1);
  });

  it('deve registrar histórico de preços ao adicionar item', () => {
    const listId = service.lists()[0].id;
    const before = service.priceHistory().length;

    service.addItemToList(listId, {
      productId: 'p1',
      categoryId: 'c1',
      quantity: 1,
      unitValue: 30.5
    });

    expect(service.priceHistory().length).toBe(before + 1);
  });

  it('deve filtrar listas por responsável', () => {
    const results = service.filterLists({ responsible: 'Ana' });
    expect(results.every((l) => l.responsible.includes('Ana'))).toBe(true);
  });

  it('não deve excluir categorias padrão', () => {
    expect(service.deleteCategory('c1')).toBe(false);
    expect(service.categories().find((c) => c.id === 'c1')).toBeDefined();
  });

  it('deve calcular gastos por categoria', () => {
    const spending = service.getSpendingByCategory();
    expect(spending.length).toBeGreaterThan(0);
    expect(spending[0].total).toBeGreaterThan(0);
  });
});
