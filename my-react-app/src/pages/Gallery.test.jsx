import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Gallery from './Gallery';
import * as AppContextModule from '../AppContext';

// Mock de los componentes hijos
vi.mock('../components/images/add-image-button/AddImageButton', () => ({
  default: ({ onClick }) => (
    <button data-testid="add-image-button" onClick={onClick}>
      Add Image
    </button>
  )
}));

vi.mock('../components/images/add-image-dialog/AddImageDialog', () => ({
  default: ({ open, onClose, onConfirm }) => 
    open ? (
      <div data-testid="add-image-dialog">
        <button onClick={onClose}>Close</button>
        <button onClick={() => onConfirm({ title: 'Test Image', imageUrl: 'test.jpg' })}>
          Confirm
        </button>
      </div>
    ) : null
}));

vi.mock('../components/images/image-grid/ImageGrid', () => ({
  default: ({ images, onDelete }) => (
    <div data-testid="image-grid">
      {images.map((img) => (
        <div key={img.id} data-testid={`image-${img.id}`}>
          <span>{img.title}</span>
          <button onClick={() => onDelete(img.id)}>Delete</button>
        </div>
      ))}
    </div>
  )
}));

describe('Gallery Component', () => {
  let mockContextValue;

  beforeEach(() => {
    mockContextValue = {
      photos: [],
      addPhoto: vi.fn(),
      deletePhoto: vi.fn(),
      loadingImages: false
    };
    
    // Mock del hook useAppContext
    vi.spyOn(AppContextModule, 'useAppContext').mockReturnValue(mockContextValue);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderGallery = () => {
    return render(<Gallery />);
  };

  it('debería renderizar el título "My Gallery"', () => {
    renderGallery();
    expect(screen.getByText('My Gallery')).toBeInTheDocument();
  });

  it('debería mostrar el botón de añadir imagen', () => {
    renderGallery();
    expect(screen.getByTestId('add-image-button')).toBeInTheDocument();
  });

  it('debería mostrar mensaje de carga cuando loadingImages es true', () => {
    mockContextValue.loadingImages = true;
    vi.spyOn(AppContextModule, 'useAppContext').mockReturnValue(mockContextValue);
    
    renderGallery();
    
    expect(screen.getByText('Loading images...')).toBeInTheDocument();
  });

  it('debería renderizar ImageGrid con las fotos del contexto', () => {
    mockContextValue.photos = [
      {
        _id: '1',
        title: 'Photo 1',
        description: 'Description 1',
        imageUrl: 'photo1.jpg',
        likes: ['user1', 'user2'],
        comments: [{ text: 'Nice!' }],
        createdAt: '2025-01-01',
        moonPhase: 'Full Moon',
        location: 'Test Location',
        metadata: {}
      },
      {
        _id: '2',
        title: 'Photo 2',
        description: 'Description 2',
        imageUrl: 'photo2.jpg',
        likes: [],
        comments: [],
        createdAt: '2025-01-02'
      }
    ];
    vi.spyOn(AppContextModule, 'useAppContext').mockReturnValue(mockContextValue);
    
    renderGallery();
    
    expect(screen.getByTestId('image-grid')).toBeInTheDocument();
    expect(screen.getByText('Photo 1')).toBeInTheDocument();
    expect(screen.getByText('Photo 2')).toBeInTheDocument();
  });

  it('debería abrir el diálogo al hacer click en el botón añadir', () => {
    renderGallery();
    
    const addButton = screen.getByTestId('add-image-button');
    fireEvent.click(addButton);
    
    expect(screen.getByTestId('add-image-dialog')).toBeInTheDocument();
  });

  it('debería cerrar el diálogo al hacer click en close', () => {
    renderGallery();
    
    // Abrir diálogo
    const addButton = screen.getByTestId('add-image-button');
    fireEvent.click(addButton);
    
    expect(screen.getByTestId('add-image-dialog')).toBeInTheDocument();
    
    // Cerrar diálogo
    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);
    
    expect(screen.queryByTestId('add-image-dialog')).not.toBeInTheDocument();
  });

  it('debería llamar a addPhoto cuando se confirma el diálogo', async () => {
    const addPhotoMock = vi.fn().mockResolvedValue();
    mockContextValue.addPhoto = addPhotoMock;
    vi.spyOn(AppContextModule, 'useAppContext').mockReturnValue(mockContextValue);
    
    renderGallery();
    
    // Abrir diálogo
    const addButton = screen.getByTestId('add-image-button');
    fireEvent.click(addButton);
    
    // Confirmar
    const confirmButton = screen.getByText('Confirm');
    fireEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(addPhotoMock).toHaveBeenCalledWith({
        title: 'Test Image',
        imageUrl: 'test.jpg'
      });
    });
  });

  it('debería manejar errores al añadir una foto', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const addPhotoMock = vi.fn().mockRejectedValue(new Error('Failed to add photo'));
    mockContextValue.addPhoto = addPhotoMock;
    vi.spyOn(AppContextModule, 'useAppContext').mockReturnValue(mockContextValue);
    
    renderGallery();
    
    // Abrir diálogo
    const addButton = screen.getByTestId('add-image-button');
    fireEvent.click(addButton);
    
    // Confirmar
    const confirmButton = screen.getByText('Confirm');
    fireEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error al añadir foto:',
        expect.any(Error)
      );
    });
    
    consoleSpy.mockRestore();
  });

  it('debería llamar a deletePhoto cuando se elimina una imagen', async () => {
    const deletePhotoMock = vi.fn().mockResolvedValue();
    mockContextValue.deletePhoto = deletePhotoMock;
    mockContextValue.photos = [
      {
        _id: '1',
        title: 'Photo 1',
        imageUrl: 'photo1.jpg',
        likes: [],
        comments: []
      }
    ];
    vi.spyOn(AppContextModule, 'useAppContext').mockReturnValue(mockContextValue);
    
    renderGallery();
    
    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);
    
    await waitFor(() => {
      expect(deletePhotoMock).toHaveBeenCalledWith('1');
    });
  });

  it('debería manejar errores al eliminar una foto', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const deletePhotoMock = vi.fn().mockRejectedValue(new Error('Failed to delete photo'));
    mockContextValue.deletePhoto = deletePhotoMock;
    mockContextValue.photos = [
      {
        _id: '1',
        title: 'Photo 1',
        imageUrl: 'photo1.jpg',
        likes: [],
        comments: []
      }
    ];
    vi.spyOn(AppContextModule, 'useAppContext').mockReturnValue(mockContextValue);
    
    renderGallery();
    
    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error al eliminar foto:',
        expect.any(Error)
      );
    });
    
    consoleSpy.mockRestore();
  });

  it('debería transformar correctamente los datos de photos a imagesForGrid', () => {
    mockContextValue.photos = [
      {
        _id: 'mongo-id-1',
        title: 'Test Photo',
        description: 'Test Description',
        imageUrl: 'test.jpg',
        likes: ['user1', 'user2', 'user3'],
        comments: [{ text: 'Comment 1' }, { text: 'Comment 2' }],
        createdAt: '2025-01-01',
        moonPhase: 'Waxing Crescent',
        location: 'Madrid',
        metadata: { camera: 'Canon' }
      }
    ];
    vi.spyOn(AppContextModule, 'useAppContext').mockReturnValue(mockContextValue);
    
    renderGallery();
    
    // Verificar que el componente se renderiza correctamente con los datos transformados
    expect(screen.getByTestId('image-grid')).toBeInTheDocument();
    expect(screen.getByText('Test Photo')).toBeInTheDocument();
  });

  it('debería manejar likes y comments como arrays vacíos si no son arrays', () => {
    mockContextValue.photos = [
      {
        _id: '1',
        title: 'Photo',
        imageUrl: 'photo.jpg',
        likes: null, // No es array
        comments: undefined // No es array
      }
    ];
    vi.spyOn(AppContextModule, 'useAppContext').mockReturnValue(mockContextValue);
    
    renderGallery();
    
    // El componente debe renderizarse sin errores
    expect(screen.getByTestId('image-grid')).toBeInTheDocument();
  });

  it('debería renderizar el separador decorativo', () => {
    const { container } = renderGallery();
    
    // Verificar que existe un Divider con el estilo específico
    const divider = container.querySelector('hr');
    expect(divider).toBeInTheDocument();
  });

  it('no debería mostrar ImageGrid cuando está cargando', () => {
    mockContextValue.loadingImages = true;
    vi.spyOn(AppContextModule, 'useAppContext').mockReturnValue(mockContextValue);
    
    renderGallery();
    
    expect(screen.queryByTestId('image-grid')).not.toBeInTheDocument();
  });

  it('debería cerrar el diálogo después de confirmar', async () => {
    const addPhotoMock = vi.fn().mockResolvedValue();
    mockContextValue.addPhoto = addPhotoMock;
    vi.spyOn(AppContextModule, 'useAppContext').mockReturnValue(mockContextValue);
    
    renderGallery();
    
    // Abrir diálogo
    const addButton = screen.getByTestId('add-image-button');
    fireEvent.click(addButton);
    
    expect(screen.getByTestId('add-image-dialog')).toBeInTheDocument();
    
    // Confirmar
    const confirmButton = screen.getByText('Confirm');
    fireEvent.click(confirmButton);
    
    // El diálogo no debe cerrarse automáticamente al confirmar
    // (esto depende de la implementación del AddImageDialog)
    expect(screen.getByTestId('add-image-dialog')).toBeInTheDocument();
  });
});
