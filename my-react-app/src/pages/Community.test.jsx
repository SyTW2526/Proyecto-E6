import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Community from './Community';
import * as AppContextModule from '../AppContext';

// Mock de los componentes hijos
vi.mock('../components/posts/add-post-button/AddPostButton', () => ({
  default: ({ onClick }) => (
    <button data-testid="add-post-button" onClick={onClick}>
      Add Post
    </button>
  )
}));

vi.mock('../components/posts/add-post-dialog/AddPostDialog', () => ({
  default: ({ open, onClose, onConfirm }) => 
    open ? (
      <div data-testid="add-post-dialog">
        <button onClick={onClose}>Close</button>
        <button onClick={() => onConfirm({ title: 'Test Post', description: 'Test description' })}>
          Confirm
        </button>
      </div>
    ) : null
}));

vi.mock('../components/posts/post-grid/PostGrid', () => ({
  default: ({ posts, onDelete }) => (
    <div data-testid="post-grid">
      {posts.map((post) => (
        <div key={post._id || post.id} data-testid={`post-${post._id || post.id}`}>
          <span>{post.title}</span>
          <button onClick={() => onDelete(post._id || post.id)}>Delete</button>
        </div>
      ))}
    </div>
  )
}));

describe('Community Component', () => {
  let mockContextValue;

  beforeEach(() => {
    mockContextValue = {
      posts: [],
      addPost: vi.fn(),
      deletePost: vi.fn(),
      loadingPosts: false
    };
    
    // Mock del hook useAppContext
    vi.spyOn(AppContextModule, 'useAppContext').mockReturnValue(mockContextValue);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderCommunity = () => {
    return render(<Community />);
  };

  it('debería renderizar el título "Community"', () => {
    renderCommunity();
    expect(screen.getByText('Community')).toBeInTheDocument();
  });

  it('debería mostrar el botón de añadir post', () => {
    renderCommunity();
    expect(screen.getByTestId('add-post-button')).toBeInTheDocument();
  });

  it('debería mostrar mensaje de carga cuando loadingPosts es true', () => {
    mockContextValue.loadingPosts = true;
    vi.spyOn(AppContextModule, 'useAppContext').mockReturnValue(mockContextValue);
    
    renderCommunity();
    
    expect(screen.getByText('Cargando posts...')).toBeInTheDocument();
  });

  it('debería renderizar PostGrid con los posts del contexto', () => {
    mockContextValue.posts = [
      {
        _id: '1',
        title: 'Post 1',
        description: 'Description 1',
        userId: 'user1',
        userName: 'User One',
        photos: [],
        likes: ['user1', 'user2'],
        comments: [{ text: 'Great post!' }],
        createdAt: '2025-01-01'
      },
      {
        _id: '2',
        title: 'Post 2',
        description: 'Description 2',
        userId: 'user2',
        userName: 'User Two',
        photos: [],
        likes: [],
        comments: [],
        createdAt: '2025-01-02'
      }
    ];
    vi.spyOn(AppContextModule, 'useAppContext').mockReturnValue(mockContextValue);
    
    renderCommunity();
    
    expect(screen.getByTestId('post-grid')).toBeInTheDocument();
    expect(screen.getByText('Post 1')).toBeInTheDocument();
    expect(screen.getByText('Post 2')).toBeInTheDocument();
  });

  it('debería abrir el diálogo al hacer click en el botón añadir', () => {
    renderCommunity();
    
    const addButton = screen.getByTestId('add-post-button');
    fireEvent.click(addButton);
    
    expect(screen.getByTestId('add-post-dialog')).toBeInTheDocument();
  });

  it('debería cerrar el diálogo al hacer click en close', () => {
    renderCommunity();
    
    // Abrir diálogo
    const addButton = screen.getByTestId('add-post-button');
    fireEvent.click(addButton);
    
    expect(screen.getByTestId('add-post-dialog')).toBeInTheDocument();
    
    // Cerrar diálogo
    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);
    
    expect(screen.queryByTestId('add-post-dialog')).not.toBeInTheDocument();
  });

  it('debería llamar a addPost cuando se confirma el diálogo', async () => {
    const addPostMock = vi.fn().mockResolvedValue();
    mockContextValue.addPost = addPostMock;
    vi.spyOn(AppContextModule, 'useAppContext').mockReturnValue(mockContextValue);
    
    renderCommunity();
    
    // Abrir diálogo
    const addButton = screen.getByTestId('add-post-button');
    fireEvent.click(addButton);
    
    // Confirmar
    const confirmButton = screen.getByText('Confirm');
    fireEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(addPostMock).toHaveBeenCalledWith({
        title: 'Test Post',
        description: 'Test description'
      });
    });
  });

  it('debería cerrar el diálogo después de confirmar exitosamente', async () => {
    const addPostMock = vi.fn().mockResolvedValue();
    mockContextValue.addPost = addPostMock;
    vi.spyOn(AppContextModule, 'useAppContext').mockReturnValue(mockContextValue);
    
    renderCommunity();
    
    // Abrir diálogo
    const addButton = screen.getByTestId('add-post-button');
    fireEvent.click(addButton);
    
    expect(screen.getByTestId('add-post-dialog')).toBeInTheDocument();
    
    // Confirmar
    const confirmButton = screen.getByText('Confirm');
    fireEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(screen.queryByTestId('add-post-dialog')).not.toBeInTheDocument();
    });
  });

  it('debería manejar errores al añadir un post', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const addPostMock = vi.fn().mockRejectedValue(new Error('Failed to add post'));
    mockContextValue.addPost = addPostMock;
    vi.spyOn(AppContextModule, 'useAppContext').mockReturnValue(mockContextValue);
    
    renderCommunity();
    
    // Abrir diálogo
    const addButton = screen.getByTestId('add-post-button');
    fireEvent.click(addButton);
    
    // Confirmar
    const confirmButton = screen.getByText('Confirm');
    fireEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error al crear post:',
        expect.any(Error)
      );
    });
    
    consoleSpy.mockRestore();
  });

  it('debería llamar a deletePost cuando se elimina un post', async () => {
    const deletePostMock = vi.fn().mockResolvedValue();
    mockContextValue.deletePost = deletePostMock;
    mockContextValue.posts = [
      {
        _id: '1',
        title: 'Post 1',
        description: 'Description',
        userId: 'user1',
        userName: 'User',
        photos: [],
        likes: [],
        comments: []
      }
    ];
    vi.spyOn(AppContextModule, 'useAppContext').mockReturnValue(mockContextValue);
    
    renderCommunity();
    
    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);
    
    await waitFor(() => {
      expect(deletePostMock).toHaveBeenCalledWith('1');
    });
  });

  it('debería manejar errores al eliminar un post', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const deletePostMock = vi.fn().mockRejectedValue(new Error('Failed to delete post'));
    mockContextValue.deletePost = deletePostMock;
    mockContextValue.posts = [
      {
        _id: '1',
        title: 'Post 1',
        description: 'Description',
        userId: 'user1',
        userName: 'User',
        photos: [],
        likes: [],
        comments: []
      }
    ];
    vi.spyOn(AppContextModule, 'useAppContext').mockReturnValue(mockContextValue);
    
    renderCommunity();
    
    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error al eliminar post:',
        expect.any(Error)
      );
    });
    
    consoleSpy.mockRestore();
  });

  it('debería renderizar el separador decorativo', () => {
    const { container } = renderCommunity();
    
    // Verificar que existe un Divider
    const divider = container.querySelector('hr');
    expect(divider).toBeInTheDocument();
  });

  it('no debería mostrar PostGrid cuando está cargando', () => {
    mockContextValue.loadingPosts = true;
    vi.spyOn(AppContextModule, 'useAppContext').mockReturnValue(mockContextValue);
    
    renderCommunity();
    
    expect(screen.queryByTestId('post-grid')).not.toBeInTheDocument();
  });

  it('debería renderizar PostGrid con posts vacíos', () => {
    mockContextValue.posts = [];
    vi.spyOn(AppContextModule, 'useAppContext').mockReturnValue(mockContextValue);
    
    renderCommunity();
    
    expect(screen.getByTestId('post-grid')).toBeInTheDocument();
  });

  it('debería manejar posts con id regular (sin _id)', () => {
    mockContextValue.posts = [
      {
        id: 'regular-id-1',
        title: 'Post with regular id',
        description: 'Description',
        userId: 'user1',
        userName: 'User',
        photos: [],
        likes: [],
        comments: []
      }
    ];
    vi.spyOn(AppContextModule, 'useAppContext').mockReturnValue(mockContextValue);
    
    renderCommunity();
    
    expect(screen.getByTestId('post-regular-id-1')).toBeInTheDocument();
  });

  it('debería pasar onDelete correctamente al PostGrid', () => {
    mockContextValue.posts = [
      {
        _id: '1',
        title: 'Post 1',
        description: 'Description',
        userId: 'user1',
        userName: 'User',
        photos: [],
        likes: [],
        comments: []
      }
    ];
    vi.spyOn(AppContextModule, 'useAppContext').mockReturnValue(mockContextValue);
    
    renderCommunity();
    
    // Verificar que el botón de eliminar está presente
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  // Tests para el buscador
  it('debería renderizar el campo de búsqueda', () => {
    renderCommunity();
    
    const searchInput = screen.getByPlaceholderText(/Buscar por nombre de usuario/i);
    expect(searchInput).toBeInTheDocument();
  });

  it('debería filtrar posts por nombre de usuario', () => {
    mockContextValue.posts = [
      {
        _id: '1',
        title: 'Post 1',
        description: 'Description 1',
        userId: 'user1',
        userName: 'Alice',
        photos: [],
        likes: [],
        comments: [],
        createdAt: '2025-01-01'
      },
      {
        _id: '2',
        title: 'Post 2',
        description: 'Description 2',
        userId: 'user2',
        userName: 'Bob',
        photos: [],
        likes: [],
        comments: [],
        createdAt: '2025-01-02'
      }
    ];
    vi.spyOn(AppContextModule, 'useAppContext').mockReturnValue(mockContextValue);
    
    renderCommunity();
    
    const searchInput = screen.getByPlaceholderText(/Buscar por nombre de usuario/i);
    fireEvent.change(searchInput, { target: { value: 'Alice' } });
    
    expect(screen.getByText('Post 1')).toBeInTheDocument();
    expect(screen.queryByText('Post 2')).not.toBeInTheDocument();
  });

  it('debería filtrar posts por título', () => {
    mockContextValue.posts = [
      {
        _id: '1',
        title: 'Amazing Sunset',
        description: 'Description 1',
        userId: 'user1',
        userName: 'User',
        photos: [],
        likes: [],
        comments: [],
        createdAt: '2025-01-01'
      },
      {
        _id: '2',
        title: 'Mountain View',
        description: 'Description 2',
        userId: 'user2',
        userName: 'User',
        photos: [],
        likes: [],
        comments: [],
        createdAt: '2025-01-02'
      }
    ];
    vi.spyOn(AppContextModule, 'useAppContext').mockReturnValue(mockContextValue);
    
    renderCommunity();
    
    const searchInput = screen.getByPlaceholderText(/Buscar por nombre de usuario/i);
    fireEvent.change(searchInput, { target: { value: 'Sunset' } });
    
    expect(screen.getByText('Amazing Sunset')).toBeInTheDocument();
    expect(screen.queryByText('Mountain View')).not.toBeInTheDocument();
  });

  it('debería filtrar posts por descripción', () => {
    mockContextValue.posts = [
      {
        _id: '1',
        title: 'Post 1',
        description: 'Beautiful landscape',
        userId: 'user1',
        userName: 'User',
        photos: [],
        likes: [],
        comments: [],
        createdAt: '2025-01-01'
      },
      {
        _id: '2',
        title: 'Post 2',
        description: 'City architecture',
        userId: 'user2',
        userName: 'User',
        photos: [],
        likes: [],
        comments: [],
        createdAt: '2025-01-02'
      }
    ];
    vi.spyOn(AppContextModule, 'useAppContext').mockReturnValue(mockContextValue);
    
    renderCommunity();
    
    const searchInput = screen.getByPlaceholderText(/Buscar por nombre de usuario/i);
    fireEvent.change(searchInput, { target: { value: 'landscape' } });
    
    expect(screen.getByText('Post 1')).toBeInTheDocument();
    expect(screen.queryByText('Post 2')).not.toBeInTheDocument();
  });

  it('debería buscar en metadatos de fotos (cámara)', () => {
    mockContextValue.posts = [
      {
        _id: '1',
        title: 'Post 1',
        description: 'Description',
        userId: 'user1',
        userName: 'User',
        photos: [{
          _id: 'photo1',
          title: 'Photo',
          metadata: { camera: 'Canon EOS' }
        }],
        likes: [],
        comments: [],
        createdAt: '2025-01-01'
      },
      {
        _id: '2',
        title: 'Post 2',
        description: 'Description',
        userId: 'user2',
        userName: 'User',
        photos: [{
          _id: 'photo2',
          title: 'Photo',
          metadata: { camera: 'Nikon D850' }
        }],
        likes: [],
        comments: [],
        createdAt: '2025-01-02'
      }
    ];
    vi.spyOn(AppContextModule, 'useAppContext').mockReturnValue(mockContextValue);
    
    renderCommunity();
    
    const searchInput = screen.getByPlaceholderText(/Buscar por nombre de usuario/i);
    fireEvent.change(searchInput, { target: { value: 'Canon' } });
    
    expect(screen.getByText('Post 1')).toBeInTheDocument();
    expect(screen.queryByText('Post 2')).not.toBeInTheDocument();
  });

  it('debería mostrar todos los posts cuando el buscador está vacío', () => {
    mockContextValue.posts = [
      {
        _id: '1',
        title: 'Post 1',
        description: 'Description',
        userId: 'user1',
        userName: 'User',
        photos: [],
        likes: [],
        comments: [],
        createdAt: '2025-01-01'
      },
      {
        _id: '2',
        title: 'Post 2',
        description: 'Description',
        userId: 'user2',
        userName: 'User',
        photos: [],
        likes: [],
        comments: [],
        createdAt: '2025-01-02'
      }
    ];
    vi.spyOn(AppContextModule, 'useAppContext').mockReturnValue(mockContextValue);
    
    renderCommunity();
    
    expect(screen.getByText('Post 1')).toBeInTheDocument();
    expect(screen.getByText('Post 2')).toBeInTheDocument();
  });

  // Tests para los botones de ordenamiento
  it('debería renderizar los botones de ordenamiento', () => {
    renderCommunity();
    
    expect(screen.getByText('Más Populares')).toBeInTheDocument();
    expect(screen.getByText('Más Recientes')).toBeInTheDocument();
  });

  it('debería ordenar posts por popularidad (más likes primero)', () => {
    mockContextValue.posts = [
      {
        _id: '1',
        title: 'Post con 2 likes',
        description: 'Description',
        userId: 'user1',
        userName: 'User',
        photos: [],
        likes: ['user1', 'user2'],
        comments: [],
        createdAt: '2025-01-01'
      },
      {
        _id: '2',
        title: 'Post con 5 likes',
        description: 'Description',
        userId: 'user2',
        userName: 'User',
        photos: [],
        likes: ['user1', 'user2', 'user3', 'user4', 'user5'],
        comments: [],
        createdAt: '2025-01-02'
      },
      {
        _id: '3',
        title: 'Post con 1 like',
        description: 'Description',
        userId: 'user3',
        userName: 'User',
        photos: [],
        likes: ['user1'],
        comments: [],
        createdAt: '2025-01-03'
      }
    ];
    vi.spyOn(AppContextModule, 'useAppContext').mockReturnValue(mockContextValue);
    
    const { container } = renderCommunity();
    
    const popularButton = screen.getByText('Más Populares');
    fireEvent.click(popularButton);
    
    // Verificar que los posts están en el orden correcto (por likes)
    const postGrid = screen.getByTestId('post-grid');
    const postTitles = Array.from(postGrid.querySelectorAll('span')).map(span => span.textContent);
    
    expect(postTitles[0]).toBe('Post con 5 likes');
    expect(postTitles[1]).toBe('Post con 2 likes');
    expect(postTitles[2]).toBe('Post con 1 like');
  });

  it('debería ordenar posts por fecha (más recientes primero)', () => {
    mockContextValue.posts = [
      {
        _id: '1',
        title: 'Post Antiguo',
        description: 'Description',
        userId: 'user1',
        userName: 'User',
        photos: [],
        likes: ['user1', 'user2', 'user3'],
        comments: [],
        createdAt: '2025-01-01'
      },
      {
        _id: '2',
        title: 'Post Reciente',
        description: 'Description',
        userId: 'user2',
        userName: 'User',
        photos: [],
        likes: ['user1'],
        comments: [],
        createdAt: '2025-01-15'
      },
      {
        _id: '3',
        title: 'Post Medio',
        description: 'Description',
        userId: 'user3',
        userName: 'User',
        photos: [],
        likes: [],
        comments: [],
        createdAt: '2025-01-10'
      }
    ];
    vi.spyOn(AppContextModule, 'useAppContext').mockReturnValue(mockContextValue);
    
    const { container } = renderCommunity();
    
    const recentButton = screen.getByText('Más Recientes');
    fireEvent.click(recentButton);
    
    // Verificar que los posts están en el orden correcto (por fecha)
    const postGrid = screen.getByTestId('post-grid');
    const postTitles = Array.from(postGrid.querySelectorAll('span')).map(span => span.textContent);
    
    expect(postTitles[0]).toBe('Post Reciente');
    expect(postTitles[1]).toBe('Post Medio');
    expect(postTitles[2]).toBe('Post Antiguo');
  });

  it('debería mantener el filtrado de búsqueda al cambiar el orden', () => {
    mockContextValue.posts = [
      {
        _id: '1',
        title: 'Sunset Photo',
        description: 'Description',
        userId: 'user1',
        userName: 'Alice',
        photos: [],
        likes: ['user1'],
        comments: [],
        createdAt: '2025-01-01'
      },
      {
        _id: '2',
        title: 'Sunset View',
        description: 'Description',
        userId: 'user2',
        userName: 'Bob',
        photos: [],
        likes: ['user1', 'user2', 'user3'],
        comments: [],
        createdAt: '2025-01-02'
      },
      {
        _id: '3',
        title: 'Mountain',
        description: 'Description',
        userId: 'user3',
        userName: 'Charlie',
        photos: [],
        likes: [],
        comments: [],
        createdAt: '2025-01-03'
      }
    ];
    vi.spyOn(AppContextModule, 'useAppContext').mockReturnValue(mockContextValue);
    
    renderCommunity();
    
    // Buscar posts con "Sunset"
    const searchInput = screen.getByPlaceholderText(/Buscar por nombre de usuario/i);
    fireEvent.change(searchInput, { target: { value: 'Sunset' } });
    
    // Ordenar por popularidad
    const popularButton = screen.getByText('Más Populares');
    fireEvent.click(popularButton);
    
    // Solo deberían aparecer los posts con "Sunset" y ordenados por likes
    expect(screen.getByText('Sunset View')).toBeInTheDocument(); // 3 likes
    expect(screen.getByText('Sunset Photo')).toBeInTheDocument(); // 1 like
    expect(screen.queryByText('Mountain')).not.toBeInTheDocument();
  });

  it('debería mostrar el botón activo visualmente', () => {
    renderCommunity();
    
    const popularButton = screen.getByText('Más Populares');
    const recentButton = screen.getByText('Más Recientes');
    
    // Por defecto, "Más Populares" está activo
    expect(popularButton.closest('button')).toHaveClass('MuiButton-contained');
    
    // Click en "Más Recientes"
    fireEvent.click(recentButton);
    
    expect(recentButton.closest('button')).toHaveClass('MuiButton-contained');
  });
});

