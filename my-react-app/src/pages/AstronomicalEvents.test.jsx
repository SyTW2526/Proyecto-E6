import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AstronomicalEvents from './AstronomicalEvents';
import * as AppContextModule from '../AppContext';
import * as SunCalcModule from '../three-app/suncalc.js';

// Mock de NextEclipseButton
vi.mock('../components/next-eclipse-button/NextEclipseButton', () => ({
  default: ({ lat, lng }) => (
    <button data-testid="next-eclipse-button">
      Next Eclipse (lat: {lat}, lng: {lng})
    </button>
  )
}));

// Mock de FullCalendar
vi.mock('@fullcalendar/react', () => ({
  default: ({ dateClick, events }) => (
    <div data-testid="full-calendar">
      <button 
        data-testid="calendar-date-2025-01-15"
        onClick={() => dateClick({ dateStr: '2025-01-15' })}
      >
        2025-01-15
      </button>
      <div data-testid="calendar-events">
        {events.map((event, idx) => (
          <span key={idx} data-testid={`event-${event.date}`}>
            {event.title}
          </span>
        ))}
      </div>
    </div>
  )
}));

// Mock de los plugins de FullCalendar
vi.mock('@fullcalendar/daygrid', () => ({
  default: {}
}));

vi.mock('@fullcalendar/interaction', () => ({
  default: {}
}));

// Mock de Material-UI components
vi.mock('@mui/material', () => ({
  Box: ({ children, ...props }) => <div {...props}>{children}</div>,
  Typography: ({ children, ...props }) => <div {...props}>{children}</div>,
  Paper: ({ children, ...props }) => <div {...props}>{children}</div>,
  Dialog: ({ open, children, onClose }) => 
    open ? <div data-testid="dialog" onClick={onClose}>{children}</div> : null,
  DialogTitle: ({ children }) => <div data-testid="dialog-title">{children}</div>,
  DialogContent: ({ children, ...props }) => <div data-testid="dialog-content" {...props}>{children}</div>,
  LinearProgress: ({ value }) => <div data-testid="linear-progress" data-value={value}></div>,
  Slide: ({ children }) => <div>{children}</div>
}));

