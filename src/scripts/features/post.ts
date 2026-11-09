import { Solitude } from "../core/api";
import { lifecycle } from "../core/lifecycle";

const findCommentEditor = (root: HTMLElement) =>
  root.querySelector<HTMLTextAreaElement>(
    "textarea.tk-textarea__inner, textarea.el-textarea__inner, textarea#wl-edit, textarea#veditor, textarea.atk-textarea",
  );

const waitForCommentEditor = (
  root: HTMLElement,
  signal: AbortSignal,
): Promise<HTMLTextAreaElement | null> => {
  if (signal.aborted) return Promise.resolve(null);
  const editor = findCommentEditor(root);
  if (editor) return Promise.resolve(editor);
  return new Promise((resolve) => {
    const finish = (editor: HTMLTextAreaElement | null) => {
      observer.disconnect();
      clearTimeout(timer);
      signal.removeEventListener("abort", onAbort);
      resolve(editor);
    };
    const onAbort = () => finish(null);
    const observer = new MutationObserver(() => {
      if (!root.isConnected) return finish(null);
      const editor = findCommentEditor(root);
      if (editor) finish(editor);
    });
    const timer = setTimeout(() => finish(null), 8000);
    observer.observe(root, { childList: true, subtree: true });
    signal.addEventListener("abort", onAbort, { once: true });
  });
};

export const postActions = {
  switchCommentBarrage() {
    const commentBarrageElement =
      document.querySelector<HTMLElement>(".comment-barrage");
    const consoleCommentBarrage = document.querySelector<HTMLElement>(
      "#consoleCommentBarrage",
    );
    if (!commentBarrageElement) return;
    const isDisplayed =
      window.getComputedStyle(commentBarrageElement).display === "flex";
    commentBarrageElement.style.display = isDisplayed ? "none" : "flex";
    consoleCommentBarrage?.classList.toggle("on", !isDisplayed);
    Solitude.saveToLocal.set("commentBarrageSwitch", !isDisplayed, 0.2);
    if (Solitude.rightMenu?.menuItems.barrage) {
      Solitude.rightMenu.barrage(isDisplayed);
    }
  },
  refreshWaterFall() {
    const allElements = [
      ...document.querySelectorAll<HTMLElement>(".waterfall"),
    ];
    const elements = allElements.filter(
      (element) =>
        element.childElementCount > 0 &&
        !element.closest("solitude-notes") &&
        element.dataset.solitudeWaterfall !== "true",
    );
    if (!elements.length) return;
    elements.forEach((element) => {
      element.dataset.solitudeWaterfall = "true";
    });
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          observer.unobserve(entry.target);
          const timer = setTimeout(() => {
            timers.delete(timer);
            if (!entry.target.isConnected || !entry.target.childElementCount) return;
            window.waterfall?.(entry.target).then(() => {
              if (entry.target.isConnected) entry.target.classList.add("show");
            });
          }, 300);
          timers.add(timer);
        }
      });
    });
    elements.forEach((element) => observer.observe(element));
    lifecycle.add(() => {
      observer.disconnect();
      timers.forEach(clearTimeout);
    });
  },
  addRuntime() {
    if (!Solitude.config.runtime) return;
    const runtime =
      Solitude.timeDiff(new Date(String(Solitude.config.runtime)), new Date()) +
      Solitude.config.lang.day;
    document
      .querySelectorAll<HTMLElement>(".runtimeshow, #runtimeshow")
      .forEach((element) => (element.textContent = runtime));
  },
  async toTalk(txt: string) {
    const text = txt.trim();
    if (!text) return;
    const root = document.getElementById("post-comment");
    const signal = lifecycle.signal;
    if (!root) return;
    // Scrolling also lets lazy comment providers start loading their editor.
    Solitude.scrollToDest(Solitude.getEleTop(root), 300);
    const editor = await waitForCommentEditor(root, signal);
    if (signal.aborted || !root.isConnected) return;
    if (!editor) {
      Solitude.snackbarShow(Solitude.config.lang.comments.error, false, 3000);
      return;
    }
    const separator = !editor.value || editor.value.endsWith("\n\n")
      ? ""
      : editor.value.endsWith("\n") ? "\n" : "\n\n";
    const quote = "> " + text.replace(/\r\n?/g, "\n").replace(/\n/g, "\n> ") + "\n\n";
    editor.value += separator + quote;
    // Notify the provider after assigning the value so its preview/state agrees.
    editor.dispatchEvent(new Event("input", { bubbles: true }));
    editor.focus({ preventScroll: true });
    editor.setSelectionRange(editor.value.length, editor.value.length);
    Solitude.snackbarShow(Solitude.config.lang.totalk, false, 2000);
  },
  initNotesTicker() {
    const notesTalkElement = document.querySelector<HTMLElement>("#notes-talk");
    if (notesTalkElement) {
      new window.Swiper!(".swiper-container", {
        direction: "vertical",
        loop: true,
        autoplay: {
          delay: 3000,
          pauseOnMouseEnter: true,
        },
      });
    }
  },
  addPhotoFigcaption() {
    document
      .querySelectorAll<HTMLImageElement>(
        ".article-container img:not(.gallery-item img, .inline-img)",
      )
      .forEach((image: HTMLImageElement) => {
        const captionText = image.getAttribute("alt");
        const figure = image.closest("figure");
        const hasFigureCaption = figure?.querySelector("figcaption");
        const hasGeneratedCaption =
          image.getAttribute("data-solitude-caption-ready") === "true" ||
          image.nextElementSibling?.matches(".img-alt");
        if (!captionText || hasFigureCaption || hasGeneratedCaption) return;
        image.setAttribute("data-solitude-caption-ready", "true");
        image.insertAdjacentHTML(
          "afterend",
          `<div class="img-alt is-center">${Solitude.escapeHtml(captionText)}</div>`,
        );
      });
  },
  scrollToComment: () =>
    Solitude.scrollToDest(
      Solitude.getEleTop(document.getElementById("post-comment")),
      300,
    ),
  owoBig(owoSelector: { item: string; body: string }) {
    let owoBig = document.getElementById("owo-big");
    if (!owoBig) {
      owoBig = document.createElement("div");
      owoBig.id = "owo-big";
      document.body.appendChild(owoBig);
    }
    const showOwoBig = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const owoItem = target.closest(owoSelector.item);
      if (owoItem && target.closest(owoSelector.body)) {
        const imgSrc = owoItem.querySelector("img")?.src;
        if (imgSrc) {
          owoBig.innerHTML = `<img src="${imgSrc}" style="max-width: 100%; height: auto;">`;
          owoBig.style.display = "block";
          positionOwoBig(owoItem);
        }
      }
    };
    const hideOwoBig = (event: MouseEvent) => {
      if (
        (event.target instanceof Element ? event.target : null)?.closest(
          owoSelector.item,
        ) &&
        (event.target instanceof Element ? event.target : null)?.closest(
          owoSelector.body,
        )
      ) {
        owoBig.style.display = "none";
      }
    };
    const positionOwoBig = (owoItem: Element) => {
      const itemRect = owoItem.getBoundingClientRect();
      owoBig.style.left = `${itemRect.left - owoBig.offsetWidth / 4}px`;
      owoBig.style.top = `${itemRect.top}px`;
    };
    lifecycle.listen(document, "mouseover", showOwoBig);
    lifecycle.listen(document, "mouseout", hideOwoBig);
  },
  changeTimeFormat(selector: NodeListOf<HTMLElement>) {
    selector.forEach((item) => {
      const timeVal = item.getAttribute("datetime");
      item.textContent = String(Solitude.diffDate(timeVal || "", true));
      item.style.display = "inline";
    });
  },
  homeTypeit() {
    if (typeof window.home_subtitle === "undefined") return;
    const ty = new window.TypeIt!(".banners-title-small", {
      speed: 200,
      waitUntilVisible: true,
      loop: true,
      lifeLike: true,
    });
    window.home_subtitle.forEach((item) => {
      ty.type(item).pause(500).delete(item);
    });
    ty.go();
    lifecycle.add(() => ty.destroy?.());
  },
};

