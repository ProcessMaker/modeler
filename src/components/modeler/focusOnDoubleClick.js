let timeoutID;

function waitToTriggerOpenAnimation() {
  return new Promise(resolve => {
    timeoutID = setTimeout(resolve);
  });
}

export default async function focusNameInput(cellView) {
  if (!cellView.selectors) {
    return;
  }

  const labelElement = cellView.selectors.label ||
    Array.from(cellView.selectors.root.children).find(el => el.classList.contains('labels'));
  
  if (!labelElement) {
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

  if (labelElement) {
    labelElement.style.outline = '1px dashed blue';
    nameInput.addEventListener('blur', () => {
      labelElement.style.outline = '';
    });
  }

  nameInput.focus();
}
