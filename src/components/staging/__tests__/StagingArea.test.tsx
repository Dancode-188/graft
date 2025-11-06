import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { vi } from 'vitest';
import { StagingArea } from '../StagingArea';
import * as tauriCore from '@tauri-apps/api/core';

// Mock global confirm and clipboard if used
const originalConfirm = global.confirm;
const originalClipboard = global.navigator.clipboard;

beforeAll(() => {
  global.confirm = vi.fn(() => true) as any;
  // @ts-ignore - provide a minimal clipboard mock
  global.navigator.clipboard = {
    writeText: vi.fn(),
  } as any;
});

afterAll(() => {
  global.confirm = originalConfirm;
  // @ts-ignore
  global.navigator.clipboard = originalClipboard;
});

describe('StagingArea component', () => {
  let invokeMock: any;
  // Maintain an in-test status state that invoke will read/modify
  let statusState: any;

  beforeEach(() => {
    statusState = {
      unstaged: [
        { path: 'src/file1.txt', status: 'modified', is_staged: false },
        { path: 'src/new-file.ts', status: 'added', is_staged: false },
      ],
      staged: [
        { path: 'src/old-file.js', status: 'deleted', is_staged: true },
      ],
    };

    invokeMock = vi.spyOn(tauriCore, 'invoke').mockImplementation(async (cmd: string, args: any) => {
      if (cmd === 'get_working_directory_status') {
        // Return a deep copy to avoid test mutation issues
        return JSON.parse(JSON.stringify(statusState));
      }

      if (cmd === 'stage_files') {
        const filePaths: string[] = args.filePaths || args.filePath || [];
        // move matching files from unstaged to staged
        filePaths.forEach((p) => {
          const idx = statusState.unstaged.findIndex((f: any) => f.path === p);
          if (idx !== -1) {
            const f = { ...statusState.unstaged[idx], is_staged: true };
            statusState.unstaged.splice(idx, 1);
            statusState.staged.push(f);
          }
        });
        return;
      }

      if (cmd === 'unstage_files') {
        const filePaths: string[] = args.filePaths || args.filePath || [];
        filePaths.forEach((p) => {
          const idx = statusState.staged.findIndex((f: any) => f.path === p);
          if (idx !== -1) {
            const f = { ...statusState.staged[idx], is_staged: false };
            statusState.staged.splice(idx, 1);
            statusState.unstaged.push(f);
          }
        });
        return;
      }

      if (cmd === 'create_commit') {
        // clear staged
        statusState.staged = [];
        return;
      }

      // default
      return;
    });
  });

  afterEach(() => {
    invokeMock?.mockRestore();
    vi.clearAllMocks();
  });

  test('renders unstaged and staged lists with counts and file items', async () => {
    render(<StagingArea repoPath="/tmp/repo" onCommitCreated={() => {}} />);

    // Header counts
    expect(await screen.findByText(/Unstaged Changes \(2\)/)).toBeTruthy();
    expect(await screen.findByText(/Staged Changes \(1\)/)).toBeTruthy();

    // Files present
    expect(screen.getByText('src/file1.txt')).toBeTruthy();
    expect(screen.getByText('src/new-file.ts')).toBeTruthy();
    expect(screen.getByText('src/old-file.js')).toBeTruthy();

    // Status badge icons: modified -> 'M', added -> 'A', deleted -> 'D'
    const file1Btn = screen.getByText('src/file1.txt').closest('button')!;
    const file1Badge = within(file1Btn).getByText('M');
    expect(file1Badge).toBeTruthy();

    const newFileBtn = screen.getByText('src/new-file.ts').closest('button')!;
    expect(within(newFileBtn).getByText('A')).toBeTruthy();

    const oldFileBtn = screen.getByText('src/old-file.js').closest('button')!;
    expect(within(oldFileBtn).getByText('D')).toBeTruthy();
  });

  test('stages a file when clicking an unstaged file and updates lists', async () => {
    render(<StagingArea repoPath="/tmp/repo" onCommitCreated={() => {}} />);

    const file1Btn = await screen.findByText('src/file1.txt');
    // click to stage
    fireEvent.click(file1Btn);

    // After click, staged count should update to 2 and unstaged to 1
    expect(await screen.findByText(/Unstaged Changes \(1\)/)).toBeTruthy();
    expect(await screen.findByText(/Staged Changes \(2\)/)).toBeTruthy();

    // file1 should now appear under staged section (still present by text)
    expect(screen.getByText('src/file1.txt')).toBeTruthy();
  });

  test('unstages a staged file when clicking a staged file and updates lists', async () => {
    render(<StagingArea repoPath="/tmp/repo" onCommitCreated={() => {}} />);

    const stagedFileBtn = await screen.findByText('src/old-file.js');
    // click to unstage
    fireEvent.click(stagedFileBtn);

    expect(await screen.findByText(/Staged Changes \(0\)/)).toBeTruthy();
    expect(await screen.findByText(/Unstaged Changes \(3\)/)).toBeTruthy();
  });

  test('space key toggles stage/unstage when focused', async () => {
    render(<StagingArea repoPath="/tmp/repo" onCommitCreated={() => {}} />);

    const file1Btn = (await screen.findByText('src/file1.txt')).closest('button')!;
    file1Btn.focus();
    // press Space
    fireEvent.keyDown(file1Btn, { key: ' ' });

    // Should stage
    expect(await screen.findByText(/Staged Changes \(2\)/)).toBeTruthy();

    // Now find a staged file and press Space to unstage
    const stagedFileBtn = (await screen.findByText('src/old-file.js')).closest('button')!;
    stagedFileBtn.focus();
    fireEvent.keyDown(stagedFileBtn, { key: ' ' });

    expect(await screen.findByText(/Staged Changes \(1\)/)).toBeTruthy();
  });

  test('renders empty state messages when no files present', async () => {
    // set empty status
    statusState = { unstaged: [], staged: [] };
    render(<StagingArea repoPath="/tmp/repo" onCommitCreated={() => {}} />);

    expect(await screen.findByText('No unstaged changes')).toBeTruthy();
    expect(await screen.findByText('No staged changes')).toBeTruthy();
  });
});
