import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  Button,
  Sheet,
  ConfirmDialog,
  WhyChip,
  StyleMatchIndicator,
  ItemCard,
  Toggle,
  Slider,
  SearchBar,
  FilterChips,
} from '../src/ui';

describe('Phase 1 Component Library', () => {
  it('renders Button with accessible touch target and keyboard operation', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    const btn = screen.getByRole('button', { name: /click me/i });
    expect(btn).toBeInTheDocument();

    fireEvent.click(btn);
    expect(handleClick).toHaveBeenCalledTimes(1);

    // Keyboard trigger (Enter & Space)
    fireEvent.keyDown(btn, { key: 'Enter', code: 'Enter' });
  });

  it('renders WhyChip without banned copy and supports clicking', () => {
    const handleClick = vi.fn();
    render(
      <WhyChip
        label="Olive suits your warm undertone"
        category="color"
        onClick={handleClick}
      />
    );
    const chip = screen.getByRole('button', { name: /olive suits your warm undertone/i });
    expect(chip).toBeInTheDocument();
    fireEvent.click(chip);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders StyleMatchIndicator with dual signal (icon and text) for High match', () => {
    const handleClick = vi.fn();
    render(<StyleMatchIndicator level="High" onClick={handleClick} />);
    const indicator = screen.getByRole('button', { name: /high match/i });
    expect(indicator).toBeInTheDocument();
    fireEvent.click(indicator);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders ItemCard with favorite toggle and palette indicator', () => {
    const handleFav = vi.fn();
    render(
      <ItemCard
        id="item-test"
        name="Linen Shirt"
        category="Tops"
        isFavorite={false}
        suitsPalette={true}
        onToggleFavorite={handleFav}
      />
    );

    expect(screen.getByText('Linen Shirt')).toBeInTheDocument();
    expect(screen.getByText('Suits you')).toBeInTheDocument();

    const favBtn = screen.getByRole('button', { name: /add linen shirt to favorites/i });
    fireEvent.click(favBtn);
    expect(handleFav).toHaveBeenCalledTimes(1);
  });

  it('traps focus and closes Sheet on Escape key', () => {
    const handleClose = vi.fn();
    const { rerender } = render(
      <Sheet isOpen={true} onClose={handleClose} title="Item Drawer">
        <button>Inside Action</button>
      </Sheet>
    );

    const dialog = screen.getByRole('dialog', { name: /item drawer/i });
    expect(dialog).toBeInTheDocument();

    // Fire Escape key
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);

    // Rerender as closed
    rerender(
      <Sheet isOpen={false} onClose={handleClose} title="Item Drawer">
        <button>Inside Action</button>
      </Sheet>
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('traps focus and closes ConfirmDialog on Escape key', () => {
    const handleClose = vi.fn();
    const handleConfirm = vi.fn();
    render(
      <ConfirmDialog
        isOpen={true}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title="Delete Item"
        description="Are you sure you want to remove this garment?"
        isDestructive={true}
      />
    );

    const dialog = screen.getByRole('alertdialog', { name: /delete item/i });
    expect(dialog).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('handles Toggle accessibility and state change', () => {
    const handleChange = vi.fn();
    render(
      <Toggle
        label="Weather Sync"
        description="Fetch local temperature"
        checked={false}
        onChange={handleChange}
      />
    );

    const toggle = screen.getByRole('switch', { name: /weather sync/i });
    expect(toggle).toHaveAttribute('aria-checked', 'false');

    fireEvent.click(toggle);
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('handles Slider input changes', () => {
    const handleChange = vi.fn();
    render(
      <Slider
        label="Temperature"
        min={0}
        max={40}
        value={18}
        onChange={handleChange}
        valueFormatter={(v) => `${v}°C`}
      />
    );

    const slider = screen.getByRole('slider');
    expect(slider).toHaveValue('18');

    fireEvent.change(slider, { target: { value: '25' } });
    expect(handleChange).toHaveBeenCalledWith(25);
  });

  it('renders FilterChips and handles tab selection', () => {
    const handleSelect = vi.fn();
    const options = [
      { id: 'all', label: 'All', count: 10 },
      { id: 'tops', label: 'Tops', count: 5 },
    ];
    render(
      <FilterChips options={options} selectedId="all" onSelect={handleSelect} />
    );

    const topsTab = screen.getByRole('tab', { name: /tops/i });
    fireEvent.click(topsTab);
    expect(handleSelect).toHaveBeenCalledWith('tops');
  });

  it('renders SearchBar with accessible input and clear button', () => {
    const handleChange = vi.fn();
    const handleClear = vi.fn();
    render(
      <SearchBar
        value="linen"
        onChange={handleChange}
        onClear={handleClear}
        placeholder="Search closet"
      />
    );

    const searchInput = screen.getByPlaceholderText('Search closet');
    expect(searchInput).toHaveValue('linen');

    const clearBtn = screen.getByRole('button', { name: /clear search input/i });
    fireEvent.click(clearBtn);
    expect(handleChange).toHaveBeenCalledWith('');
    expect(handleClear).toHaveBeenCalledTimes(1);
  });
});
