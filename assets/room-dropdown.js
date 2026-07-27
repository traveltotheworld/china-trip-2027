(() => {
  "use strict";

  const CONTENT_ID = "content";

  function normalise(value) {
    return String(value || "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  function isRoomHeading(element) {
    if (!(element instanceof HTMLElement)) return false;
    const text = normalise(element.textContent);
    return text === "pembagian kamar" || text.includes("pembagian kamar");
  }

  function findRoomBody(heading) {
    // Struktur paling umum: heading lalu grid/list kamar sebagai sibling berikutnya.
    let node = heading.nextElementSibling;
    while (node) {
      const text = normalise(node.textContent);
      if (
        node.matches?.(".room-grid, .rooms-grid, .room-list, .rooms-list, [class*='room-grid'], [class*='rooms-grid']") ||
        /kamar\s*1/.test(text)
      ) {
        return node;
      }
      if (/pembagian kamar/.test(text)) break;
      node = node.nextElementSibling;
    }

    // Fallback: heading berada di dalam wrapper header, grid berada sesudah wrapper.
    const parent = heading.parentElement;
    if (parent) {
      node = parent.nextElementSibling;
      while (node) {
        const text = normalise(node.textContent);
        if (/kamar\s*1/.test(text)) return node;
        node = node.nextElementSibling;
      }
    }

    return null;
  }

  function convertToDropdown(heading) {
    if (heading.dataset.roomDropdownReady === "true") return;

    const body = findRoomBody(heading);
    if (!body || body.closest(".room-dropdown")) return;

    const headingContainer =
      heading.parentElement &&
      heading.parentElement.children.length <= 3 &&
      !heading.parentElement.matches("article, section")
        ? heading.parentElement
        : heading;

    const dropdown = document.createElement("section");
    dropdown.className = "room-dropdown";
    dropdown.dataset.roomDropdown = "true";

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "room-dropdown__toggle";
    toggle.setAttribute("aria-expanded", "false");

    const title = document.createElement("span");
    title.className = "room-dropdown__title";
    title.innerHTML =
      '<span class="room-dropdown__icon" aria-hidden="true">🛏️</span>' +
      "<span>Pembagian Kamar</span>";

    const chevron = document.createElement("span");
    chevron.className = "room-dropdown__chevron";
    chevron.setAttribute("aria-hidden", "true");
    chevron.textContent = "⌄";

    const content = document.createElement("div");
    content.className = "room-dropdown__content";

    toggle.append(title, chevron);
    dropdown.append(toggle, content);

    const insertionPoint = headingContainer;
    insertionPoint.parentNode.insertBefore(dropdown, insertionPoint);
    content.appendChild(body);
    headingContainer.remove();

    const setOpen = (open) => {
      dropdown.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
    };

    toggle.addEventListener("click", () => {
      setOpen(!dropdown.classList.contains("is-open"));
    });

    heading.dataset.roomDropdownReady = "true";
    setOpen(false);
  }

  function applyDropdowns() {
    const host = document.getElementById(CONTENT_ID);
    if (!host) return;

    [...host.querySelectorAll("h1,h2,h3,h4,h5,h6,div,p,span")]
      .filter(isRoomHeading)
      .forEach(convertToDropdown);
  }

  function initialise() {
    applyDropdowns();

    const host = document.getElementById(CONTENT_ID);
    if (!host) return;

    const observer = new MutationObserver(() => applyDropdowns());
    observer.observe(host, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialise);
  } else {
    initialise();
  }
})();
