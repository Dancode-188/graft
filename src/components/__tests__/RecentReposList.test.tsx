import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RecentReposList } from '../RecentReposList';

describe('RecentReposList', () => {
  const repos = [
    { path: '/repo/one', name: 'one', lastOpened: 1700000000 },
    { path: '/repo/two', name: 'two', lastOpened: 1700001000 },
  ];

  it('renders recent repositories', () => {
    render(<RecentReposList repos={repos} onOpenRepo={() => {}} onRemoveRepo={() => {}} />);
    expect(screen.getByText('one')).toBeInTheDocument();
    expect(screen.getByText('two')).toBeInTheDocument();
  });

  it('calls onOpenRepo when a repo is clicked', () => {
    const onOpenRepo = jest.fn();
    render(<RecentReposList repos={repos} onOpenRepo={onOpenRepo} onRemoveRepo={() => {}} />);
    fireEvent.click(screen.getByText('one'));
    expect(onOpenRepo).toHaveBeenCalledWith('/repo/one');
  });

  it('calls onRemoveRepo when remove button is clicked', () => {
    const onRemoveRepo = jest.fn();
    render(<RecentReposList repos={repos} onOpenRepo={() => {}} onRemoveRepo={onRemoveRepo} />);
    const removeButtons = screen.getAllByLabelText(/remove/i);
    fireEvent.click(removeButtons[0]);
    expect(onRemoveRepo).toHaveBeenCalledWith('/repo/one');
  });
});
