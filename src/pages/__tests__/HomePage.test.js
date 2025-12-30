import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import HomePage from '../HomePage.svelte';

describe('HomePage', () => {
  it('renders the welcome banner', () => {
    render(HomePage);
    expect(screen.getByText('Welcome to Web3 & AI Jobs!')).toBeTruthy();
  });

  it('calls toggleQR when banner is clicked', async () => {
    const toggleQR = vi.fn();
    render(HomePage, { toggleQR });

    const banner = screen.getByLabelText('Show QR code');
    await fireEvent.click(banner);

    expect(toggleQR).toHaveBeenCalled();
  });

  it('shows QR modal when showQR prop is true', async () => {
    const closeQR = vi.fn();
    render(HomePage, { showQR: true, closeQR });

    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByText('Share this job finder')).toBeTruthy();

    // Test close button
    const closeBtn = screen.getByLabelText('Close');
    await fireEvent.click(closeBtn);
    expect(closeQR).toHaveBeenCalled();
  });
});
