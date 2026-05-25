export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([key, value]) => {
    if (key === "class") node.className = value;
    else if (key === "text") node.textContent = value;
    else if (key.startsWith("on") && typeof value === "function") node.addEventListener(key.slice(2), value);
    else if (value !== undefined && value !== null) node.setAttribute(key, value);
  });
  children.forEach((child) => node.append(child));
  return node;
}

export function option(value, label, selectedValue) {
  const node = el("option", { value }, [document.createTextNode(label)]);
  if (value === selectedValue) node.selected = true;
  return node;
}

export function setIconRoot(root = document) {
  if (window.lucide) window.lucide.createIcons({ root });
}

export function icon(name, size = 17) {
  return `<i data-lucide="${name}" width="${size}" height="${size}" aria-hidden="true"></i>`;
}
