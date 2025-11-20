import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SidePanel from './SidePanel';

// Mock de sidepanelitems
vi.mock('./consts/sidepanelitems', () => ({
  sidepanelitems: [
    { id: 1, label: 'Home', path: '/', icon: null },
    { id: 2, label: 'Gallery', path: '/gallery', icon: null },
    { id: 3, label: 'Events', path: '/events', icon: null },
  ]
}));

const renderWithRouter = (component, initialRoute = '/') => {
  window.history.pushState({}, 'Test page', initialRoute);
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('SidePanel Component', () => {
  it('debería renderizar el componente', () => {
    renderWithRouter(<SidePanel />);
    // Verificar que el drawer está en el documento
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('debería mostrar todos los items del menú', () => {
    renderWithRouter(<SidePanel />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Gallery')).toBeInTheDocument();
    expect(screen.getByText('Events')).toBeInTheDocument();
  });

  it('debería mostrar los botones Report bug y Help', () => {
    renderWithRouter(<SidePanel />);
    expect(screen.getByText('Report bug')).toBeInTheDocument();
    expect(screen.getByText('Help')).toBeInTheDocument();
  });

  it('debería abrir el diálogo de ayuda al hacer click en Help', () => {
    renderWithRouter(<SidePanel />);
    
    const helpButton = screen.getByText('Help');
    fireEvent.click(helpButton);
    
    // Abrir diálogo
    expect(screen.getByText('How to use Artemis?')).toBeInTheDocument();
    expect(screen.getByText(/Artemis is a social network/i)).toBeInTheDocument();
  });

  it('debería resaltar el item activo según la ruta actual', () => {
    renderWithRouter(<SidePanel />, '/gallery');
    
    const galleryButton = screen.getByText('Gallery');
    const homeButton = screen.getByText('Home');
    
    // Gallery debe estar activo
    expect(galleryButton.closest('button')).toHaveStyle({
      fontWeight: 600
    });
    
    // Home NO debe estar activo
    expect(homeButton.closest('button')).toHaveStyle({
      fontWeight: 400
    });
  });
});