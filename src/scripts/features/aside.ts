import { Solitude } from '../core/api';
import { lifecycle } from '../core/lifecycle';

export const hasPageAside = (): boolean =>
  Boolean(document.getElementById('aside-content'));

export function restoreAsideStatus(root = document.documentElement): void {
  root.classList.toggle(
    'hide-aside',
    Solitude.saveToLocal.get('aside-status') === 'hide',
  );
}

// Apply the preference before Astro displays the incoming page.
document.addEventListener('astro:before-swap', (event) => {
  restoreAsideStatus(event.newDocument.documentElement);
});

export const initGreeting = () => {
  Solitude.setTimeState();
  lifecycle.listen(document, 'visibilitychange', () => {
    if (document.hidden) Solitude.wasPageHidden = true;
    else Solitude.setTimeState();
  });
  const timer = window.setInterval(() => {
    if (!document.hidden) Solitude.setTimeState();
  }, 60_000);
  lifecycle.add(() => window.clearInterval(timer));
};

export const asideActions = {
  timeoutId: undefined as ReturnType<typeof setTimeout> | undefined,
  lastWittyWord: '',
  wasPageHidden: false,
  consoleNavState: null as { fixed: boolean; visible: boolean } | null,
  switchHideAside() {
    if (!hasPageAside()) return;
    const htmlClassList = document.documentElement.classList;
    const consoleHideAside =
      document.querySelector<HTMLElement>('#consoleHideAside');
    const isHideAside = htmlClassList.contains('hide-aside');
    Solitude.saveToLocal.set('aside-status', isHideAside ? 'show' : 'hide', 1);
    htmlClassList.toggle('hide-aside');
    consoleHideAside?.classList.toggle('on', !isHideAside);
    Solitude.rightMenu?.updateAside();
    Solitude.hideRightMenu?.();
  },
  initConsoleState() {
    const consoleHideAside =
      document.querySelector<HTMLElement>('#consoleHideAside');
    if (!consoleHideAside) return;
    consoleHideAside?.classList.toggle(
      'on',
      document.documentElement.classList.contains('hide-aside'),
    );
  },
  changeWittyWord() {
    const greetings = Solitude.config.aside.witty_words || [];
    if (greetings.length === 0) {
      document.getElementById('sayhi')!.textContent = 'Solitude';
      Solitude.lastWittyWord = '';
      return;
    }
    const greetingElement = document.getElementById('sayhi');
    let randomGreeting;
    if (greetings.length === 1) {
      randomGreeting = greetings[0];
    } else {
      do {
        randomGreeting =
          greetings[Math.floor(Math.random() * greetings.length)];
      } while (randomGreeting === Solitude.lastWittyWord);
    }
    greetingElement!.textContent = randomGreeting;
    Solitude.lastWittyWord = randomGreeting;
  },
  showConsole() {
    const consoleElement = document.getElementById('console');
    if (!consoleElement || consoleElement.classList.contains('show')) return;
    const header = document.getElementById('page-header');
    if (header) {
      Solitude.consoleNavState = {
        fixed: header.classList.contains('nav-fixed'),
        visible: header.classList.contains('nav-visible'),
      };
      header.classList.add('nav-fixed');
      header.classList.remove('nav-visible');
      header.classList.add('console-open');
    }
    consoleElement.classList.add('show');
    document
      .querySelector<HTMLElement>('#nav-console .console_switchbutton')
      ?.classList.add('console-open');
  },
  hideConsole() {
    const consoleElement = document.getElementById('console');
    if (!consoleElement?.classList.contains('show')) return;
    consoleElement.classList.remove('show');
    document
      .querySelector<HTMLElement>('#nav-console .console_switchbutton')
      ?.classList.remove('console-open');
    const header = document.getElementById('page-header');
    if (header && Solitude.consoleNavState) {
      header.classList.remove('console-open');
      header.classList.toggle('nav-fixed', Solitude.consoleNavState.fixed);
      header.classList.toggle('nav-visible', Solitude.consoleNavState.visible);
    }
    Solitude.consoleNavState = null;
  },
  toggleConsole() {
    const consoleElement = document.getElementById('console');
    if (consoleElement?.classList.contains('show')) {
      Solitude.hideConsole();
    } else {
      Solitude.showConsole();
    }
  },
  onConsoleCardGroupClick(event: MouseEvent) {
    if (
      (event.target instanceof Element ? event.target : null)?.closest?.(
        '.console-card',
      )
    )
      return;
    Solitude.hideConsole();
  },
  onNavBlankClickCloseConsole(event: MouseEvent) {
    if (!document.getElementById('console')?.classList.contains('show')) return;
    if (
      (event.target instanceof Element ? event.target : null)?.closest?.(
        'a, button, .back-home-button, .menus_item, #page-name',
      )
    ) {
      return;
    }
    Solitude.hideConsole();
  },
  setTimeState() {
    const el = document.getElementById('sayhi');
    if (el) {
      const hours = new Date().getHours();
      const lang = Solitude.config.aside.state;
      const nick = getLocalNickname([
        'twikoo',
        'WALINE_USER_META',
        'WALINE_USER',
        '_v_Cache_Meta',
        'ArtalkUser',
      ]);
      function getLocalNickname(keys: string[]): string | null {
        for (const key of keys) {
          try {
            const raw = localStorage.getItem(key);
            if (!raw) continue;
            const data: unknown = JSON.parse(raw);
            if (!data || typeof data !== 'object') continue;
            const cached = data as Record<string, unknown>;
            for (const value of [cached.nick, cached.display_name]) {
              if (typeof value === 'string' && value.trim()) return value.trim();
            }
          } catch {
            // A stale provider cache or unavailable storage must not hide the greeting.
          }
        }
        return null;
      }
      const prefix = Solitude.wasPageHidden
        ? Solitude.config.aside.witty_comment.back + nick
        : Solitude.config.aside.witty_comment.prefix + nick;
      const greetings = [
        { start: 0, end: 5, text: nick ? prefix : lang.goodnight },
        { start: 6, end: 10, text: nick ? prefix : lang.morning },
        { start: 11, end: 13, text: nick ? prefix : lang.noon },
        { start: 14, end: 17, text: nick ? prefix : lang.afternoon },
        { start: 18, end: 23, text: nick ? prefix : lang.night },
      ];
      const greeting = greetings.find(
        (g) => hours >= g.start && hours <= g.end,
      );
      el.innerText = greeting?.text || '';
    }
  },
  addNavBackgroundInit() {
    const scrollTop = document.documentElement.scrollTop;
    if (scrollTop !== 0) {
      document
        .getElementById('page-header')
        ?.classList.add('nav-fixed', 'nav-visible');
    }
  },
};