export class tabs {
  static init() {
    this.clickFnOfTabs();
  }
  static clickFnOfTabs() {
    document
      .querySelectorAll<HTMLElement>(".article-container .tab > button")
      .forEach((item) => {
        item.addEventListener("click", function () {
          const $tabItem = this.parentElement;
          if (!$tabItem) return;
          if (!$tabItem.classList.contains("active")) {
            const $tabContent = $tabItem.parentElement?.nextElementSibling;
            if (!$tabContent) return;
            const $siblings = Solitude.siblings($tabItem, ".active")[0];
            $siblings && $siblings.classList.remove("active");
            $tabItem.classList.add("active");
            const tabId = (this.getAttribute("data-href") || "").replace(
              "#",
              "",
            );
            [...$tabContent.children].forEach((item) => {
              item.classList.toggle("active", item.id === tabId);
            });
          }
        });
      });
  }
  static expireAddListener() {
    const { expire } = Solitude.config;
    if (!expire) return;
    const list = document.querySelectorAll<HTMLElement>(".post-meta-date time");
    const post_date = list.length
      ? list[list.length - 1]
      : document.querySelector<HTMLElement>(".datetime");
    if (!post_date) return;
    const ex = Math.ceil(
      (new Date().getTime() -
        new Date(post_date.getAttribute("datetime") || "").getTime()) /
        1000 /
        60 /
        60 /
        24,
    );
    if (expire.time > ex) return;
    const ele = document.createElement("div");
    ele.className = "expire";
    ele.innerHTML = `<i class="solitude fas fa-circle-exclamation"></i>${expire.text_prev}${-(expire.time - ex)}${expire.text_next}`;
    const articleContainer =
      document.querySelector<HTMLElement>(".article-container");
    articleContainer?.insertAdjacentElement(
      expire.position === "top" ? "afterbegin" : "beforeend",
      ele,
    );
  }
}
