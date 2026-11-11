import { uiText } from '../../lib/ui-language';
import { getUiLanguage } from '../language';
import { getArticleLanguage } from '../core/article';
import { Solitude } from '../core/api';
import { lifecycle } from '../core/lifecycle';

interface Stats { postId: string; views: number; likes: number; liked: boolean; }
interface Result { data: Stats; generation: number; }
class InteractionError extends Error {
  constructor(public status: number) { super(`Interactions: HTTP ${status}`); }
}
const updateKey = 'harkerx-interactions-updated';

export function initPostInteractions() {
  if (!Solitude.config.interactions.enable) return;
  const groups = new Map<string, HTMLElement[]>();
  document.querySelectorAll<HTMLElement>('[data-post-stats]').forEach(node => {
    const id = node.dataset.postStats;
    if (id) groups.set(id, [...(groups.get(id) ?? []), node]);
  });
  const article = getArticleLanguage();
  const mount = document.querySelector<HTMLButtonElement>('[data-post-like]');
  const button = mount && article && mount.dataset.postId === article.id ? mount : null;
  const currentId = button ? article!.id : undefined;
  if (currentId && !groups.has(currentId)) groups.set(currentId, []);
  if (!groups.size) return;
  let endpoint: URL;
  try {
    endpoint = new URL(Solitude.config.interactions.endpoint);
    if (endpoint.protocol !== 'https:' || endpoint.username || endpoint.password || endpoint.search || endpoint.hash) return;
  } catch { return; }
  const api = endpoint.href.replace(/\/$/, '') + '/v1/posts/';
  const signal = lifecycle.signal;
  const states = new Map<string, Stats>();
  const generations = new Map<string, number>();
  let busy = Boolean(button);
  let unavailable = false;
  let refreshQueued = false;
  const live = () => !signal.aborted;
  const text = (key: string) => uiText(key, getUiLanguage());

  function renderButton() {
    if (!button?.isConnected || !live()) return;
    const state = currentId ? states.get(currentId) : undefined;
    const liked = state?.liked ?? false;
    const action = liked ? 'postUnlike' : 'postLike';
    button.disabled = busy;
    button.setAttribute('aria-busy', String(busy));
    button.setAttribute('aria-pressed', String(liked));
    button.setAttribute('aria-label', text(action));
    button.dataset.i18nAriaLabel = action;
    button.dataset.i18nTitle = unavailable ? 'postStatsUnavailable' : action;
    button.title = text(button.dataset.i18nTitle);
    button.querySelector<HTMLElement>('[data-post-like-label]')!.textContent = text(liked ? 'postLiked' : 'postLike');
    if (state) button.querySelector<HTMLElement>('[data-post-like-count]')!.textContent = String(state.likes);
  }

  function accept({ data, generation }: Result) {
    if (!live() || generations.get(data.postId) !== generation) return false;
    // Accept decreases too. Request order, rather than max/OR, rejects stale reads.
    states.set(data.postId, data);
    for (const node of groups.get(data.postId) ?? []) {
      if (!node.isConnected) continue;
      node.dataset.statsStatus = 'ready';
      node.removeAttribute('title');
      delete node.dataset.i18nTitle;
      node.querySelectorAll<HTMLElement>('[data-post-views]').forEach(e => e.textContent = String(data.views));
      node.querySelectorAll<HTMLElement>('[data-post-likes]').forEach(e => e.textContent = String(data.likes));
    }
    if (data.postId === currentId) { unavailable = false; renderButton(); }
    return true;
  }

  function markUnavailable(id: string) {
    if (!live()) return;
    for (const node of groups.get(id) ?? []) {
      node.dataset.statsStatus = 'error';
      node.title = text('postStatsReadError');
      node.dataset.i18nTitle = 'postStatsReadError';
    }
    if (id === currentId) unavailable = true;
  }

  async function request(id: string, suffix = '', method = 'GET'): Promise<Result> {
    if (!live()) throw new DOMException('Page disposed', 'AbortError');
    const generation = (generations.get(id) ?? 0) + 1;
    generations.set(id, generation);
    const controller = new AbortController();
    const abort = () => controller.abort();
    signal.addEventListener('abort', abort, { once: true });
    const timer = window.setTimeout(abort, 10000);
    try {
      const response = await fetch(api + encodeURIComponent(id) + suffix, {
        method, credentials: 'include', cache: 'no-store', signal: controller.signal,
        headers: method === 'GET' ? { Accept: 'application/json' } : { 'X-HarkerX-Action': '1' },
      });
      if (!response.ok) throw new InteractionError(response.status);
      const data: Stats = await response.json();
      if (data.postId !== id || typeof data.liked !== 'boolean' ||
        ![data.views, data.likes].every(n => Number.isSafeInteger(n) && n >= 0)) {
        throw new Error('Invalid interaction response');
      }
      return { data, generation };
    } finally {
      clearTimeout(timer);
      signal.removeEventListener('abort', abort);
    }
  }

  function finishBusy() {
    busy = false;
    renderButton();
    if (refreshQueued && currentId && live()) {
      refreshQueued = false;
      void request(currentId).then(accept).catch(() => {});
    }
  }

  async function initialize() {
    const ids = [...groups.keys()];
    const firstId = currentId ?? ids[0];
    const handshake = async () => { accept(await request(firstId)); };
    // Finish one credentialed GET before parallel reads can issue competing cookies.
    if (navigator.locks) await navigator.locks.request('harkerx-interactions-session', { signal }, handshake);
    else await handshake();
    if (!live()) return;
    await Promise.all(ids.map(async id => {
      try {
        if (id === currentId) accept(await request(id, '/view', 'POST'));
        else if (id !== firstId) accept(await request(id));
      } catch { markUnavailable(id); }
    }));
  }

  if (button && currentId) lifecycle.listen(button, 'click', async () => {
    if (!live() || busy) return;
    busy = true;
    let desired = true;
    renderButton();
    try {
      if (!states.has(currentId)) accept(await request(currentId));
      if (!live()) return;
      desired = !states.get(currentId)!.liked;
      let result: Result;
      try { result = await request(currentId, '/like', desired ? 'PUT' : 'DELETE'); }
      catch (error) {
        if (!(error instanceof InteractionError) || error.status !== 428) throw error;
        accept(await request(currentId));
        if (!live()) return;
        result = await request(currentId, '/like', desired ? 'PUT' : 'DELETE');
      }
      if (result.data.liked !== desired) throw new Error('Unexpected reaction state');
      if (!accept(result) || !live()) return;
      try { localStorage.setItem(updateKey, JSON.stringify({ postId: currentId, nonce: crypto.randomUUID() })); }
      catch { /* Cross-tab refresh is optional when storage is unavailable. */ }
      Solitude.snackbarShow(text(desired ? 'postLikeSuccess' : 'postUnlikeSuccess'), false, 2000);
    } catch (error) {
      if (live()) Solitude.snackbarShow(text(error instanceof InteractionError && error.status === 429
        ? 'postStatsRateLimited' : desired ? 'postStatsError' : 'postUnlikeError'), false, 3000);
    } finally { finishBusy(); }
  });

  window.addEventListener('storage', event => {
    if (event.key !== updateKey || !event.newValue || !live()) return;
    try {
      const id: unknown = JSON.parse(event.newValue).postId;
      if (typeof id === 'string' && groups.has(id)) {
        if (id === currentId && busy) { refreshQueued = true; return; }
        // A subsequent local mutation gets a newer generation than this read.
        void request(id).then(accept).catch(() => {});
      }
    } catch { /* Ignore malformed external storage events. */ }
  }, { signal });
  renderButton();
  void initialize().catch(error => {
    if (!live()) return;
    groups.forEach((_nodes, id) => markUnavailable(id));
    console.warn('Article statistics unavailable:', error);
  }).finally(finishBusy);
}
