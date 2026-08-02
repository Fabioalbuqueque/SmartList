import { Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { GroupedListItems, SmartListDataService } from '../../core/data/smart-list-data.service';

@Component({
  selector: 'app-lista-detalhe',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './lista-detalhe.component.html',
  styleUrl: './lista-detalhe.component.css'
})
export class ListaDetalheComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  readonly data = inject(SmartListDataService);

  readonly listId = this.route.snapshot.paramMap.get('id') ?? '';
  readonly products = this.data.products;
  readonly categories = this.data.categories;

  readonly list = computed(() => this.data.lists().find((item) => item.id === this.listId));
  readonly groupedItems = computed(() => this.data.getListGroupedByCategory(this.listId));

  form = {
    categoryId: '',
    productSearch: '',
    selectedProductId: '',
    productName: '',
    quantity: 1,
    unitValue: 0,
    notes: ''
  };

  message = '';
  editingIndex: number | null = null;

  get filteredProducts() {
    return this.data.searchProducts(this.form.productSearch);
  }

  ngOnInit(): void {
    this.form.categoryId = this.data.getVisibleCategories()[0]?.id ?? '';
  }

  selectProduct(productId: string, name: string): void {
    this.form.selectedProductId = productId;
    this.form.productSearch = name;
    const product = this.data.products().find((p) => p.id === productId);
    if (product) {
      this.form.unitValue = product.averagePrice;
      if (product.categoryId) this.form.categoryId = product.categoryId;
    }
  }

  submit(): void {
    if (!this.listId || !this.form.quantity || !this.form.unitValue) {
      this.message = 'Preencha quantidade e valor unitário.';
      return;
    }

    if (!this.list()) {
      this.message = 'Lista não encontrada.';
      return;
    }

    const category = this.data.getCategoryById(this.form.categoryId);
    const categoryId = category?.id ?? 'c11';
    const categoryName = category?.name ?? 'Outros';

    let productId = this.form.selectedProductId;

    if (this.form.selectedProductId === 'new' || (!productId && this.form.productName.trim())) {
      const created = this.data.addProduct({
        name: this.form.productName.trim() || 'Novo produto',
        category: categoryName,
        categoryId,
        brand: '',
        averagePrice: this.form.unitValue,
        notes: this.form.notes
      });
      productId = created.id;
    }

    if (!productId) {
      this.message = 'Selecione ou cadastre um produto.';
      return;
    }

    const item = {
      productId,
      categoryId,
      quantity: Number(this.form.quantity),
      unitValue: Number(this.form.unitValue),
      notes: this.form.notes
    };

    if (this.editingIndex !== null) {
      this.data.updateItemInList(this.listId, this.editingIndex, item);
      this.message = 'Produto atualizado!';
      this.editingIndex = null;
    } else {
      this.data.addItemToList(this.listId, item);
      this.message = 'Produto adicionado com sucesso!';
    }

    this.resetForm();
  }

  editItem(index: number): void {
    const list = this.list();
    if (!list) return;
    const item = list.products[index];
    this.editingIndex = index;
    this.form = {
      categoryId: item.categoryId,
      productSearch: this.data.getProductName(item.productId),
      selectedProductId: item.productId,
      productName: '',
      quantity: item.quantity,
      unitValue: item.unitValue,
      notes: item.notes ?? ''
    };
  }

  removeItem(index: number): void {
    if (confirm('Remover este item da lista?')) {
      this.data.removeItemFromList(this.listId, index);
      this.message = 'Item removido.';
    }
  }

  editItemByItem(item: GroupedListItems['items'][number]): void {
    if (item.originalIndex >= 0) {
      this.editItem(item.originalIndex);
    }
  }

  removeItemByItem(item: GroupedListItems['items'][number]): void {
    if (item.originalIndex >= 0) {
      this.removeItem(item.originalIndex);
    }
  }

  cancelEdit(): void {
    this.editingIndex = null;
    this.resetForm();
  }

  onInvoiceSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.list()) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.data.updateList(this.listId, { invoicePhoto: reader.result as string });
      this.message = 'Foto da nota fiscal anexada.';
    };
    reader.readAsDataURL(file);
  }

  deleteList(): void {
    if (confirm('Excluir esta lista permanentemente?')) {
      this.data.deleteList(this.listId);
      window.history.back();
    }
  }

  private resetForm(): void {
    this.form = {
      categoryId: this.data.getVisibleCategories()[0]?.id ?? '',
      productSearch: '',
      selectedProductId: '',
      productName: '',
      quantity: 1,
      unitValue: 0,
      notes: ''
    };
  }
}
