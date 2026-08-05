import { describe, expect, it, beforeEach } from 'vitest';
import { SmartListDataService } from './smart-list-data.service';

describe('SmartListDataService', () => {
  let service: SmartListDataService;

  beforeEach(() => {
    globalThis.localStorage?.clear();
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

  it('deve iniciar vazio quando não há dados salvos', () => {
    expect(service.lists()).toEqual([]);
    expect(service.products()).toEqual([]);
    expect(service.locations()).toEqual([]);
  });

  it('deve filtrar listas por responsável', () => {
    const results = service.filterLists({ responsible: 'Ana' });
    expect(results.every((l) => l.responsible.includes('Ana'))).toBe(true);
  });

  it('não deve excluir categorias padrão', () => {
    expect(service.deleteCategory('c1')).toBe(false);
    expect(service.categories().find((c) => c.id === 'c1')).toBeDefined();
  });

  it('deve calcular gastos por categoria quando houver itens', () => {
    const list = service.addList({
      name: 'Compras da semana',
      responsible: 'Maria',
      type: 'Doméstica',
      location: 'Mercado',
      date: '2026-07-20',
      notes: 'Itens básicos'
    });

    service.addItemToList(list.id, {
      productId: 'p1',
      categoryId: 'c1',
      quantity: 1,
      unitValue: 12.5,
      notes: ''
    });

    const spending = service.getSpendingByCategory();
    expect(spending.length).toBeGreaterThan(0);
    expect(spending[0].total).toBeGreaterThan(0);
  });

  it('deve salvar e recuperar o perfil do usuário com localização do estabelecimento', () => {
    service.updateUserProfile({
      name: 'Ana',
      establishmentLocation: {
        latitude: -23.5505,
        longitude: -46.6333,
        label: 'Loja Centro'
      }
    });

    const profile = service.getUserProfile();
    expect(profile.name).toBe('Ana');
    expect(profile.establishmentLocation?.label).toBe('Loja Centro');
  });

  it('deve preservar o nome do produto dentro da lista mesmo se o produto for renomeado', () => {
    const list = service.addList({
      name: 'Compras do mês',
      responsible: 'Ana',
      type: 'Doméstica',
      location: 'Mercado',
      date: '2026-08-02',
      notes: ''
    });

    const product = service.addProduct({
      name: 'Arroz',
      category: 'Alimentos',
      categoryId: 'c1',
      brand: '',
      averagePrice: 5.5,
      notes: ''
    });

    service.addItemToList(list.id, {
      productId: product.id,
      categoryId: 'c1',
      quantity: 1,
      unitValue: 5.5,
      notes: ''
    });

    service.updateProduct(product.id, { name: 'Arroz integral' });

    const savedItem = service.lists().find((item) => item.id === list.id)!.products[0];
    expect(savedItem.productName).toBe('Arroz');
  });
});
