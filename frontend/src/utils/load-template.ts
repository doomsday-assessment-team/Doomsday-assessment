export async function loadTemplate(templatePath: string): Promise<Node> {
  try {
    const url = new URL(templatePath, window.location.href);

    if (url.origin !== window.location.origin) {
      console.error(`Blocked cross-origin template load from: ${url.origin}`);
      return createErrorNode(`Blocked cross-origin template load from: ${url.origin}`);
    } else {
      const response = await fetch(url.toString());

      if (!response.ok) {
        console.error(`Failed to fetch template: ${response.status} ${response.statusText}`);
        return createErrorNode(`Failed to fetch template: ${response.status} ${response.statusText}`);
      } else {
        const htmlText = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, 'text/html');
        const template = doc.querySelector('template');

        if (template && template.content) {
          return template.content.cloneNode(true);
        } else {
          console.error('Template not found in loaded HTML');
          return createErrorNode('Template not found in loaded HTML');
        }
      }
    }
  } catch (error) {
    console.error('Error loading template:', error);
    return createErrorNode('Error loading template');
  }
}

function createErrorNode(message: string): Node {
  const section = document.createElement('section');
  section.style.color = 'red';
  section.style.fontWeight = 'bold';
  section.textContent = `Error: ${message}`;
  return section;
}
