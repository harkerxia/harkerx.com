import { uiText } from '../../lib/ui-language';
import { getUiLanguage } from '../language';
import { getArticleLanguage } from '../core/article';
import { Solitude } from '../core/api';
import { lifecycle } from '../core/lifecycle';

interface Stats { postId: string; views: number; likes: number; liked: boolean; }
class InteractionError extends Error {
  constructor(public status: number) { super(`Interactions: HTTP ${status}`); }
}

export function initPostInteractions() {
  const mount = document.querySelector<HTMLButtonElement>('[data-post-like]');
  const article = getArticleLanguage();
  if (!mount || !article || mount.dataset.postId !== article.id) return;
  const button = mount;
  let endpoint: URL;
  try {
    endpoint = new URL(button.dataset.interactionsEndpoint || '');
    if (endpoint.protocol !== 'https:' || endpoint.username || endpoint.password || endpoint.search || endpoint.hash) return;
  } catch { return; }
  const api = `${endpoint.href.replace(/\/$/, '')}/v1/posts/${encodeURIComponent(article.id)}`;
  const signal = lifecycle.signal;
  const views = document.querySelector<HTMLElement>('[data-post-views]');
  const count = button.querySelector<HTMLElement>('[data-post-like-count]')!;
  const label = button.querySelector<HTMLElement>('[data-post-like-label]')!;
  let state: Stats | undefined;
  let busy = false;
  let unavailable = false;
  const live = () => !signal.aborted && button.isConnected;
  const text = (key: string) => uiText(key, getUiLanguage());

  function render() {
    if (!live()) return;
    const liked = state?.liked ?? false;
    button.disabled = busy || liked;
    button.setAttribute('aria-busy', String(busy));
    button.setAttribute('aria-pressed', String(liked));
    const key = liked ? 'postLiked' : 'postLike';
    label.textContent = text(key);
    button.setAttribute('aria-label', text(key));
    button.title = text(unavailable ? 'postStatsUnavailable' : key);
    button.dataset.i18nTitle = unavailable ? 'postStatsUnavailable' : key;
    button.dataset.i18nAriaLabel = key;
    if (state) {
      count.textContent = String(state.likes);
      if (views) views.textContent = String(state.views);
    }
  }

  function accept(data: Stats) {
    unavailable = false;
    state = {
      ...data,
      // A delayed read must not undo this page's confirmed like or newer totals.
      liked: Boolean(state?.liked || data.liked),
      likes: Math.max(state?.likes ?? 0, data.likes),
      views: Math.max(state?.views ?? 0, data.views),
    };
    render();
  }

  async function request(suffix = '', method = 'GET'): Promise<Stats> {
    const controller = new AbortController();
    const abort = () => controller.abort();
    signal.addEventListener('abort', abort, { once: true });
    const timer = window.setTimeout(abort, 10000);
    try {
      const response = await fetch(api + suffix, {
        method, credentials: 'include', cache: 'no-store', signal: controller.signal,
        headers: method === 'GET' ? { Accept: 'application/json' } : { 'X-HarkerX-Action': '1' },
      });
      if (!response.ok) throw new InteractionError(response.status);
      const data: Stats = await response.json();
      if (data.postId !== article!.id || typeof data.liked !== 'boolean' ||
        ![data.views, data.likes].every(n => Number.isSafeInteger(n) && n >= 0)) {
        throw new Error('Invalid interaction response');
      }
      return data;
    } finally {
      clearTimeout(timer);
      signal.removeEventListener('abort', abort);
    }
  }

  async function initialize() {
    accept(await request());
    if (!live()) return;
    try { accept(await request('/view', 'POST')); }
    catch (error) {
      if (error instanceof InteractionError && error.status === 428) {
        // A missing/blocked cookie cannot safely identify a new mutation.
        throw error;
      }
      // Keep valid read-only totals when recording a visit fails.
      unavailable = true;
    }
  }

  lifecycle.listen(button, 'click', async () => {
    if (!live() || busy || state?.liked) return;
    busy = true;
    render();
    try {
      if (!state) await initialize();
      if (!live()) return;
      if (!state?.liked) {
        try { accept(await request('/like', 'PUT')); }
        catch (error) {
          if (!(error instanceof InteractionError) || error.status !== 428) throw error;
          accept(await request());
          if (!live()) return;
          accept(await request('/like', 'PUT'));
        }
      }
      if (live()) Solitude.snackbarShow(text('postLikeSuccess'), false, 2000);
    } catch (error) {
      if (live()) Solitude.snackbarShow(text(
        error instanceof InteractionError && error.status === 429 ? 'postStatsRateLimited' : 'postStatsError',
      ), false, 3000);
    } finally { busy = false; render(); }
  });

  busy = true;
  render();
  // Serializing initial cookie handshakes avoids first-visit races between tabs.
  const init = () => live() ? initialize() : Promise.resolve();
  const task = navigator.locks
    ? navigator.locks.request('harkerx-interactions-session', { signal }, init)
    : init();
  void task.catch(() => {
    unavailable = true;
  }).finally(() => { busy = false; render(); });
}
