import { Injectable, signal } from '@angular/core';

export interface ShoppingListItem {
  productId: string;
  productName?: string;
  categoryId: string;
  quantity: number;
  unitValue: number;
  subtotal: number;
  notes?: string;
}

export interface ShoppingList {
  id: string;
  name: string;
  responsible: string;
  type: string;
  location: string;
  locationId?: string;
  date: string;
  items: number;
  total: number;
  notes: string;
  invoicePhoto?: string;
  products: ShoppingListItem[];
}

export interface Product {
  id: string;
  name: string;
  category: string;
  categoryId?: string;
  brand: string;
  averagePrice: number;
  notes: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  isDefault: boolean;
  hidden?: boolean;
}

export interface PurchaseLocation {
  id: string;
  name: string;
  city: string;
  purchases: number;
  total: number;
}

export interface DashboardSummary {
  totalSpent: number;
  purchases: number;
  products: number;
  avgTicket: number;
}

export interface PriceHistoryEntry {
  productId: string;
  value: number;
  date: string;
}

export interface SpendingGoal {
  month: string;
  general: number;
  byCategory: Record<string, number>;
}

export interface CategorySpending {
  categoryId: string;
  name: string;
  icon: string;
  color: string;
  total: number;
  percent: number;
}

export interface MonthlySpending {
  month: string;
  label: string;
  total: number;
}

export interface TopProduct {
  productId: string;
  name: string;
  quantity: number;
  total: number;
  rank: number;
}

export interface ListTypeSpending {
  type: string;
  count: number;
  total: number;
}

export interface LocationRanking {
  id: string;
  name: string;
  city: string;
  purchases: number;
  total: number;
}

export interface PriceVariation {
  productId: string;
  name: string;
  current: number;
  previous: number;
  changePercent: number;
}

export interface HistoryFilters {
  name?: string;
  responsible?: string;
  type?: string;
  categoryId?: string;
  productId?: string;
  location?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface EstablishmentLocation {
  latitude?: number;
  longitude?: number;
  label: string;
}

export interface UserProfile {
  name: string;
  establishmentLocation?: EstablishmentLocation;
}

export interface GroupedListItems {
  categoryId: string;
  categoryName: string;
  icon: string;
  items: Array<ShoppingListItem & { productName: string; originalIndex: number }>;
  subtotal: number;
}

const STORAGE_KEY = 'smartlist-data';

const createMemoryStorage = (): Storage => {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear(): void {
      store.clear();
    },
    getItem(key: string): string | null {
      return store.has(key) ? store.get(key)! : null;
    },
    key(index: number): string | null {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key: string): void {
      store.delete(key);
    },
    setItem(key: string, value: string): void {
      store.set(key, value);
    }
  } as Storage;
};

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'c1', name: 'Alimentos', icon: '🥦', color: '#4f8a5b', isDefault: true },
  { id: 'c2', name: 'Limpeza', icon: '🧴', color: '#4b7bec', isDefault: true },
  { id: 'c3', name: 'Higiene', icon: '🪥', color: '#f39c12', isDefault: true },
  { id: 'c4', name: 'Açougue', icon: '🥩', color: '#c0392b', isDefault: true },
  { id: 'c5', name: 'Laticínios', icon: '🧀', color: '#f1c40f', isDefault: true },
  { id: 'c6', name: 'Hortifruti', icon: '🥬', color: '#27ae60', isDefault: true },
  { id: 'c7', name: 'Padaria', icon: '🍞', color: '#d35400', isDefault: true },
  { id: 'c8', name: 'Bebidas', icon: '🥤', color: '#3498db', isDefault: true },
  { id: 'c9', name: 'Pet', icon: '🐾', color: '#8e44ad', isDefault: true },
  { id: 'c10', name: 'Farmácia', icon: '💊', color: '#e74c3c', isDefault: true },
  { id: 'c11', name: 'Outros', icon: '📦', color: '#95a5a6', isDefault: true }
];

interface PersistedData {
  lists: ShoppingList[];
  products: Product[];
  categories: Category[];
  locations: PurchaseLocation[];
  priceHistory: PriceHistoryEntry[];
  goals: SpendingGoal[];
  userProfile: UserProfile;
}

