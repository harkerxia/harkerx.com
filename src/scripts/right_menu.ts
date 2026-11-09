/** Browser behavior preserved from Solitude Hugo; typed boundary: core/api.ts. */
import { Solitude } from "./core/api";
import { lifecycle } from "./core/lifecycle";
import { hasPageAside } from "./features/aside";
let selectTextNow = "";
let firstShowRightMenu = true;
const selectText = (event?: Event) => {
  // Clicking the menu must not replace the selection saved when it opened.
  if (event?.target instanceof Element && event.target.closest("#rightMenu, #rightmenu-mask")) return;
  selectTextNow = window.getSelection()?.toString() || "";
  Solitude.selectedText = selectTextNow;
};
const commentsEnabled = () =>
  Boolean(Solitude.config.comment?.use && Solitude.page.comment);
document.addEventListener("mouseup", selectText);
document.addEventListener("dblclick", selectText);
const queryMenuItems = (root: ParentNode = document) => ({
  other: root.querySelectorAll<HTMLElement>(".rightMenuOther"),
  plugin: root.querySelectorAll<HTMLElement>(".rightMenuPlugin"),
  back: root.querySelector<HTMLElement>("#menu-backward"),
  forward: root.querySelector<HTMLElement>("#menu-forward"),
  refresh: root.querySelector<HTMLElement>("#menu-refresh"),
  top: root.querySelector<HTMLElement>("#menu-top"),
  copy: root.querySelector<HTMLElement>("#menu-copytext"),
  paste: root.querySelector<HTMLElement>("#menu-pastetext"),
  comment: root.querySelector<HTMLElement>("#menu-commenttext"),
  new: root.querySelector<HTMLElement>("#menu-newwindow"),
  copyLink: root.querySelector<HTMLElement>("#menu-copylink"),
  copyImg: root.querySelector<HTMLElement>("#menu-copyimg"),
  downloadImg: root.querySelector<HTMLElement>("#menu-downloadimg"),
  search: root.querySelector<HTMLElement>("#menu-search"),
  barrage: root.querySelector<HTMLElement>("#menu-commentBarrage"),
  mode: root.querySelector<HTMLElement>("#menu-darkmode"),
  aside: root.querySelector<HTMLElement>("#menu-aside"),
  translate: root.querySelector<HTMLElement>("#menu-translate"),
  music: [
    root.querySelector<HTMLElement>("#menu-music-toggle"),
    root.querySelector<HTMLElement>("#menu-music-back"),
    root.querySelector<HTMLElement>("#menu-music-forward"),
    root.querySelector<HTMLElement>("#menu-music-copyMusicName"),
  ],
});

