import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';

afterEach(() => vi.unstubAllGlobals());

function keydown(target: EventTarget, init: KeyboardEventInit): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init });
  target.dispatchEvent(event);
  return event;
}

describe('useKeyboardShortcuts', () => {
  it('jumps steps on digit keys and ignores typing targets', () => {
    const onStepJump = vi.fn();
    renderHook(() => useKeyboardShortcuts({ onStepJump }));
    keydown(document.body, { key: '3' });
    expect(onStepJump).toHaveBeenCalledWith(3);

    const input = document.createElement('input');
    document.body.appendChild(input);
    keydown(input, { key: '2' });
    const select = document.createElement('select');
    document.body.appendChild(select);
    keydown(select, { key: '2' });
    expect(onStepJump).toHaveBeenCalledTimes(1);
    input.remove();
    select.remove();
  });

  it('runs the modifier shortcuts', () => {
    vi.stubGlobal('navigator', { platform: 'Win32' });
    const onOpenFilePicker = vi.fn();
    const onDownloadZip = vi.fn();
    renderHook(() => useKeyboardShortcuts({ onOpenFilePicker, onDownloadZip }));
    expect(keydown(document.body, { key: 'o', ctrlKey: true }).defaultPrevented).toBe(true);
    keydown(document.body, { key: 's', ctrlKey: true });
    expect(onOpenFilePicker).toHaveBeenCalledOnce();
    expect(onDownloadZip).toHaveBeenCalledOnce();
  });

  it('does not swallow Space on a focused button or when no handler exists', () => {
    const button = document.createElement('button');
    document.body.appendChild(button);

    renderHook(() => useKeyboardShortcuts({}));
    expect(keydown(button, { code: 'Space', key: ' ' }).defaultPrevented).toBe(false);
    expect(keydown(document.body, { key: 'Escape' }).defaultPrevented).toBe(false);

    const onToggleCompare = vi.fn();
    renderHook(() => useKeyboardShortcuts({ onToggleCompare }));
    expect(keydown(button, { code: 'Space', key: ' ' }).defaultPrevented).toBe(false);
    expect(onToggleCompare).not.toHaveBeenCalled();
    expect(keydown(document.body, { code: 'Space', key: ' ' }).defaultPrevented).toBe(true);
    expect(onToggleCompare).toHaveBeenCalledOnce();
    button.remove();
  });
});
