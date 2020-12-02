let timeoutID;

export default async function focusNameInputAndHighlightLabel(cellView) {
  const labelElement = getLabelElementForShape(cellView);
  const nameInput = document.querySelector('[name="name"]') || document.querySelector('[name="text"]');

  if (!labelElement || !nameInput || document.activeElement === nameInput) {
    return;
  }

  const configurationAccordion = document.getElementById('accordion-button-Configuration');
  if (configurationAccordion && configurationAccordion.getAttribute('aria-expanded') === 'false') {
    clearTimeout(timeoutID);
    configurationAccordion.click();
    await waitToTriggerOpenAnimation();
  }

  labelElement.style.outline = '1px dashed blue';
  nameInput.addEventListener('blur', () => {
    labelElement.style.outline = '';
  });

  nameInput.focus();
  nameInput.select();
}

function getLabelElementForShape(shape) {
  if (!shape.selectors) {
    return;
  }

  return shape.selectors.label ||
    Array.from(shape.selectors.root.children).find(el => el.classList.contains('labels'));
}

function waitToTriggerOpenAnimation() {
  return new Promise(resolve => {
    timeoutID = setTimeout(resolve);
  });
}
