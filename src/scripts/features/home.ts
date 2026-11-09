import { Solitude } from '../core/api';
import { lifecycle } from '../core/lifecycle';
export const showTodayCard = () => {
  const el = document.getElementById('todayCard');
  const topGroup = document.querySelector<HTMLElement>('.topGroup');
  lifecycle.listen(topGroup, 'mouseleave', () => el?.classList.remove('hide'));
};

export const initHomeCenter = () => {
  const container = document.getElementById('home_center');
  if (!container || container.dataset.initialized === 'true') return;
  container.dataset.initialized = 'true';
  const banners = [
    ...container.querySelectorAll<HTMLElement>('.home-center-banner-item'),
  ];
  const items = [
    ...container.querySelectorAll<HTMLElement>('.home-center-item'),
  ];
  const indicators = [
    ...container.querySelectorAll<HTMLElement>('.home-center-indicator'),
  ];
  const banner = container.querySelector<HTMLElement>('.home-center-banner');
  const titleLink = container.querySelector<HTMLAnchorElement>(
    '.home-center-title-link',
  );
  const titleTag = container.querySelector<HTMLElement>(
    '.home-center-title-tag span',
  );
  const categoryBar = document.getElementById('category-bar');
  const profileCard = document.querySelector<HTMLElement>(
    '#aside-content .card-info',
  );
  if (!banner || !titleLink || !titleTag) return;
  let activeIndex = 0;
  let scrollFrame = 0;
  let resizeFrame = 0;
  let settleTimer: ReturnType<typeof setTimeout>;
  let touching = false;
  let loopEnabled = false;
  const mobile = window.matchMedia('(max-width: 900px)');
  const clones: HTMLElement[] = [];
  const slideWidth = () => banners[0]?.getBoundingClientRect().width || 0;
  const scrollToIndex = (
    index: number,
    behavior: ScrollBehavior = 'instant',
  ) => {
    banner.scrollTo({
      left: slideWidth() * (index + Number(loopEnabled)),
      behavior,
    });
  };
  const settleLoop = () => {
    if (!loopEnabled || touching) return;
    const width = slideWidth();
    if (!width) return;
    const slot = Math.round(banner.scrollLeft / width);
    // Rebase only after scrolling settles, onto an identical original slide.
    if (Math.abs(banner.scrollLeft - slot * width) > 1) return;
    if (slot === 0) scrollToIndex(banners.length - 1);
    else if (slot === banners.length + 1) scrollToIndex(0);
  };
  const scheduleSettle = () => {
    clearTimeout(settleTimer);
    settleTimer = setTimeout(settleLoop, 180);
  };
  const getCachedColor = (src: string) => {
    try {
      const cache = JSON.parse(localStorage.getItem('Solitude') || '{}') || {};
      const item = cache.postcolor?.[src];
      if (item && (!item.expiration || item.expiration > Date.now())) {
        return item.value;
      }
    } catch (error) {
      return null;
    }
    return null;
  };
  const cacheColor = (src: string, color: string) => {
    try {
      const cache = JSON.parse(localStorage.getItem('Solitude') || '{}') || {};
      cache.postcolor = cache.postcolor || {};
      cache.postcolor[src] = {
        value: color,
        expiration: Date.now() + 43200000,
      };
      localStorage.setItem('Solitude', JSON.stringify(cache));
    } catch (error) {
      // Color caching is optional; rendering must continue without storage.
    }
  };
  const rgbToThemeHex = ([r, g, b]: readonly number[]) =>
    `#${[r, g, b]
      .map((value) =>
        Math.floor(value * 0.8)
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')}`;
  const getAverageColor = (image: HTMLImageElement) => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) throw new Error('Canvas is unavailable');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    const color = [0, 0, 0];
    let count = 0;
    for (let index = 0; index < pixels.length; index += 4) {
      if (pixels[index + 3] < 128) continue;
      color[0] += pixels[index];
      color[1] += pixels[index + 1];
      color[2] += pixels[index + 2];
      count++;
    }
    return count ? color.map((value) => Math.round(value / count)) : null;
  };
  const normalizeHomeCenterColor = (value: string | undefined) => {
    const match = value?.match(/^#([0-9a-f]{6})$/i);
    if (!match) return value;
    const number = parseInt(match[1], 16);
    const rgb = [number >> 16, (number >> 8) & 0xff, number & 0xff];
    const brightness = Math.round(
      (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000,
    );
    if (brightness >= 125) return value;
    return `#${rgb
      .map((channel) =>
        Math.min(channel + 50, 255)
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')}`;
  };
  const getReadableProfileTextColor = (value: string | undefined) => {
    const match = value?.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (!match) return '';
    const hex =
      match[1].length === 3
        ? [...match[1]].map((channel) => channel.repeat(2)).join('')
        : match[1];
    const channels = [0, 2, 4].map(
      (offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255,
    );
    const luminance = channels
      .map((channel) =>
        channel <= 0.04045
          ? channel / 12.92
          : ((channel + 0.055) / 1.055) ** 2.4,
      )
      .reduce(
        (sum, channel, index) =>
          sum + channel * [0.2126, 0.7152, 0.0722][index],
        0,
      );
    const whiteContrast = 1.05 / (luminance + 0.05);
    const blackContrast = (luminance + 0.05) / 0.05;
    return whiteContrast >= blackContrast
      ? 'var(--efu-white)'
      : 'var(--efu-black)';
  };
  const applyItemColor = (index: number, color: string | null | undefined) => {
    if (!color || !banners[index]) return;
    const colorOp = `color-mix(in srgb, ${color} 14%, transparent)`;
    const colorDeep = `color-mix(in srgb, ${color} 87%, transparent)`;
    [
      banners[index],
      ...clones.filter((clone) => Number(clone.dataset.index) === index),
    ].forEach((slide) => {
      slide.style.setProperty('--home-center-theme', color);
      slide.style.setProperty('--home-center-theme-op', colorOp);
      slide.style.setProperty('--home-center-theme-op-deep', colorDeep);
    });
    items[index]?.style.setProperty('--item-theme', color);
    items[index]?.style.setProperty('--item-theme-op', colorOp);
    items[index]?.style.setProperty('--item-theme-op-deep', colorDeep);
    if (activeIndex === index) select(index);
  };
  const extractItemColor = (index: number, sourceImage: HTMLImageElement) => {
    if (banners[index].dataset.color) return;
    const src = sourceImage.currentSrc || sourceImage.src;
    if (!src) return;
    const cachedColor = getCachedColor(src);
    if (cachedColor) {
      applyItemColor(index, normalizeHomeCenterColor(cachedColor));
      return;
    }
    const image = new Image();
    image.crossOrigin = 'Anonymous';
    image.onload = () => {
      if (!container.isConnected) return;
      try {
        const dominantColor = window.ColorThief?.getColorSync(image);
        const rgb = dominantColor
          ? dominantColor.array()
          : getAverageColor(image);
        if (!rgb) return;
        const color = rgbToThemeHex(rgb);
        cacheColor(src, color);
        applyItemColor(index, normalizeHomeCenterColor(color));
      } catch (error) {
        // Canvas access can fail for image hosts without CORS support.
      }
    };
    image.onerror = () => {};
    image.src = src;
  };
  const navigate = (link: string, event?: MouseEvent | KeyboardEvent) => {
    if (!link) return;
    if (event?.metaKey || event?.ctrlKey) {
      window.open(link, '_blank');
    } else {
      Solitude.navigate(link);
    }
  };
  const select = (index: number) => {
    if (!banners[index]) return;
    activeIndex = index;
    banners.forEach((banner, bannerIndex) => {
      const isActive = bannerIndex === index;
      banner.classList.toggle('active', isActive);
      banner.setAttribute('aria-hidden', String(!isActive));
      banner.tabIndex = isActive ? 0 : -1;
    });
    items.forEach((item, itemIndex) => {
      const isActive = itemIndex === index;
      item.classList.toggle('active', isActive);
      item.setAttribute('aria-current', String(isActive));
    });
    indicators.forEach((indicator, indicatorIndex) => {
      indicator.classList.toggle('active', indicatorIndex === index);
      indicator.setAttribute('aria-current', String(indicatorIndex === index));
    });
    const selected = banners[index];
    const selectedStyle = getComputedStyle(selected);
    const color = selectedStyle.getPropertyValue('--home-center-theme').trim();
    const colorOp = selectedStyle
      .getPropertyValue('--home-center-theme-op')
      .trim();
    const colorDeep = selectedStyle
      .getPropertyValue('--home-center-theme-op-deep')
      .trim();
    titleLink.textContent = selected.dataset.title || '';
    titleLink.href = selected.dataset.link || '';
    titleTag.textContent = selected.dataset.label || '';
    container.style.setProperty('--current-theme', color);
    container.style.setProperty('--current-theme-op', colorOp);
    container.style.setProperty('--current-theme-op-deep', colorDeep);
    [categoryBar, profileCard].forEach((target) => {
      target?.style.setProperty('--current-banner-theme', color);
      target?.style.setProperty('--current-banner-theme-op', colorOp);
      target?.style.setProperty('--current-banner-theme-op-deep', colorDeep);
    });
    const profileTextColor = getReadableProfileTextColor(color);
    if (profileTextColor) {
      profileCard?.style.setProperty(
        '--profile-card-text-color',
        profileTextColor,
      );
    }
  };
  items.forEach((item, index) => {
    lifecycle.listen(item, 'mouseenter', () => select(index));
    lifecycle.listen(item, 'focusin', () => select(index));
  });
  const bindBanner = (item: HTMLElement) => {
    // Native touch scrolling suppresses clicks; an actual tap opens the article.
    lifecycle.listen(item, 'click', (event) => {
      navigate(item.dataset.link || '', event);
    });
    lifecycle.listen(item, 'keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        navigate(item.dataset.link || '', event);
      }
    });
  };
  banners.forEach(bindBanner);
  if (banners.length > 1) {
    [banners.length - 1, 0].forEach((index) => {
      const clone = banners[index].cloneNode(true) as HTMLElement;
      clone.dataset.loopClone = 'true';
      clone.setAttribute('aria-hidden', 'true');
      clone.removeAttribute('role');
      clone.tabIndex = -1;
      clone.querySelectorAll('img').forEach((image) => {
        image.loading = 'eager';
        image.alt = '';
      });
      clones.push(clone);
      bindBanner(clone);
    });
  }
  const updateLayout = () => {
    clearTimeout(settleTimer);
    cancelAnimationFrame(scrollFrame);
    touching = false;
    loopEnabled = mobile.matches && clones.length === 2;
    if (loopEnabled) {
      if (!clones[0].isConnected) {
        banner.prepend(clones[0]);
        banner.append(clones[1]);
      }
    } else clones.forEach((clone) => clone.remove());
    banner.dataset.mobileLoop = String(loopEnabled);
    if (mobile.matches) scrollToIndex(activeIndex);
    else banner.scrollTo({ left: 0, behavior: 'instant' });
  };
  let previousWidth = 0;
  const resizeObserver = new ResizeObserver(() => {
    const width = banner.getBoundingClientRect().width;
    if (Math.abs(width - previousWidth) < 0.1) return;
    previousWidth = width;
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(updateLayout);
  });
  resizeObserver.observe(banner);
  lifecycle.listen(mobile, 'change', updateLayout);
  lifecycle.listen(
    banner,
    'touchstart',
    () => {
      touching = true;
      clearTimeout(settleTimer);
    },
    { passive: true },
  );
  const finishTouch = () => {
    touching = false;
    settleLoop();
    scheduleSettle();
  };
  lifecycle.listen(banner, 'touchend', finishTouch, { passive: true });
  lifecycle.listen(banner, 'touchcancel', finishTouch, { passive: true });
  lifecycle.listen(banner, 'scrollend', settleLoop);
  lifecycle.add(() => {
    cancelAnimationFrame(scrollFrame);
    cancelAnimationFrame(resizeFrame);
    clearTimeout(settleTimer);
    resizeObserver.disconnect();
    clones.forEach((clone) => clone.remove());
    delete container.dataset.initialized;
  });
  indicators.forEach((indicator, index) => {
    lifecycle.listen(indicator, 'click', (event) => {
      event.preventDefault();
      select(index);
      if (mobile.matches)
        scrollToIndex(
          index,
          window.matchMedia('(prefers-reduced-motion: reduce)').matches
            ? 'instant'
            : 'smooth',
        );
    });
  });
  lifecycle.listen(banner, 'scroll', () => {
    cancelAnimationFrame(scrollFrame);
    scrollFrame = requestAnimationFrame(() => {
      const width = slideWidth();
      if (!mobile.matches || !width) return;
      const slot = Math.round(banner.scrollLeft / width) - Number(loopEnabled);
      select((slot + banners.length) % banners.length);
      scheduleSettle();
    });
  });
  select(0);
  updateLayout();
  banners.forEach((item, index) => {
    const configuredColor = item.dataset.color?.trim();
    if (configuredColor) {
      applyItemColor(index, configuredColor);
      return;
    }
    const image = item.querySelector<HTMLImageElement>(
      '.home-center-cover-img',
    );
    if (!image) return;
    if (image.complete && image.naturalWidth) {
      extractItemColor(index, image);
    } else {
      lifecycle.listen(image, 'load', () => extractItemColor(index, image), {
        once: true,
      });
    }
  });
};
