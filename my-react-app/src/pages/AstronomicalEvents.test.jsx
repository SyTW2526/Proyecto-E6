import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AstronomicalEvents from './AstronomicalEvents';
import * as SunCalcModule from '../three-app/suncalc.js';

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
  let mockSunCalc;

  beforeEach(() => {
    // Mock de SunCalc
    mockSunCalc = {
      getMoonIllumination: vi.fn().mockReturnValue({
        phase: 0.5, // Luna llena
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

  it('debería renderizar el título del calendario', () => {
    renderAstronomicalEvents();
    expect(screen.getByText('Calendario de Efemérides Astronómicas')).toBeInTheDocument();
  });

  it('debería renderizar el texto descriptivo', () => {
    renderAstronomicalEvents();
    expect(screen.getByText(/Cada día muestra su fase lunar/i)).toBeInTheDocument();
  });

  it('debería renderizar el componente FullCalendar', () => {
    renderAstronomicalEvents();
    expect(screen.getByTestId('full-calendar')).toBeInTheDocument();
  });

  it('debería generar eventos para los próximos 365 días', async () => {
    renderAstronomicalEvents();
    
    await waitFor(() => {
      const eventsContainer = screen.getByTestId('calendar-events');
      const events = eventsContainer.querySelectorAll('[data-testid^="event-"]');
      expect(events.length).toBeGreaterThan(0);
    });
  });

  it('debería abrir el diálogo al hacer click en una fecha', () => {
    renderAstronomicalEvents();
    
    const dateButton = screen.getByTestId('calendar-date-2025-01-15');
    fireEvent.click(dateButton);
    
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
  });

  it('debería mostrar el título del diálogo con la fecha seleccionada', () => {
    renderAstronomicalEvents();
    
    const dateButton = screen.getByTestId('calendar-date-2025-01-15');
    fireEvent.click(dateButton);
    
    expect(screen.getByTestId('dialog-title')).toHaveTextContent('Fase lunar del 2025-01-15');
  });

  it('debería calcular y mostrar los datos de la luna al seleccionar una fecha', () => {
    renderAstronomicalEvents();
    
    const dateButton = screen.getByTestId('calendar-date-2025-01-15');
    fireEvent.click(dateButton);
    
    expect(mockSunCalc.getMoonIllumination).toHaveBeenCalled();
    expect(mockSunCalc.getMoonPosition).toHaveBeenCalled();
    expect(mockSunCalc.getMoonTimes).toHaveBeenCalled();
  });

  it('debería mostrar el emoji correcto según la fase lunar', () => {
    mockSunCalc.getMoonIllumination.mockReturnValue({
      phase: 0.5, // Luna llena
      fraction: 0.99
    });
    
    renderAstronomicalEvents();
    
    const dateButton = screen.getByTestId('calendar-date-2025-01-15');
    fireEvent.click(dateButton);
    
    const dialogContent = screen.getByTestId('dialog-content');
    expect(dialogContent).toHaveTextContent('🌕');
  });

  it('debería mostrar el nombre correcto de la fase lunar', () => {
    mockSunCalc.getMoonIllumination.mockReturnValue({
      phase: 0.5, // Luna llena
      fraction: 0.99
    });
    
    renderAstronomicalEvents();
    
    const dateButton = screen.getByTestId('calendar-date-2025-01-15');
    fireEvent.click(dateButton);
    
    expect(screen.getByText('LUNA LLENA')).toBeInTheDocument();
  });

  it('debería mostrar la hora de salida de la luna', () => {
    renderAstronomicalEvents();
    
    const dateButton = screen.getByTestId('calendar-date-2025-01-15');
    fireEvent.click(dateButton);
    
    expect(screen.getByText(/Salida de la luna:/i)).toBeInTheDocument();
    expect(screen.getByText(/18:30/)).toBeInTheDocument();
  });

  it('debería mostrar la hora de puesta de la luna', () => {
    renderAstronomicalEvents();
    
    const dateButton = screen.getByTestId('calendar-date-2025-01-15');
    fireEvent.click(dateButton);
    
    expect(screen.getByText(/Puesta de la luna:/i)).toBeInTheDocument();
    expect(screen.getByText(/06:45/)).toBeInTheDocument();
  });

  it('debería mostrar la distancia de la luna', () => {
    renderAstronomicalEvents();
    
    const dateButton = screen.getByTestId('calendar-date-2025-01-15');
    fireEvent.click(dateButton);
    
    expect(screen.getByText(/Distancia:/i)).toBeInTheDocument();
    expect(screen.getByText(/384400 km/)).toBeInTheDocument();
  });

  it('debería mostrar el porcentaje de iluminación', () => {
    renderAstronomicalEvents();
    
    const dateButton = screen.getByTestId('calendar-date-2025-01-15');
    fireEvent.click(dateButton);
    
    expect(screen.getByText(/Iluminación:/i)).toBeInTheDocument();
    expect(screen.getByText(/99.0%/)).toBeInTheDocument();
  });

  it('debería mostrar la barra de progreso de iluminación', () => {
    renderAstronomicalEvents();
    
    const dateButton = screen.getByTestId('calendar-date-2025-01-15');
    fireEvent.click(dateButton);
    
    const progressBar = screen.getByTestId('linear-progress');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar.getAttribute('data-value')).toBe('99');
  });

  it('debería cerrar el diálogo al hacer click fuera', () => {
    renderAstronomicalEvents();
    
    const dateButton = screen.getByTestId('calendar-date-2025-01-15');
    fireEvent.click(dateButton);
    
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    
    const dialog = screen.getByTestId('dialog');
    fireEvent.click(dialog);
    
    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
  });

  it('debería manejar el caso cuando no hay hora de salida de la luna', () => {
    mockSunCalc.getMoonTimes.mockReturnValue({
      rise: null,
      set: new Date('2025-01-15T06:45:00')
    });
    
    renderAstronomicalEvents();
    
    const dateButton = screen.getByTestId('calendar-date-2025-01-15');
    fireEvent.click(dateButton);
    
    expect(screen.getByText(/N\/A/)).toBeInTheDocument();
  });

  it('debería usar las coordenadas correctas de Madrid', () => {
    renderAstronomicalEvents();
    
    const dateButton = screen.getByTestId('calendar-date-2025-01-15');
    fireEvent.click(dateButton);
    
    expect(mockSunCalc.getMoonPosition).toHaveBeenCalledWith(
      expect.any(Date),
      40.4168,
      -3.7038
    );
  });

  it('debería retornar el emoji correcto para luna nueva', () => {
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

  it('debería retornar el emoji correcto para cuarto creciente', () => {
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

});