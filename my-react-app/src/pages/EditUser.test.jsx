import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import EditUser from './EditUser';

// Mock de fetch global
global.fetch = vi.fn();

// Mock de localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

// Datos de usuario mock
const mockUserData = {
  user: {
    _id: '123',
    name: 'Ismael García',
    email: 'ismael@example.com',
    profilePic: 'https://via.placeholder.com/150',
    bio: 'Test bio',
    followers: [],
    following: [],
    photos: [1, 2, 3],
    createdAt: '2023-03-12T00:00:00.000Z',
  }
};

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('EditUser Component', () => {
  beforeEach(() => {
    // Reset mocks antes de cada test
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('fake-token-123');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('debería mostrar un loading spinner mientras carga los datos', () => {
    // Simular carga infinita
    fetch.mockImplementation(() => new Promise(() => {}));
    
    renderWithRouter(<EditUser />);
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('debería cargar y mostrar los datos del usuario', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUserData,
    });

    renderWithRouter(<EditUser />);

    await waitFor(() => {
      expect(screen.getByText('Ismael García')).toBeInTheDocument();
    });

    expect(screen.getByDisplayValue('Ismael García')).toBeInTheDocument();
    expect(screen.getByDisplayValue('ismael@example.com')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument(); // Número de fotos
  });

  //it('debería mostrar error si no hay token', async () => {
  //  localStorageMock.getItem.mockReturnValue(null);
//
  //  renderWithRouter(<EditUser />);
//
  //  await waitFor(() => {
  //    expect(screen.getByText(/No hay sesión activa/i)).toBeInTheDocument();
  //  });
  //});

  it('debería mostrar error si falla la carga de datos', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Error al cargar datos' }),
    });

    renderWithRouter(<EditUser />);

    await waitFor(() => {
      expect(screen.getByText(/No se pudieron cargar los datos del usuario/i)).toBeInTheDocument();
    });
  });

  it('debería permitir editar el nombre del usuario', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUserData,
    });

    renderWithRouter(<EditUser />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Ismael García')).toBeInTheDocument();
    });

    const nameInput = screen.getByDisplayValue('Ismael García');
    fireEvent.change(nameInput, { target: { value: 'Nuevo Nombre' } });

    expect(screen.getByDisplayValue('Nuevo Nombre')).toBeInTheDocument();
  });

  it('debería guardar los cambios al hacer click en "Guardar cambios"', async () => {
    // Mock inicial: cargar usuario
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUserData,
    });

    renderWithRouter(<EditUser />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Ismael García')).toBeInTheDocument();
    });

    // Cambiar nombre
    const nameInput = screen.getByDisplayValue('Ismael García');
    fireEvent.change(nameInput, { target: { value: 'Nuevo Nombre' } });

    // Mock para guardar cambios
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        message: 'Perfil actualizado exitosamente',
        user: { ...mockUserData.user, name: 'Nuevo Nombre' }
      }),
    });

    // Click en guardar
    const saveButton = screen.getByText('Guardar cambios');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Cambios guardados exitosamente')).toBeInTheDocument();
    });

    // Verificar que se llamó al endpoint correcto
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:5000/api/users/profile',
      expect.objectContaining({
        method: 'PUT',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          Authorization: 'Bearer fake-token-123',
        }),
      })
    );
  });

  it('debería restaurar los datos al hacer click en "Cancelar"', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUserData,
    });

    renderWithRouter(<EditUser />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Ismael García')).toBeInTheDocument();
    });

    // Cambiar nombre
    const nameInput = screen.getByDisplayValue('Ismael García');
    fireEvent.change(nameInput, { target: { value: 'Nombre Temporal' } });
    expect(screen.getByDisplayValue('Nombre Temporal')).toBeInTheDocument();

    // Click en cancelar
    const cancelButton = screen.getByText('Cancelar');
    fireEvent.click(cancelButton);

    // Debería volver al nombre original
    expect(screen.getByDisplayValue('Ismael García')).toBeInTheDocument();
  });

  it('debería abrir el diálogo para cambiar email', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUserData,
    });

    renderWithRouter(<EditUser />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Ismael García')).toBeInTheDocument();
    });

    // Click en botón "Cambiar" del email
    const changeEmailButtons = screen.getAllByText('Cambiar');
    fireEvent.click(changeEmailButtons[0]); // Primer botón es el del email

    // Verificar que se abre el diálogo
    await waitFor(() => {
      expect(screen.getByText('Cambiar correo electrónico')).toBeInTheDocument();
    });

    expect(screen.getByLabelText('Nuevo email')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña actual')).toBeInTheDocument();
  });

  it('debería abrir el diálogo para cambiar contraseña', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUserData,
    });

    renderWithRouter(<EditUser />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Ismael García')).toBeInTheDocument();
    });

    // Click en botón "Cambiar" de la contraseña
    const changeButtons = screen.getAllByText('Cambiar');
    fireEvent.click(changeButtons[1]); // Segundo botón es el de la contraseña

    // Verificar que se abre el diálogo usando el role
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    expect(screen.getByLabelText('Contraseña actual')).toBeInTheDocument();
    expect(screen.getByLabelText('Nueva contraseña')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirmar nueva contraseña')).toBeInTheDocument();
  });

  it('debería abrir el diálogo de confirmación para eliminar cuenta', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUserData,
    });

    renderWithRouter(<EditUser />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Ismael García')).toBeInTheDocument();
    });

    // Click en botón "Eliminar cuenta"
    const deleteButton = screen.getByText('Eliminar cuenta');
    fireEvent.click(deleteButton);

    // Verificar que se abre el diálogo
    await waitFor(() => {
      expect(screen.getByText('¿Estás seguro?')).toBeInTheDocument();
    });

    expect(screen.getByText(/Esta acción no se puede deshacer/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Confirma tu contraseña')).toBeInTheDocument();
  });

  it('debería cerrar el diálogo de email al hacer click en Cancelar', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUserData,
    });

    renderWithRouter(<EditUser />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Ismael García')).toBeInTheDocument();
    });

    // Abrir diálogo de email
    const changeEmailButtons = screen.getAllByText('Cambiar');
    fireEvent.click(changeEmailButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Cambiar correo electrónico')).toBeInTheDocument();
    });

    // Click en Cancelar
    const cancelButtons = screen.getAllByText('Cancelar');
    fireEvent.click(cancelButtons[cancelButtons.length - 1]);

    // El diálogo debería cerrarse
    await waitFor(() => {
      expect(screen.queryByText('Cambiar correo electrónico')).not.toBeInTheDocument();
    });
  });

  it('debería mostrar el número correcto de fotos publicadas', async () => {
    const userWithPhotos = {
      user: {
        ...mockUserData.user,
        photos: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      }
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => userWithPhotos,
    });

    renderWithRouter(<EditUser />);

    await waitFor(() => {
      expect(screen.getByText('10')).toBeInTheDocument();
    });
  });

  it('debería formatear correctamente la fecha de registro', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUserData,
    });

    renderWithRouter(<EditUser />);

    await waitFor(() => {
      expect(screen.getByText(/Miembro desde el 12 de marzo de 2023/i)).toBeInTheDocument();
    });
  });

  it('debería mostrar 0 fotos si el usuario no tiene fotos', async () => {
    const userWithoutPhotos = {
      user: {
        ...mockUserData.user,
        photos: [],
      }
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => userWithoutPhotos,
    });

    renderWithRouter(<EditUser />);

    await waitFor(() => {
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  it('debería mostrar la inicial del nombre en el avatar', async () => {
    const userWithoutPic = {
      user: {
        ...mockUserData.user,
        profilePic: '', // Sin foto de perfil para que muestre la inicial
      }
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => userWithoutPic,
    });

    renderWithRouter(<EditUser />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Ismael García')).toBeInTheDocument();
    });

    // Buscar el avatar por su clase y verificar que contiene la letra I
    const avatar = document.querySelector('.MuiAvatar-root');
    expect(avatar).toBeInTheDocument();
    expect(avatar.textContent).toBe('I');
  });

  it('debería hacer la petición con el token correcto', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUserData,
    });

    renderWithRouter(<EditUser />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/users/profile',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer fake-token-123',
          }),
        })
      );
    });
  });
});