@Injectable({ providedIn: 'root' })
export class SmartListDataService {
  private readonly storage: Storage = typeof globalThis.localStorage !== 'undefined'
    ? globalThis.localStorage
    : createMemoryStorage();

  private readonly listsSignal = signal<ShoppingList[]>([]);
  private readonly productsSignal = signal<Product[]>([]);
  private readonly categoriesSignal = signal<Category[]>([]);
  private readonly locationsSignal = signal<PurchaseLocation[]>([]);
  private readonly priceHistorySignal = signal<PriceHistoryEntry[]>([]);
  private readonly goalsSignal = signal<SpendingGoal[]>([]);
  private readonly userProfileSignal = signal<UserProfile>({ name: '', establishmentLocation: undefined });

  readonly lists = this.listsSignal.asReadonly();
  readonly products = this.productsSignal.asReadonly();
  readonly categories = this.categoriesSignal.asReadonly();
  readonly locations = this.locationsSignal.asReadonly();
  readonly priceHistory = this.priceHistorySignal.asReadonly();
  readonly goals = this.goalsSignal.asReadonly();
  readonly userProfile = this.userProfileSignal.asReadonly();

  readonly listTypes = ['Doméstica', 'Evento', 'Trabalho', 'Viagem', 'Outros'];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const raw = this.storage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const data = JSON.parse(raw) as PersistedData;
        this.listsSignal.set(data.lists ?? []);
        this.productsSignal.set(data.products ?? []);
        this.categoriesSignal.set(data.categories ?? DEFAULT_CATEGORIES);
        this.locationsSignal.set(data.locations ?? []);
        this.priceHistorySignal.set(data.priceHistory ?? []);
        this.goalsSignal.set(data.goals ?? []);
        this.userProfileSignal.set(data.userProfile ?? { name: '', establishmentLocation: undefined });
        this.repairProductNames();
        this.recalculateLocationStats();
        return;
      } catch {
        this.storage.removeItem(STORAGE_KEY);
      }
    }

    this.listsSignal.set([]);
    this.productsSignal.set([]);
    this.categoriesSignal.set(DEFAULT_CATEGORIES);
    this.locationsSignal.set([]);
    this.priceHistorySignal.set([]);
    this.goalsSignal.set([]);
    this.userProfileSignal.set({ name: '', establishmentLocation: undefined });
    this.recalculateLocationStats();
    this.persist();
  }

  private persist(): void {
    const data: PersistedData = {
      lists: this.listsSignal(),
      products: this.productsSignal(),
      categories: this.categoriesSignal(),
      locations: this.locationsSignal(),
      priceHistory: this.priceHistorySignal(),
      goals: this.goalsSignal(),
      userProfile: this.userProfileSignal()
    };
    this.storage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  private recalculateListTotals(products: ShoppingListItem[]): { items: number; total: number } {
    const items = products.reduce((sum, p) => sum + p.quantity, 0);
    const total = Number(products.reduce((sum, p) => sum + p.subtotal, 0).toFixed(2));
    return { items, total };
  }

  private recalculateLocationStats(): void {
    const lists = this.listsSignal();
    const locations = this.locationsSignal();
    const updated = locations.map((loc) => {
      const matching = lists.filter((l) => l.locationId === loc.id || l.location === loc.name);
      return {
        ...loc,
        purchases: matching.length,
        total: Number(matching.reduce((s, l) => s + l.total, 0).toFixed(2))
      };
    });
    this.locationsSignal.set(updated);
  }

  getProductName(productId: string): string {
    const product = this.productsSignal().find((p) => p.id === productId);
    if (product?.name) {
      return product.name;
    }

    for (const list of this.listsSignal()) {
      const item = list.products.find((entry) => entry.productId === productId);
      if (item?.productName) {
        return item.productName;
      }
    }

    return 'Produto não cadastrado';
  }

  private resolveProductName(productId: string, explicitName?: string): string {
    const trimmedName = explicitName?.trim();
    if (trimmedName) {
      return trimmedName;
    }

    const product = this.productsSignal().find((entry) => entry.id === productId);
    return product?.name ?? this.getProductName(productId);
  }

  private repairProductNames(): void {
    let changed = false;

    this.listsSignal.update((lists) =>
      lists.map((list) => ({
        ...list,
        products: list.products.map((item) => {
          if (item.productName) {
            return item;
          }

          const name = this.productsSignal().find((product) => product.id === item.productId)?.name;
          if (!name) {
            return item;
          }

          changed = true;
          return { ...item, productName: name };
        })
      }))
    );

    if (changed) {
      this.persist();
    }
  }

  getCategoryById(categoryId: string): Category | undefined {
    return this.categoriesSignal().find((c) => c.id === categoryId);
  }

  getUserProfile(): UserProfile {
    return this.userProfileSignal();
  }

  updateUserProfile(profile: Partial<UserProfile>): void {
    this.userProfileSignal.update((current) => ({
      ...current,
      ...profile,
      establishmentLocation: profile.establishmentLocation ?? current.establishmentLocation
    }));
    this.persist();
  }

  getVisibleCategories(): Category[] {
    return this.categoriesSignal().filter((c) => !c.hidden);
  }

  // --- Lists CRUD ---

  addList(payload: Omit<ShoppingList, 'id' | 'items' | 'total' | 'products'>): ShoppingList {
    const list: ShoppingList = {
      id: crypto.randomUUID(),
      items: 0,
      total: 0,
      products: [],
      ...payload
    };
    this.listsSignal.update((c) => [...c, list]);
    this.recalculateLocationStats();
    this.persist();
    return list;
  }

  updateList(id: string, payload: Partial<Omit<ShoppingList, 'id' | 'items' | 'total' | 'products'>>): void {
    this.listsSignal.update((current) =>
      current.map((list) => (list.id === id ? { ...list, ...payload } : list))
    );
    this.recalculateLocationStats();
    this.persist();
  }

  deleteList(id: string): void {
    this.listsSignal.update((current) => current.filter((l) => l.id !== id));
    this.recalculateLocationStats();
    this.persist();
  }

  addItemToList(
    listId: string,
    item: Omit<ShoppingListItem, 'subtotal'> & { unitValue: number; productName?: string }
  ): ShoppingList {
    const subtotal = Number((item.quantity * item.unitValue).toFixed(2));
    const productName = this.resolveProductName(item.productId, item.productName);
    const updatedLists = this.listsSignal().map((list) => {
      if (list.id !== listId) return list;
      const nextProducts = [...list.products, { ...item, productName, subtotal }];
      const { items, total } = this.recalculateListTotals(nextProducts);
      return { ...list, products: nextProducts, items, total };
    });

    this.listsSignal.set(updatedLists);
    this.recordPriceHistory(item.productId, item.unitValue);
    this.recalculateLocationStats();
    this.persist();
    return updatedLists.find((l) => l.id === listId)!;
  }

  updateItemInList(
    listId: string,
    index: number,
    item: Omit<ShoppingListItem, 'subtotal'> & { unitValue: number; productName?: string }
  ): void {
    const subtotal = Number((item.quantity * item.unitValue).toFixed(2));
    const productName = this.resolveProductName(item.productId, item.productName);
    this.listsSignal.update((current) =>
      current.map((list) => {
        if (list.id !== listId) return list;
        const nextProducts = [...list.products];
        nextProducts[index] = { ...item, productName, subtotal };
        const { items, total } = this.recalculateListTotals(nextProducts);
        return { ...list, products: nextProducts, items, total };
      })
    );
    this.recordPriceHistory(item.productId, item.unitValue);
    this.recalculateLocationStats();
    this.persist();
  }

  removeItemFromList(listId: string, index: number): void {
    this.listsSignal.update((current) =>
      current.map((list) => {
        if (list.id !== listId) return list;
        const nextProducts = list.products.filter((_, i) => i !== index);
        const { items, total } = this.recalculateListTotals(nextProducts);
        return { ...list, products: nextProducts, items, total };
      })
    );
    this.recalculateLocationStats();
    this.persist();
  }

  getListGroupedByCategory(listId: string): GroupedListItems[] {
    const list = this.listsSignal().find((l) => l.id === listId);
    if (!list) return [];

    const groups = new Map<string, GroupedListItems>();
    list.products.forEach((item, originalIndex) => {
      const cat = this.getCategoryById(item.categoryId);
      const key = item.categoryId;
      if (!groups.has(key)) {
        groups.set(key, {
          categoryId: key,
          categoryName: cat?.name ?? 'Outros',
          icon: cat?.icon ?? '📦',
          items: [],
          subtotal: 0
        });
      }
      const group = groups.get(key)!;
      group.items.push({
        ...item,
        productName: item.productName ?? this.getProductName(item.productId),
        originalIndex
      });
      group.subtotal = Number((group.subtotal + item.subtotal).toFixed(2));
    });
    return Array.from(groups.values());
  }

  // --- Products CRUD ---

  addProduct(product: Omit<Product, 'id'>): Product {
    const nextProduct = { id: crypto.randomUUID(), ...product };
    this.productsSignal.update((c) => [...c, nextProduct]);
    this.persist();
    return nextProduct;
  }

  updateProduct(id: string, payload: Partial<Omit<Product, 'id'>>): void {
    this.productsSignal.update((c) => c.map((p) => (p.id === id ? { ...p, ...payload } : p)));
    this.persist();
  }

  deleteProduct(id: string): void {
    this.productsSignal.update((c) => c.filter((p) => p.id !== id));
    this.persist();
  }

  searchProducts(query: string): Product[] {
    const q = query.toLowerCase().trim();
    if (!q) return this.productsSignal();
    return this.productsSignal().filter(
      (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
    );
  }

  // --- Categories CRUD ---

  addCategory(category: Omit<Category, 'id'>): Category {
    const nextCategory = { id: crypto.randomUUID(), ...category, isDefault: false };
    this.categoriesSignal.update((c) => [...c, nextCategory]);
    this.persist();
    return nextCategory;
  }

  updateCategory(id: string, payload: Partial<Omit<Category, 'id' | 'isDefault'>>): void {
    this.categoriesSignal.update((c) => c.map((cat) => (cat.id === id ? { ...cat, ...payload } : cat)));
    this.persist();
  }

  deleteCategory(id: string): boolean {
    const cat = this.categoriesSignal().find((c) => c.id === id);
    if (!cat || cat.isDefault) return false;
    this.categoriesSignal.update((c) => c.filter((cat) => cat.id !== id));
    this.persist();
    return true;
  }

  hideCategory(id: string): void {
    this.categoriesSignal.update((c) => c.map((cat) => (cat.id === id ? { ...cat, hidden: true } : cat)));
    this.persist();
  }

  // --- Locations CRUD ---

  addLocation(location: Omit<PurchaseLocation, 'id' | 'purchases' | 'total'>): PurchaseLocation {
    const nextLocation: PurchaseLocation = { id: crypto.randomUUID(), purchases: 0, total: 0, ...location };
    this.locationsSignal.update((c) => [...c, nextLocation]);
    this.persist();
    return nextLocation;
  }

  updateLocation(id: string, payload: Partial<Omit<PurchaseLocation, 'id'>>): void {
    this.locationsSignal.update((c) => c.map((l) => (l.id === id ? { ...l, ...payload } : l)));
    this.persist();
  }

  deleteLocation(id: string): void {
    this.locationsSignal.update((c) => c.filter((l) => l.id !== id));
    this.persist();
  }

  searchLocations(query: string): PurchaseLocation[] {
    const q = query.toLowerCase().trim();
    if (!q) return this.locationsSignal();
    return this.locationsSignal().filter(
      (l) => l.name.toLowerCase().includes(q) || l.city.toLowerCase().includes(q)
    );
  }

  // --- Price History ---

  recordPriceHistory(productId: string, value: number, date: string = new Date().toISOString().slice(0, 10)): void {
    this.priceHistorySignal.update((c) => [...c, { productId, value, date }]);
    this.persist();
  }

  getPriceVariation(productId: string): PriceVariation | null {
    const entries = this.priceHistorySignal()
      .filter((e) => e.productId === productId)
      .sort((a, b) => b.date.localeCompare(a.date));
    if (entries.length < 2) return null;
    const current = entries[0].value;
    const previous = entries[1].value;
    const changePercent = previous ? Number((((current - previous) / previous) * 100).toFixed(1)) : 0;
    return {
      productId,
      name: this.getProductName(productId),
      current,
      previous,
      changePercent
    };
  }

  getPriceVariations(): PriceVariation[] {
    const productIds = [...new Set(this.priceHistorySignal().map((e) => e.productId))];
    return productIds.map((id) => this.getPriceVariation(id)).filter((v): v is PriceVariation => v !== null);
  }

  // --- Goals ---

  getCurrentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  getGoalsForMonth(month: string = this.getCurrentMonth()): SpendingGoal {
    const existing = this.goalsSignal().find((g) => g.month === month);
    return existing ?? { month, general: 0, byCategory: {} };
  }

  setGoals(goals: SpendingGoal): void {
    this.goalsSignal.update((current) => {
      const filtered = current.filter((g) => g.month !== goals.month);
      return [...filtered, goals];
    });
    this.persist();
  }

  getGoalProgress(month: string = this.getCurrentMonth()): { general: number; generalPercent: number; byCategory: Array<{ categoryId: string; name: string; spent: number; goal: number; percent: number }> } {
    const goals = this.getGoalsForMonth(month);
    const monthLists = this.getListsForMonth(month);
    const totalSpent = monthLists.reduce((s, l) => s + l.total, 0);
    const categorySpending = this.getSpendingByCategory(monthLists);

    return {
      general: totalSpent,
      generalPercent: goals.general ? Number(((totalSpent / goals.general) * 100).toFixed(1)) : 0,
      byCategory: categorySpending.map((cs) => ({
        categoryId: cs.categoryId,
        name: cs.name,
        spent: cs.total,
        goal: goals.byCategory[cs.categoryId] ?? 0,
        percent: goals.byCategory[cs.categoryId]
          ? Number(((cs.total / goals.byCategory[cs.categoryId]) * 100).toFixed(1))
          : 0
      }))
    };
  }

  // --- Dashboard aggregations ---

  private getListsForMonth(month: string): ShoppingList[] {
    return this.listsSignal().filter((l) => l.date.startsWith(month));
  }

  getSummary(month?: string): DashboardSummary {
    const lists = month ? this.getListsForMonth(month) : this.listsSignal();
    const totalSpent = lists.reduce((sum, l) => sum + l.total, 0);
    const purchases = lists.length;
    const productCount = lists.reduce((sum, l) => sum + l.products.length, 0);

    return {
      totalSpent,
      purchases,
      products: productCount,
      avgTicket: purchases ? Number((totalSpent / purchases).toFixed(2)) : 0
    };
  }

  getSpendingByCategory(lists?: ShoppingList[]): CategorySpending[] {
    const targetLists = lists ?? this.getListsForMonth(this.getCurrentMonth());
    const totals = new Map<string, number>();
    let grandTotal = 0;

    for (const list of targetLists) {
      for (const item of list.products) {
        totals.set(item.categoryId, (totals.get(item.categoryId) ?? 0) + item.subtotal);
        grandTotal += item.subtotal;
      }
    }

    return Array.from(totals.entries())
      .map(([categoryId, total]) => {
        const cat = this.getCategoryById(categoryId);
        return {
          categoryId,
          name: cat?.name ?? 'Outros',
          icon: cat?.icon ?? '📦',
          color: cat?.color ?? '#95a5a6',
          total: Number(total.toFixed(2)),
          percent: grandTotal ? Number(((total / grandTotal) * 100).toFixed(1)) : 0
        };
      })
      .sort((a, b) => b.total - a.total);
  }

  getMonthlyEvolution(months = 6): MonthlySpending[] {
    const result: MonthlySpending[] = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      const total = this.getListsForMonth(key).reduce((s, l) => s + l.total, 0);
      result.push({ month: key, label, total: Number(total.toFixed(2)) });
    }
    return result;
  }

  getTopProducts(limit = 5): TopProduct[] {
    const counts = new Map<string, { quantity: number; total: number }>();

    for (const list of this.listsSignal()) {
      for (const item of list.products) {
        const current = counts.get(item.productId) ?? { quantity: 0, total: 0 };
        counts.set(item.productId, {
          quantity: current.quantity + item.quantity,
          total: Number((current.total + item.subtotal).toFixed(2))
        });
      }
    }

    return Array.from(counts.entries())
      .map(([productId, data]) => ({
        productId,
        name: this.getProductName(productId),
        quantity: data.quantity,
        total: data.total,
        rank: 0
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, limit)
      .map((item, i) => ({ ...item, rank: i + 1 }));
  }

  getSpendingByListType(): ListTypeSpending[] {
    const types = new Map<string, { count: number; total: number }>();
    for (const list of this.getListsForMonth(this.getCurrentMonth())) {
      const current = types.get(list.type) ?? { count: 0, total: 0 };
      types.set(list.type, { count: current.count + 1, total: Number((current.total + list.total).toFixed(2)) });
    }
    return Array.from(types.entries()).map(([type, data]) => ({ type, ...data }));
  }

  getLocationRanking(): LocationRanking[] {
    return [...this.locationsSignal()]
      .sort((a, b) => b.total - a.total)
      .map((l) => ({ id: l.id, name: l.name, city: l.city, purchases: l.purchases, total: l.total }));
  }

  getRecentLists(limit = 5): ShoppingList[] {
    return [...this.listsSignal()].sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit);
  }

  // --- History filters ---

  filterLists(filters: HistoryFilters): ShoppingList[] {
    return this.listsSignal().filter((list) => {
      if (filters.name && !list.name.toLowerCase().includes(filters.name.toLowerCase())) return false;
      if (filters.responsible && !list.responsible.toLowerCase().includes(filters.responsible.toLowerCase())) return false;
      if (filters.type && list.type !== filters.type) return false;
      if (filters.location && !list.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
      if (filters.dateFrom && list.date < filters.dateFrom) return false;
      if (filters.dateTo && list.date > filters.dateTo) return false;
      if (filters.productId && !list.products.some((p) => p.productId === filters.productId)) return false;
      if (filters.categoryId && !list.products.some((p) => p.categoryId === filters.categoryId)) return false;
      return true;
    });
  }

  // --- Reports ---

  exportToCsv(reportType: string): string {
    const month = this.getCurrentMonth();
    let rows: string[][] = [];

    switch (reportType) {
      case 'Gastos por categoria': {
        rows = [['Categoria', 'Total', 'Percentual']];
        for (const cs of this.getSpendingByCategory()) {
          rows.push([cs.name, String(cs.total), `${cs.percent}%`]);
        }
        break;
      }
      case 'Gastos por mercado': {
        rows = [['Local', 'Cidade', 'Compras', 'Total']];
        for (const loc of this.getLocationRanking()) {
          rows.push([loc.name, loc.city, String(loc.purchases), String(loc.total)]);
        }
        break;
      }
      case 'Evolução mensal': {
        rows = [['Mês', 'Total']];
        for (const m of this.getMonthlyEvolution()) {
          rows.push([m.label, String(m.total)]);
        }
        break;
      }
      case 'Produtos mais comprados': {
        rows = [['Posição', 'Produto', 'Quantidade', 'Total']];
        for (const p of this.getTopProducts(10)) {
          rows.push([String(p.rank), p.name, String(p.quantity), String(p.total)]);
        }
        break;
      }
      case 'Produtos com maior aumento de preço': {
        rows = [['Produto', 'Preço anterior', 'Preço atual', 'Variação %']];
        for (const v of this.getPriceVariations().sort((a, b) => b.changePercent - a.changePercent)) {
          rows.push([v.name, String(v.previous), String(v.current), `${v.changePercent}%`]);
        }
        break;
      }
      case 'Histórico completo': {
        rows = [['Lista', 'Responsável', 'Tipo', 'Local', 'Data', 'Itens', 'Total']];
        for (const list of this.listsSignal()) {
          rows.push([list.name, list.responsible, list.type, list.location, list.date, String(list.items), String(list.total)]);
        }
        break;
      }
      default:
        rows = [['Relatório', month], ['Sem dados', '']];
    }

    return rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');
  }

  downloadCsv(reportType: string): void {
    const csv = this.exportToCsv(reportType);
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `smartlist-${reportType.toLowerCase().replace(/\s+/g, '-')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }
}
