import _autosize from 'autosize';

/**
 * Applies the textarea "autosize" plugin to a given node
 * @param node The element using this action
 * @returns Action methods
 */
export function autosize(node: HTMLTextAreaElement) {
  _autosize(node);
  return {
    update() {
      _autosize.update(node);
    },
    destroy() {
      _autosize.destroy(node);
    }
  };
}
