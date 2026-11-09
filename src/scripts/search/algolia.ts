interface SearchStats {
  nbHits: number;
  processingTimeMS: number;
}
interface SearchHit {
  permalink?: string;
  path?: string;
  _highlightResult: { title?: { value: string } };
}
interface SearchHelper {
  state: { query?: string };
  search(): void;
}
interface SearchInstance {
  addWidgets(widgets: unknown[]): void;
  start(): void;
  dispose(): void;
  on(event: string, listener: () => void): void;
}
declare const instantsearch: {
  (options: {
    indexName: string;
    searchClient: unknown;
    searchFunction: (helper: SearchHelper) => void;
  }): SearchInstance;
  widgets: Record<
    'configure' | 'searchBox' | 'stats' | 'hits' | 'pagination',
    (options: Record<string, unknown>) => unknown
  >;
};
declare const algoliasearch: {
  algoliasearch(appId: string, apiKey: string): unknown;
};
/** Browser behavior preserved from Solitude Hugo; typed boundary: core/api.ts. */
import { Solitude } from '../core/api';
export class AlgoliaSearch {
  #controller = new AbortController();
  #focusTimer: number | undefined;
  searchInstance: SearchInstance | null;
  isInitialized: boolean;
  elements: ReturnType<AlgoliaSearch['cacheElements']>;
  config: import('../types').SolitudeSiteConfiguration['algolia'];
  constructor() {
    this.searchInstance = null;
    this.isInitialized = false;
    this.elements = this.cacheElements();
    this.config = Solitude.config.algolia;
    this.init();
  }
  cacheElements() {
    return {
      searchMask: document.getElementById('search-mask'),
      searchDialog: document.querySelector<HTMLElement>(
        '#algolia-search .search-dialog',
      ),
      searchButton: document.querySelector<HTMLElement>(
        '#search-button > .search',
      ),
      closeButton: document.querySelector<HTMLElement>(
        '#algolia-search .search-close-button',
      ),
      menuSearch: document.getElementById('menu-search'),
      hitsContainer: document.getElementById('algolia-hits'),
      inputContainer: '#algolia-search-input',
      paginationContainer: '#algolia-pagination',
      statsContainer: '#algolia-tips > #algolia-stats',
    };
  }
  init() {
    try {
      if (!this.validateConfig()) {
        console.error('Algolia configuration is invalid!');
        return;
      }
      this.setupSearchInstance();
      this.bindEvents();
      Solitude.listen(document, 'keydown', (event) => {
        if (
          (event.ctrlKey || event.metaKey) &&
          event.key.toLowerCase() === 'k'
        ) {
          event.preventDefault();
          this.openSearch();
        }
        if (event.key === 'Escape') this.closeSearch();
      });
      this.isInitialized = true;
    } catch (error) {
      console.error('Algolia search initialization failed:', error);
    }
  }
  validateConfig() {
    return (
      this.config &&
      this.config.appId &&
      this.config.apiKey &&
      this.config.indexName
    );
  }
  setupSearchInstance() {
    this.searchInstance = instantsearch({
      indexName: this.config.indexName,
      searchClient: algoliasearch.algoliasearch(
        this.config.appId,
        this.config.apiKey,
      ),
      searchFunction: (helper: SearchHelper) => this.handleSearch(helper),
    });
    this.addWidgets();
    this.searchInstance.start();
  }
  handleSearch(helper: SearchHelper) {
    if (helper.state.query) {
      this.showLoading();
      helper.search();
    } else {
      this.clearResults();
    }
  }
  showLoading() {
    if (this.elements.hitsContainer) {
      const loadingHtml = `<div class="loading">${Solitude.config.lang?.search?.loading || 'Searching...'}</div>`;
      this.elements.hitsContainer.innerHTML = loadingHtml;
    }
  }
  clearResults() {
    if (this.elements.hitsContainer) {
      this.elements.hitsContainer.innerHTML = '';
    }
  }
  addWidgets() {
    const widgets = [
      this.createConfigureWidget(),
      this.createSearchBoxWidget(),
      this.createStatsWidget(),
      this.createHitsWidget(),
      this.createPaginationWidget(),
    ];
    this.searchInstance?.addWidgets(widgets);
  }
  createConfigureWidget() {
    return instantsearch.widgets.configure({
      hitsPerPage: this.config.hits?.per_page || 5,
    });
  }
  createSearchBoxWidget() {
    return instantsearch.widgets.searchBox({
      container: this.elements.inputContainer,
      showReset: false,
      showSubmit: false,
      placeholder:
        Solitude.config.lang?.search?.placeholder || 'Search by keywords',
      showLoadingIndicator: false,
      searchAsYouType: true,
    });
  }
  createStatsWidget() {
    return instantsearch.widgets.stats({
      container: this.elements.statsContainer,
      templates: {
        text: (data: SearchStats) => this.formatStatsText(data),
      },
    });
  }
  formatStatsText(data: SearchStats) {
    const statsText =
      Solitude.config.lang?.search?.hit
        ?.replace(/\$\{hits}/, String(data.nbHits))
        ?.replace(/\$\{time}/, String(data.processingTimeMS)) ||
      `Found ${data.nbHits} results, took ${data.processingTimeMS} ms`;
    return `<hr>${statsText}`;
  }
  createHitsWidget() {
    return instantsearch.widgets.hits({
      container: '#algolia-hits',
      templates: {
        item: (data: SearchHit) => this.renderHitItem(data),
        empty: (data: { query: string }) => this.renderEmptyState(data),
      },
      cssClasses: {
        item: 'algolia-hit-item',
      },
    });
  }
  renderHitItem(data: SearchHit) {
    try {
      const link = data.permalink || Solitude.config.root + data.path;
      const result = data._highlightResult;
      this.hideLoadingIndicator();
      this.delayedFocus();
      return `
                <a href="${this.escapeHtml(link)}" class="algolia-hit-item-link">
                    <span class="algolia-hits-item-title">${result.title?.value || Solitude.config.lang?.ui?.untitled || 'Untitled'}</span>
                </a>`;
    } catch (error) {
      console.error('Failed to render search result item:', error);
      return '<div class="algolia-hit-error">Failed to render</div>';
    }
  }
  renderEmptyState(data: { query: string }) {
    this.hideLoadingIndicator();
    this.delayedFocus();
    const emptyText =
      Solitude.config.lang?.search?.empty?.replace(/\$\{query}/, data.query) ||
      `No results found for "${data.query}"`;
    return `<div id="algolia-hits-empty">${emptyText}</div>`;
  }
  hideLoadingIndicator() {
    const loadingElement = document.querySelector<HTMLElement>(
      '#algolia-hits .loading',
    );
    if (loadingElement) {
      loadingElement.style.display = 'none';
    }
  }
  delayedFocus(delay = 200) {
    window.clearTimeout(this.#focusTimer);
    if (this.#controller.signal.aborted) return;
    this.#focusTimer = window.setTimeout(() => {
      if (!this.#controller.signal.aborted && this.isSearchOpen()) {
        this.elements.searchDialog
          ?.querySelector<HTMLElement>('.ais-SearchBox-input')
          ?.focus();
      }
    }, delay);
  }
  escapeHtml(text: string) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  createPaginationWidget() {
    return instantsearch.widgets.pagination({
      container: this.elements.paginationContainer,
      totalPages: this.config.hits?.per_page ?? 5,
      scrollTo: false,
      showFirstLast: false,
      templates: {
        first: '<i class="solitude fas fa-angles-left"></i>',
        last: '<i class="solitude fas fa-angles-right"></i>',
        previous: '<i class="solitude fas fa-angle-left"></i>',
        next: '<i class="solitude fas fa-angle-right"></i>',
      },
      cssClasses: {
        root: 'pagination',
        item: 'pagination-item',
        link: 'page-number',
        active: 'current',
        disabled: 'disabled-item',
      },
    });
  }
  bindEvents() {
    this.bindSearchEvents();
    this.bindRightMenuSearch();
  }
  bindSearchEvents() {
    if (this.elements.searchButton) {
      Solitude.addEventListenerPjax(
        this.elements.searchButton,
        'click',
        (event) => {
          event.preventDefault();
          this.openSearch();
        },
      );
    }
    if (this.elements.closeButton) {
      this.elements.closeButton.addEventListener(
        'click',
        () => this.closeSearch(),
        { signal: this.#controller.signal },
      );
    }
    if (this.elements.searchMask) {
      this.elements.searchMask.addEventListener(
        'click',
        () => this.closeSearch(),
        { signal: this.#controller.signal },
      );
    }
  }
  bindRightMenuSearch() {
    if (Solitude.config.right_menu && this.elements.menuSearch) {
      this.elements.menuSearch.addEventListener(
        'click',
        () => {
          Solitude.hideRightMenu?.();
          this.openSearch();
          if (Solitude.selectedText) {
            const searchInput = document.querySelector<HTMLInputElement>(
              '.ais-SearchBox-input',
            );
            if (searchInput) {
              searchInput.value = Solitude.selectedText;
              const event = new Event('input', { bubbles: true });
              searchInput.dispatchEvent(event);
            }
          }
        },
        { signal: this.#controller.signal },
      );
    }
  }
  bindPjaxEvents() {
    window.addEventListener(
      'solitude:afterNavigate',
      () => {
        if (
          this.elements.searchMask &&
          !Solitude.isHidden(this.elements.searchMask)
        ) {
          this.closeSearch();
        }
        this.elements = this.cacheElements();
        this.bindSearchEvents();
      },
      { signal: this.#controller.signal },
    );
    if (Solitude.pjax && this.searchInstance) {
      this.searchInstance.on('render', () => {
        const hitsElement = document.getElementById('algolia-hits');
        if (hitsElement) {
          Solitude.pjax?.refresh(hitsElement);
        }
      });
    }
  }
  bindKeyboardShortcuts() {
    document.addEventListener(
      'keydown',
      (event) => {
        if (event.ctrlKey && event.key === 'k') {
          event.preventDefault();
          this.openSearch();
          return;
        }
        if (event.code === 'Escape' && this.isSearchOpen()) {
          this.closeSearch();
        }
      },
      { signal: this.#controller.signal },
    );
  }
  openSearch() {
    if (!this.elements.searchMask || !this.elements.searchDialog) return;
    Solitude.animateIn(this.elements.searchMask, 'to_show 0.5s');
    this.elements.searchDialog.style.display = 'flex';
    // Focus after the opening animation has started.
    this.delayedFocus(100);
    this.fixSafariHeight();
    window.addEventListener('resize', this.fixSafariHeight, {
      signal: this.#controller.signal,
    });
    // Keep the shared theme action bound to the current controller.
    Solitude.openSearch = () => this.openSearch();
  }
  closeSearch() {
    window.clearTimeout(this.#focusTimer);
    if (!this.elements.searchMask || !this.elements.searchDialog) return;
    Solitude.animateOut(this.elements.searchDialog, 'search_close .5s');
    Solitude.animateOut(this.elements.searchMask, 'to_hide 0.5s');
    window.removeEventListener('resize', this.fixSafariHeight);
  }
  isSearchOpen() {
    return this.elements.searchDialog?.style.display === 'flex';
  }
  fixSafariHeight = () => {
    if (window.innerWidth < 768 && this.elements.searchDialog) {
      this.elements.searchDialog.style.setProperty(
        '--search-height',
        `${window.innerHeight}px`,
      );
    }
  };
  destroy() {
    this.#controller.abort();
    window.clearTimeout(this.#focusTimer);
    if (this.searchInstance) {
      this.searchInstance.dispose();
      this.searchInstance = null;
    }
    this.isInitialized = false;
  }
}
const initializeAlgoliaSearch = () => {
  Solitude.algoliaSearch?.destroy();
  const search = new AlgoliaSearch();
  Solitude.algoliaSearch = search;
  Solitude.onPageCleanup(() => search.destroy());
};
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAlgoliaSearch, {
    once: true,
  });
} else {
  initializeAlgoliaSearch();
}

document.addEventListener('solitude:afterNavigate', initializeAlgoliaSearch);
