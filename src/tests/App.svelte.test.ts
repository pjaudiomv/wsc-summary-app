import { describe, test, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/svelte';

import App from '@/App.svelte';

describe('App', () => {
  test('renders header', async () => {
    render(App);
    expect(screen.getByText('WSC Decisions Archive')).toBeInTheDocument();
  });
});
