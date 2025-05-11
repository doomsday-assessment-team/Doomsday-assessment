export async function loadTemplate(templatePath: string): Promise<Node | undefined> {
    try {
        const response = await fetch(templatePath);
        if (!response.ok) {
            throw new Error(`Failed to fetch template: ${response.status} ${response.statusText}`);
        }

        const htmlText = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, 'text/html');
        const template = doc.querySelector('template');
        if (template && template.content) {
            return template.content.cloneNode(true);
        } else {
            console.error('Template not found in loaded HTML');
            return undefined;
        }
    } catch (error) {
        console.error('Error loading template:', error);
    }
}