async function imageAsPng(source: string): Promise<Blob> {
  const response = await fetch(source);
  if (!response.ok) throw new Error(`Image request failed: ${response.status}`);
  const blob = await response.blob();
  if (!blob.size || !blob.type.startsWith("image/")) {
    throw new Error("The response is not an image");
  }
  if (blob.type === "image/png") return blob;

  // PNG is the interoperable image format for the system clipboard.
  const objectUrl = URL.createObjectURL(blob);
  try {
    const image = new Image();
    image.src = objectUrl;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Image conversion is unavailable");
    context.drawImage(image, 0, 0);
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (png) =>
          png ? resolve(png) : reject(new Error("Image conversion failed")),
        "image/png",
      );
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export const rm = {
  mask: null as HTMLElement | null,
  menu: null as HTMLElement | null,
  width: 0,
  height: 0,
  domhref: "",
  domsrc: "",
  globalEvent: null as MouseEvent | null,
  menuItems: queryMenuItems(document.createDocumentFragment()),
  showRightMenu(e: boolean, x = 0, y = 0) {
    if (!this.menu || !this.mask) return;
    this.menu.style.top = `${y}px`;
    this.menu.style.left = `${x}px`;
    this.menu.style.display = e ? "block" : "none";
    this.mask.style.display = e ? "flex" : "none";
  },
  hideRightMenu() {
    this.showRightMenu(false);
  },
  reLoadSize() {
    if (!this.menu) return;
    this.menu.style.display = "block";
    this.width = this.menu.offsetWidth;
    this.height = this.menu.offsetHeight;
    this.menu.style.display = "none";
  },
  copyText(e: string) {
    this.hideRightMenu();
    void Solitude.copy(e);
  },
  async pasteText() {
    const target = this.globalEvent?.target;
    if (!(
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement
    ))
      return false;
    try {
      const value = await navigator.clipboard.readText();
      target.setRangeText(
        value,
        target.selectionStart || 0,
        target.selectionEnd || 0,
        "end",
      );
      target.dispatchEvent(new Event("input", { bubbles: true }));
      return true;
    } catch {
      return false;
    }
  },
  async downloadImage(
    this: { domsrc: string },
    imageUrl = this.domsrc,
    filename = "photo",
  ) {
    const rightConfig = Solitude.config.right_menu;
    if (!rightConfig) return;
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error(`Image request failed: ${response.status}`);
      const blob = await response.blob();
      if (!blob.size) throw new Error("The image response is empty");
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      Solitude.snackbarShow(rightConfig.img_error, false, 2000);
    }
  },
  async copyImage(this: { domsrc: string }, imgUrl = this.domsrc) {
    const rightConfig = Solitude.config.right_menu;
    if (!rightConfig) return;
    if (
      !window.isSecureContext ||
      !navigator.clipboard?.write ||
      typeof ClipboardItem === "undefined"
    ) {
      Solitude.snackbarShow(rightConfig.img_copy_error, false, 3000);
      return;
    }

    let imageFailed = false;
    const png = imageAsPng(imgUrl).catch((error: unknown) => {
      imageFailed = true;
      throw error;
    });
    // The clipboard may reject before the image request finishes.
    void png.catch(() => {});
    try {
      // Start writing within the click gesture; resolve the image asynchronously.
      await navigator.clipboard.write([new ClipboardItem({ "image/png": png })]);
      Solitude.snackbarShow(Solitude.config.lang.copy.success, false, 2000);
    } catch {
      Solitude.snackbarShow(
        imageFailed ? rightConfig.img_error : rightConfig.img_copy_error,
        false,
        3000,
      );
    }
  },
  setLabel(element: HTMLElement | null | undefined, label: string | undefined) {
    if (!element || !label) return;
    element.textContent = label;
    element.setAttribute("title", label);
    element.setAttribute("heotip", label);
    const menuItem = element.closest(".rightMenu-item");
    if (menuItem) {
      menuItem.setAttribute("title", label);
      menuItem.setAttribute("heotip", label);
    }
  },
  mode(darkmode: boolean) {
    const rightConfig = Solitude.config.right_menu;
    if (!rightConfig) return;
    const label = darkmode ? rightConfig.mode.light : rightConfig.mode.dark;
    this.setLabel(
      document.querySelector<HTMLElement>(".menu-darkmode-text"),
      label,
    );
    this.hideRightMenu();
  },
  updateAside(): void {
    const button = this.menuItems.aside;
    const rightConfig = Solitude.config.right_menu;
    if (!button || !rightConfig) return;
    const available =
      hasPageAside() && window.matchMedia("(min-width: 1200px)").matches;
    button.hidden = !available;
    button.style.display = available ? "flex" : "none";
    if (!available) return;
    const hidden = document.documentElement.classList.contains("hide-aside");
    this.setLabel(
      button.querySelector<HTMLElement>(".menu-aside-text"),
      hidden ? rightConfig.aside.show : rightConfig.aside.hide,
    );
    button.setAttribute("aria-expanded", String(!hidden));
  },
  barrage(enable: boolean) {
    const rightConfig = Solitude.config.right_menu;
    if (!rightConfig) return;
    const label = enable ? rightConfig.barrage.open : rightConfig.barrage.close;
    this.setLabel(
      document.querySelector<HTMLElement>(".menu-commentBarrage-text"),
      label,
    );
    this.hideRightMenu();
  },
};
Solitude.rightMenu = rm;
Solitude.hideRightMenu = rm.hideRightMenu.bind(rm);
document.addEventListener("contextmenu", (ele) => {
  const rightConfig = Solitude.config.right_menu;
  if (!rightConfig) return;
  if (!Solitude.config.right_menu || !rm.menu || !rm.mask) return;
  if (document.body.clientWidth <= 768) return;
  rm.updateAside();
  if (rightConfig.ctrlOriginalMenu) {
    if (firstShowRightMenu) {
      firstShowRightMenu = false;
      Solitude.snackbarShow(rightConfig.ctrlOriginalMenu, false, 2000);
    }
    if (ele.ctrlKey) return true;
  }
  selectText();
  let x = ele.clientX + 10;
  let y = ele.clientY;
  Array.from(rm.menuItems.other).forEach((item) => {
    if (item) item.style.display = "flex";
  });
  rm.globalEvent = ele;
  const target = ele.target;
  if (!(target instanceof Element)) return;
  const link = target.closest<HTMLAnchorElement>("a[href]")?.href || "";
  const src = target instanceof HTMLImageElement ? target.currentSrc : "";
  const tagName = target.tagName.toLowerCase();
  const cls = (target.getAttribute("class") || "").toLowerCase();
  const display =
    !!(selectTextNow && window.getSelection()) ||
    !!link ||
    !!src ||
    tagName === "input" ||
    tagName === "textarea" ||
    cls.match(/aplayer/);
  if (rm.menuItems.copy)
    rm.menuItems.copy.style.display =
      selectTextNow && window.getSelection() ? "flex" : "none";
  rm.menuItems.comment &&
    (rm.menuItems.comment.style.display =
      commentsEnabled() && selectTextNow && window.getSelection()
        ? "flex"
        : "none");
  rm.menuItems.search &&
    (rm.menuItems.search.style.display =
      selectTextNow && window.getSelection() ? "flex" : "none");
  if (rm.menuItems.new) rm.menuItems.new.style.display = link ? "flex" : "none";
  if (rm.menuItems.copyLink)
    rm.menuItems.copyLink.style.display = link ? "flex" : "none";
  rm.domhref = link || "";
  if (rm.menuItems.copyImg)
    rm.menuItems.copyImg.style.display = src ? "flex" : "none";
  if (rm.menuItems.downloadImg)
    rm.menuItems.downloadImg.style.display = src ? "flex" : "none";
  rm.domsrc = src || "";
  if (rm.menuItems.paste)
    rm.menuItems.paste.style.display =
      tagName === "input" || tagName === "textarea" ? "flex" : "none";
  if (rightConfig.music) {
    if (cls.match(/aplayer/)) {
      rm.menuItems.music.forEach((item) => {
        if (item) item.style.display = "flex";
      });
    } else {
      rm.menuItems.music.forEach((item) => {
        if (item) item.style.display = "none";
      });
    }
  }
  Array.from(display ? rm.menuItems.other : rm.menuItems.plugin).forEach(
    (item) => {
      if (item) item.style.display = "none";
    },
  );
  Array.from(display ? rm.menuItems.plugin : rm.menuItems.other).forEach(
    (item) => (item.style.display = "block"),
  );
  rm.reLoadSize();
  x = x + rm.width > window.innerWidth ? x - (rm.width + 10) : x;
  y =
    y + rm.height > window.innerHeight
      ? y - (y + rm.height - window.innerHeight)
      : y;
  rm.showRightMenu(true, x, y);
  ele.preventDefault();
});
// Astro replaces the menu on navigation, while this module stays cached.
// Reacquire its elements and bind handlers for the current page lifecycle.
export function initializeRightMenu() {
  const rightConfig = Solitude.config.right_menu;
  if (!rightConfig) return;
  rm.mask = document.getElementById("rightmenu-mask");
  rm.menu = document.getElementById("rightMenu");
  rm.menuItems = queryMenuItems();
  selectTextNow = "";
  Solitude.selectedText = "";
  rm.globalEvent = null;
  if (!rm.menu || !rm.mask) return;
  lifecycle.add(() => {
    rm.hideRightMenu();
    rm.menu = null;
    rm.mask = null;
    rm.menuItems = queryMenuItems(document.createDocumentFragment());
    rm.globalEvent = null;
    selectTextNow = "";
    Solitude.selectedText = "";
  });
  rm.mode(document.documentElement.dataset.theme === "dark");
  rm.updateAside();
  const hideMenu = rm.hideRightMenu.bind(rm);
  lifecycle.listen(rm.menu, "wheel", hideMenu, { passive: true });
  lifecycle.listen(rm.mask, "wheel", hideMenu, { passive: true });
  lifecycle.listen(rm.mask, "click", hideMenu);
  const addEventListener = (
    element: HTMLElement | null,
    event: keyof HTMLElementEventMap,
    handler: EventListener,
  ) => lifecycle.listen(element, event, handler);
  addEventListener(rm.menuItems.back, "click", () => {
    window.history.back();
    rm.hideRightMenu();
  });
  addEventListener(rm.menuItems.forward, "click", () => {
    window.history.forward();
    rm.hideRightMenu();
  });
  addEventListener(rm.menuItems.refresh, "click", () =>
    window.location.reload(),
  );
  addEventListener(rm.menuItems.top, "click", () => {
    Solitude.toTop();
    rm.hideRightMenu();
  });
  if (rightConfig.music) {
    addEventListener(rm.menuItems.music[0], "click", () => {
      Solitude.musicToggle();
      rm.hideRightMenu();
    });
    addEventListener(rm.menuItems.music[1], "click", () => {
      Solitude.musicSkipBack();
      rm.hideRightMenu();
    });
    addEventListener(rm.menuItems.music[2], "click", () => {
      Solitude.musicSkipForward();
      rm.hideRightMenu();
    });
    addEventListener(rm.menuItems.music[3], "click", () => {
      const title = Array.from(
        document.querySelectorAll<HTMLElement>(".aplayer-title"),
      ).map((e) => e.innerText)[0];
      rm.copyText(title);
    });
  }
  addEventListener(rm.menuItems.copy, "click", () => {
    rm.copyText(selectTextNow);
  });
  if (Solitude.saveToLocal.get("commentBarrageSwitch") !== null) {
    rm.menuItems.barrage &&
      rm.barrage(!Solitude.saveToLocal.get("commentBarrageSwitch"));
  }
  addEventListener(rm.menuItems.paste, "click", async () => {
    if (await rm.pasteText()) rm.hideRightMenu();
  });
  addEventListener(rm.menuItems.comment, "click", () => {
    rm.hideRightMenu();
    void Solitude.toTalk(selectTextNow);
  });
  addEventListener(
    rm.menuItems.new,
    "click",
    () => window.open(rm.domhref) && rm.hideRightMenu(),
  );
  addEventListener(rm.menuItems.downloadImg, "click", () => {
    void rm.downloadImage();
    rm.hideRightMenu();
  });
  addEventListener(rm.menuItems.copyImg, "click", () => {
    void rm.copyImage();
    rm.hideRightMenu();
  });
  addEventListener(rm.menuItems.copyLink, "click", () => {
    rm.copyText(rm.domhref);
    rm.hideRightMenu();
  });
}