describe('AstronomicalEvents Component', () => {
  let mockContextValue;
  let mockSunCalc;

  beforeEach(() => {
    // Mock del contexto
    mockContextValue = {
      latitudeState: 40.4168,
      longitudeState: -3.7038
    };
    
    vi.spyOn(AppContextModule, 'useAppContext').mockReturnValue(mockContextValue);

    // Mock de SunCalc
    mockSunCalc = {
      getMoonIllumination: vi.fn().mockReturnValue({
        phase: 0.5, // Full moon
        fraction: 0.99
      }),
      getMoonPosition: vi.fn().mockReturnValue({
        distance: 384400
      }),
      getMoonTimes: vi.fn().mockReturnValue({
        rise: new Date('2025-01-15T18:30:00'),
        set: new Date('2025-01-15T06:45:00')
      })
    };

    vi.spyOn(SunCalcModule, 'SunCalc', 'get').mockReturnValue(mockSunCalc);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderAstronomicalEvents = () => {
    return render(<AstronomicalEvents />);
  };

  it('should render the calendar title', () => {
    renderAstronomicalEvents();
    expect(screen.getByText('Astronomical Events Calendar')).toBeInTheDocument();
  });

  it('should render the descriptive text', () => {
    renderAstronomicalEvents();
    expect(screen.getByText(/Each day shows its moon phase/i)).toBeInTheDocument();
  });

  it('should render the FullCalendar component', () => {
    renderAstronomicalEvents();
    expect(screen.getByTestId('full-calendar')).toBeInTheDocument();
  });

  it('should render the NextEclipseButton with correct coordinates', () => {
    renderAstronomicalEvents();
    const button = screen.getByTestId('next-eclipse-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('lat: 40.4168');
    expect(button).toHaveTextContent('lng: -3.7038');
  });

  it('should generate events for the next 365 days', async () => {
    renderAstronomicalEvents();
    
    await waitFor(() => {
      const eventsContainer = screen.getByTestId('calendar-events');
      const events = eventsContainer.querySelectorAll('[data-testid^="event-"]');
      expect(events.length).toBeGreaterThan(0);
    });
  });

  it('should open the dialog when clicking on a date', () => {
    renderAstronomicalEvents();
    
    const dateButton = screen.getByTestId('calendar-date-2025-01-15');
    fireEvent.click(dateButton);
    
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
  });

  it('should show the dialog title with the selected date', () => {
    renderAstronomicalEvents();
    
    const dateButton = screen.getByTestId('calendar-date-2025-01-15');
    fireEvent.click(dateButton);
    
    expect(screen.getByTestId('dialog-title')).toHaveTextContent('Moon Phase for 2025-01-15');
  });

  it('should calculate and display moon data when selecting a date', () => {
    renderAstronomicalEvents();
    
    const dateButton = screen.getByTestId('calendar-date-2025-01-15');
    fireEvent.click(dateButton);
    
    expect(mockSunCalc.getMoonIllumination).toHaveBeenCalled();
    expect(mockSunCalc.getMoonPosition).toHaveBeenCalled();
    expect(mockSunCalc.getMoonTimes).toHaveBeenCalled();
  });

  it('should show the correct emoji for the moon phase', () => {
    mockSunCalc.getMoonIllumination.mockReturnValue({
      phase: 0.5, // Full moon
      fraction: 0.99
    });
    
    renderAstronomicalEvents();
    
    const dateButton = screen.getByTestId('calendar-date-2025-01-15');
    fireEvent.click(dateButton);
    
    const dialogContent = screen.getByTestId('dialog-content');
    expect(dialogContent).toHaveTextContent('🌕');
  });

  it('should show the correct name for the moon phase', () => {
    mockSunCalc.getMoonIllumination.mockReturnValue({
      phase: 0.5, // Full moon
      fraction: 0.99
    });
    
    renderAstronomicalEvents();
    
    const dateButton = screen.getByTestId('calendar-date-2025-01-15');
    fireEvent.click(dateButton);
    
    expect(screen.getByText('FULL MOON')).toBeInTheDocument();
  });

  it('should show the moonrise time', () => {
    renderAstronomicalEvents();
    
    const dateButton = screen.getByTestId('calendar-date-2025-01-15');
    fireEvent.click(dateButton);
    
    expect(screen.getByText(/Moonrise:/i)).toBeInTheDocument();
    expect(screen.getByText(/06:30 PM/i)).toBeInTheDocument();
  });

  it('should show the moonset time', () => {
    renderAstronomicalEvents();
    
    const dateButton = screen.getByTestId('calendar-date-2025-01-15');
    fireEvent.click(dateButton);
    
    expect(screen.getByText(/Moonset:/i)).toBeInTheDocument();
    expect(screen.getByText(/06:45 AM/i)).toBeInTheDocument();
  });

  it('should show the moon distance', () => {
    renderAstronomicalEvents();
    
    const dateButton = screen.getByTestId('calendar-date-2025-01-15');
    fireEvent.click(dateButton);
    
    expect(screen.getByText(/Distance:/i)).toBeInTheDocument();
    expect(screen.getByText(/384400 km/)).toBeInTheDocument();
  });

  it('should show the illumination percentage', () => {
    renderAstronomicalEvents();
    
    const dateButton = screen.getByTestId('calendar-date-2025-01-15');
    fireEvent.click(dateButton);
    
    expect(screen.getByText(/Illumination:/i)).toBeInTheDocument();
    expect(screen.getByText(/99.0%/)).toBeInTheDocument();
  });

  it('should show the illumination progress bar', () => {
    renderAstronomicalEvents();
    
    const dateButton = screen.getByTestId('calendar-date-2025-01-15');
    fireEvent.click(dateButton);
    
    const progressBar = screen.getByTestId('linear-progress');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar.getAttribute('data-value')).toBe('99');
  });

  it('should close the dialog when clicking outside', () => {
    renderAstronomicalEvents();
    
    const dateButton = screen.getByTestId('calendar-date-2025-01-15');
    fireEvent.click(dateButton);
    
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    
    const dialog = screen.getByTestId('dialog');
    fireEvent.click(dialog);
    
    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
  });

  it('should handle the case when there is no moonrise time', () => {
    mockSunCalc.getMoonTimes.mockReturnValue({
      rise: null,
      set: new Date('2025-01-15T06:45:00')
    });
    
    renderAstronomicalEvents();
    
    const dateButton = screen.getByTestId('calendar-date-2025-01-15');
    fireEvent.click(dateButton);
    
    expect(screen.getByText(/N\/A/)).toBeInTheDocument();
  });

  it('should use the correct coordinates from context', () => {
    renderAstronomicalEvents();
    
    const dateButton = screen.getByTestId('calendar-date-2025-01-15');
    fireEvent.click(dateButton);
    
    expect(mockSunCalc.getMoonPosition).toHaveBeenCalledWith(
      expect.any(Date),
      40.4168,
      -3.7038
    );
  });

  it('should use default Madrid coordinates when context values are null', () => {
    mockContextValue.latitudeState = null;
    mockContextValue.longitudeState = null;
    vi.spyOn(AppContextModule, 'useAppContext').mockReturnValue(mockContextValue);
    
    renderAstronomicalEvents();
    
    const dateButton = screen.getByTestId('calendar-date-2025-01-15');
    fireEvent.click(dateButton);
    
    expect(mockSunCalc.getMoonPosition).toHaveBeenCalledWith(
      expect.any(Date),
      40.4168,
      -3.7038
    );
  });

  it('should return the correct emoji for new moon', () => {
    mockSunCalc.getMoonIllumination.mockReturnValue({
      phase: 0.01,
      fraction: 0.0
    });
    
    renderAstronomicalEvents();
    
    const dateButton = screen.getByTestId('calendar-date-2025-01-15');
    fireEvent.click(dateButton);
    
    const dialogContent = screen.getByTestId('dialog-content');
    expect(dialogContent).toHaveTextContent('🌑');
  });

  it('should return the correct emoji for first quarter', () => {
    mockSunCalc.getMoonIllumination.mockReturnValue({
      phase: 0.25,
      fraction: 0.5
    });
    
    renderAstronomicalEvents();
    
    const dateButton = screen.getByTestId('calendar-date-2025-01-15');
    fireEvent.click(dateButton);
    
    const dialogContent = screen.getByTestId('dialog-content');
    expect(dialogContent).toHaveTextContent('🌓');
  });

  it('should return the correct name for new moon phase', () => {
    mockSunCalc.getMoonIllumination.mockReturnValue({
      phase: 0.01,
      fraction: 0.0
    });
    
    renderAstronomicalEvents();
    
    const dateButton = screen.getByTestId('calendar-date-2025-01-15');
    fireEvent.click(dateButton);
    
    expect(screen.getByText('NEW MOON')).toBeInTheDocument();
  });

  it('should return the correct name for first quarter phase', () => {
    mockSunCalc.getMoonIllumination.mockReturnValue({
      phase: 0.25,
      fraction: 0.5
    });
    
    renderAstronomicalEvents();
    
    const dateButton = screen.getByTestId('calendar-date-2025-01-15');
    fireEvent.click(dateButton);
    
    expect(screen.getByText('FIRST QUARTER')).toBeInTheDocument();
  });

  it('should handle the case when there is no moonset time', () => {
    mockSunCalc.getMoonTimes.mockReturnValue({
      rise: new Date('2025-01-15T18:30:00'),
      set: null
    });
    
    renderAstronomicalEvents();
    
    const dateButton = screen.getByTestId('calendar-date-2025-01-15');
    fireEvent.click(dateButton);
    
    const dialogContent = screen.getByTestId('dialog-content');
    expect(dialogContent.textContent).toContain('N/A');
  });

  it('should clear moon data when closing the dialog', () => {
    renderAstronomicalEvents();
    
    const dateButton = screen.getByTestId('calendar-date-2025-01-15');
    fireEvent.click(dateButton);
    
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    
    const dialog = screen.getByTestId('dialog');
    fireEvent.click(dialog);
    
    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
  });
});
