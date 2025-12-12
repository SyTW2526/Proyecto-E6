import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ConfigMenu from './ConfigMenu';

describe('ConfigMenu (Three.js Configuration Menu)', () => {
  const mockUpdateLocation = vi.fn();
  const mockUpdateSelectedDate = vi.fn();
  const mockUpdateActualDate = vi.fn();

  const defaultProps = {
    actualDate: new Date('2023-10-27T12:00:00Z'),
    latitudeState: 40.4168,
    longitudeState: -3.7038,
    updateLocation: mockUpdateLocation,
    updateSelectedDate: mockUpdateSelectedDate,
    updateActualDate: mockUpdateActualDate,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the configuration button', () => {
    render(<ConfigMenu {...defaultProps} />);
    const configButton = screen.getByTitle('Configuration');
    expect(configButton).toBeInTheDocument();
  });

  it('opens the configuration menu when button is clicked', () => {
    render(<ConfigMenu {...defaultProps} />);
    const configButton = screen.getByTitle('Configuration');
    
    fireEvent.click(configButton);
    
    expect(screen.getByText('Configuration')).toBeInTheDocument();
    expect(screen.getByLabelText('Date')).toBeInTheDocument();
    expect(screen.getByLabelText('Time')).toBeInTheDocument();
    expect(screen.getByLabelText('Latitude')).toBeInTheDocument();
    expect(screen.getByLabelText('Longitude')).toBeInTheDocument();
  });

  it('updates context when "Save" is clicked', async () => {
    render(<ConfigMenu {...defaultProps} />);
    const configButton = screen.getByTitle('Configuration');
    fireEvent.click(configButton);
    
    // Wait for the menu to open and populate fields
    const latInput = await screen.findByLabelText('Latitude');
    const lngInput = await screen.findByLabelText('Longitude');
    
    fireEvent.change(latInput, { target: { value: '50.0' } });
    fireEvent.change(lngInput, { target: { value: '10.0' } });
    
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);
    
    expect(mockUpdateLocation).toHaveBeenCalledWith({ lat: 50.0, lng: 10.0 });
    expect(mockUpdateSelectedDate).toHaveBeenCalled();
    expect(mockUpdateActualDate).toHaveBeenCalled();
  });

  it('closes the menu when "Cancel" is clicked', async () => {
    render(<ConfigMenu {...defaultProps} />);
    const configButton = screen.getByTitle('Configuration');
    fireEvent.click(configButton);
    
    // Wait for menu to open
    await screen.findByText('Configuration');
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(screen.queryByText('Configuration')).not.toBeInTheDocument();
  });

  it('populates form fields with current values when opened', async () => {
    render(<ConfigMenu {...defaultProps} />);
    const configButton = screen.getByTitle('Configuration');
    fireEvent.click(configButton);
    
    // Wait for fields to be populated
    const latInput = await screen.findByLabelText('Latitude');
    const lngInput = await screen.findByLabelText('Longitude');
    
    expect(latInput).toHaveValue(40.4168);
    expect(lngInput).toHaveValue(-3.7038);
  });
});
