import type { CrewDetails } from "./guidance";

/** One nonmodal inspector: hover preview, click/tap pin, keyboard and light dismissal. */
export class CrewInspector {
  private pinned = false;
  private closeTimer: ReturnType<typeof setTimeout> | undefined;
  private signature = "";
  private title = "";
  private reposition = () => this.position();

  constructor(
    private button: HTMLButtonElement,
    private panel: HTMLElement,
  ) {
    button.addEventListener("click", () => {
      if (this.isOpen && this.pinned) this.close();
      else {
        this.pinned = true;
        this.open();
      }
    });
    button.addEventListener("pointerenter", (event) => {
      if (event.pointerType === "mouse") this.open();
    });
    for (const element of [button, panel]) {
      element.addEventListener("pointerenter", () => clearTimeout(this.closeTimer));
      element.addEventListener("pointerleave", () => {
        if (!this.pinned && !panel.contains(document.activeElement))
          this.closeTimer = setTimeout(() => this.close(), 180);
      });
    }
    panel.querySelector("button")!.addEventListener("click", () => this.close(true));
    panel.addEventListener("toggle", () => {
      button.setAttribute("aria-expanded", String(this.isOpen));
      if (!this.isOpen) this.pinned = false;
    });
    window.addEventListener("resize", this.reposition);
    window.addEventListener("scroll", this.reposition, true);
    window.visualViewport?.addEventListener("resize", this.reposition);
    window.visualViewport?.addEventListener("scroll", this.reposition);
  }

  get isOpen(): boolean {
    return this.panel.matches(":popover-open");
  }

  update(details: CrewDetails): void {
    const signature = JSON.stringify([details.title, details.stats]);
    if (signature === this.signature) return;
    this.signature = signature;
    if (this.title !== details.title) this.close();
    this.title = details.title;
    this.button.disabled = details.stats.length === 0;
    this.button.setAttribute("aria-label", `Show ${details.title} stats`);
    this.panel.querySelector("h3")!.textContent = details.title;
    const list = this.panel.querySelector("dl")!;
    list.replaceChildren(...details.stats.flatMap(([label, value]) => {
      const term = document.createElement("dt");
      const definition = document.createElement("dd");
      term.textContent = label;
      definition.textContent = value;
      return [term, definition];
    }));
    this.position();
  }

  close(restoreFocus = false): void {
    clearTimeout(this.closeTimer);
    if (this.isOpen) this.panel.hidePopover();
    this.pinned = false;
    if (restoreFocus) this.button.focus();
  }

  destroy(): void {
    this.close();
    window.removeEventListener("resize", this.reposition);
    window.removeEventListener("scroll", this.reposition, true);
    window.visualViewport?.removeEventListener("resize", this.reposition);
    window.visualViewport?.removeEventListener("scroll", this.reposition);
  }

  private open(): void {
    clearTimeout(this.closeTimer);
    if (this.button.disabled) return;
    if (!this.isOpen) this.panel.showPopover();
    this.position();
  }

  private position(): void {
    if (!this.isOpen) return;
    const anchor = this.button.getBoundingClientRect();
    const viewport = window.visualViewport;
    const left = viewport?.offsetLeft ?? 0;
    const top = viewport?.offsetTop ?? 0;
    const width = viewport?.width ?? window.innerWidth;
    const height = viewport?.height ?? window.innerHeight;
    const zoom = Number.parseFloat(getComputedStyle(document.documentElement).zoom) || 1;
    this.panel.style.maxWidth = `${(width - 16) / zoom}px`;
    this.panel.style.maxHeight = `${(height - 16) / zoom}px`;
    const box = this.panel.getBoundingClientRect();
    const x = Math.max(left + 8, Math.min(anchor.right - box.width, left + width - box.width - 8));
    const y = Math.max(top + 8, Math.min(anchor.top - box.height - 8, top + height - box.height - 8));
    this.panel.style.left = `${x / zoom}px`;
    this.panel.style.top = `${y / zoom}px`;
  }
}
