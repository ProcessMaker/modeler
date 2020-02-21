let timeoutID;

function waitToTriggerOpenAnimation() {
  return new Promise(resolve => {
    timeoutID = setTimeout(resolve);
  });
}

async function focusNameInput(cellView) {
  if (cellView.model !== this.shape) {
    return;
  }

  const nameInput = document.querySelector('[name="name"]') || document.querySelector('[name="text"]');

  if (!nameInput || document.activeElement === nameInput) {
    return;
  }

  const configurationAccordion = document.getElementById('accordion-button-Configuration');
  if (configurationAccordion.getAttribute('aria-expanded') === 'false') {
    clearTimeout(timeoutID);
    configurationAccordion.click();
    await waitToTriggerOpenAnimation();
  }

  const labelElement = this.shapeView.selectors.label ||
    Array.from(this.shapeView.selectors.root.children).find(el => el.classList.contains('labels'));
  labelElement.style.outline = '1px dashed blue';
  nameInput.addEventListener('blur', () => {
    labelElement.style.outline = '';
  });

  nameInput.focus();
}

export default {
  props: {
    paperManager: Object,
  },
  created() {
    this.paperManager.addEventHandler('cell:pointerdblclick', focusNameInput, this);
  },
  destroyed() {
    clearTimeout(timeoutID);
    this.paperManager.removeEventHandler('cell:pointerdblclick', focusNameInput, this);
  },
};
