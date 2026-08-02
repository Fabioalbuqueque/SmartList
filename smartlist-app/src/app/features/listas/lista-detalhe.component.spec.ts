import { describe, expect, it, vi } from 'vitest';
import { ListaDetalheComponent } from './lista-detalhe.component';

describe('ListaDetalheComponent', () => {
  it('deve editar item usando o índice original do grupo', () => {
    const component = Object.create(ListaDetalheComponent.prototype) as ListaDetalheComponent;
    const editItemSpy = vi.fn();

    component.list = () => ({
      id: 'list-1',
      products: [{ productId: 'p1' }]
    }) as any;
    component.editItem = editItemSpy;

    component.editItemByItem({ productName: 'Arroz', originalIndex: 0 } as any);

    expect(editItemSpy).toHaveBeenCalledWith(0);
  });
});
