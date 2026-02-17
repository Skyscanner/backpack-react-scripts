import React from 'react';
import { createRoot } from 'react-dom/client';
import SvgInCss from './SvgInCss';

describe('svg in css', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    createRoot(div).render(<SvgInCss />);
  });
});
