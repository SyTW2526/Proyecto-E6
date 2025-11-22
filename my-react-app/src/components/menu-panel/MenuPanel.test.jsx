import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MenuPanel from './MenuPanel';
import { useAppContext } from '../../AppContext';
import { useNavigate } from 'react-router-dom';

// Mock dependencies
vi.mock('../../AppContext', () => ({
  useAppContext: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
}));

describe('MenuPanel', () => {
  const mockLogoutUser = vi.fn();
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useAppContext.mockReturnValue({
      logoutUser: mockLogoutUser,
    });
    useNavigate.mockReturnValue(mockNavigate);
  });

  it('renders the app bar with title', () => {
    render(<MenuPanel />);
    expect(screen.getByText(/Artemis Visualizer/i)).toBeInTheDocument();
  });

  it('opens the user menu when account icon is clicked', () => {
    render(<MenuPanel />);
    // The account icon is usually an IconButton with AccountCircleIcon.
    // We can find it by looking for the button that contains the icon or by aria-label if present.
    // Looking at the code: <IconButton onClick={handleUserMenuClick} sx={{ color: "#fff" }}><AccountCircleIcon /></IconButton>
    // It doesn't have an aria-label, so we might need to find it by role button and maybe index or testid if we added one.
    // However, there are multiple buttons.
    // Let's try to find the AccountCircleIcon SVG if possible, or add a data-testid.
    // But I cannot modify the code unless necessary.
    // Let's assume there is only one account circle icon button or it's the last one.
    // Actually, the code has:
    // {navItems.map...} -> Buttons
    // <IconButton ...><AccountCircleIcon /></IconButton>
    
    // We can find the icon by its testid (MUI icons usually have data-testid="AccountCircleIcon")
    const accountIcon = screen.getByTestId('AccountCircleIcon');
    const accountButton = accountIcon.closest('button');
    
    fireEvent.click(accountButton);
    
    // Check if menu items appear
    expect(screen.getByText('Edit profile')).toBeInTheDocument();
    expect(screen.getByText('Log Out')).toBeInTheDocument();
  });

  it('navigates to edit-user when "Edit profile" is clicked', () => {
    render(<MenuPanel />);
    const accountIcon = screen.getByTestId('AccountCircleIcon');
    fireEvent.click(accountIcon.closest('button'));
    
    const editProfileItem = screen.getByText('Edit profile');
    fireEvent.click(editProfileItem);
    
    expect(mockNavigate).toHaveBeenCalledWith('/edit-user');
  });

  it('calls logoutUser and navigates to login when "Log Out" is clicked', () => {
    render(<MenuPanel />);
    const accountIcon = screen.getByTestId('AccountCircleIcon');
    fireEvent.click(accountIcon.closest('button'));
    
    const logoutItem = screen.getByText('Log Out');
    fireEvent.click(logoutItem);
    
    expect(mockLogoutUser).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('opens GitHub link when GitHub button is clicked', () => {
    // Mock window.open
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => {});
    
    render(<MenuPanel />);
    // The GitHub button is rendered from navItems map.
    // const navItems = [{ text: "GitHub", icon: <GitHubIcon /> }];
    // It renders as a Button with the icon inside.
    // We can find it by the GitHubIcon testid.
    const githubIcons = screen.getAllByTestId('GitHubIcon');
    const githubButton = githubIcons[0].closest('button');
    
    fireEvent.click(githubButton);
    
    expect(openSpy).toHaveBeenCalledWith('https://github.com/SyTW2526/Proyecto-E6.git');
    
    openSpy.mockRestore();
  });
});
