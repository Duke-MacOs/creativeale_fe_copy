import React from 'react';

export const reactText = (element: React.ReactNode): string => {
  if (React.isValidElement(element)) {
    return reactText(element.props.children);
  }
  if (Array.isArray(element)) {
    return element.map(reactText).join('');
  }
  switch (typeof element) {
    case 'number':
      return String(element);
    case 'string':
      return element;
    default:
      return '';
  }
};
