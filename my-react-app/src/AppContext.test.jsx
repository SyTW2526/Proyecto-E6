import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AppProvider, useAppContext } from './AppContext';
import * as api from './services/api';

// Mock de los servicios API
vi.mock('./services/api', () => ({
  fetchPhotos: vi.fn(),
  fetchPosts: vi.fn(),
  createPhoto: vi.fn(),
  deletePhoto: vi.fn(),
  likePhoto: vi.fn(),
  unlikePhoto: vi.fn(),
  addComment: vi.fn(),
  createPost: vi.fn(),
  deletePost: vi.fn(),
  likePost: vi.fn(),
  unlikePost: vi.fn(),
  addPostComment: vi.fn(),
  deletePostComment: vi.fn(),
}));

// Mock de localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

global.localStorage = localStorageMock;

// Mock de geolocation
const mockGeolocation = {
  getCurrentPosition: vi.fn(),
};
global.navigator.geolocation = mockGeolocation;

// Mock de fetch
global.fetch = vi.fn();

describe('AppContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    
    // Setup default fetch mock para auth/me
    global.fetch.mockResolvedValue({
      ok: false,
      json: async () => ({}),
    });
    
    // Setup default geolocation mock
    mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
      error({ code: 1, message: 'Permission denied' });
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useAppContext(), {
        wrapper: AppProvider,
      });

      expect(result.current.currentUser).toBeNull();
      expect(result.current.photos).toEqual([]);
      expect(result.current.posts).toEqual([]);
      expect(result.current.events).toEqual([]);
      expect(result.current.location).toEqual({ lat: 28.4636, lng: -16.2518 });
    });

    it('should set loading to true initially and then false', async () => {
      const { result } = renderHook(() => useAppContext(), {
        wrapper: AppProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should throw error when used outside AppProvider', () => {
      expect(() => {
        renderHook(() => useAppContext());
      }).toThrow('useAppContext debe usarse dentro de un AppProvider');
    });

    it('should initialize with geolocation when permission granted', async () => {
      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success({
          coords: {
            latitude: 40.4168,
            longitude: -3.7038,
          },
        });
      });

      const { result } = renderHook(() => useAppContext(), {
        wrapper: AppProvider,
      });

      await waitFor(() => {
        expect(result.current.latitudeState).toBe(40.4168);
        expect(result.current.longitudeState).toBe(-3.7038);
      });
    });

    it('should use default location when geolocation fails', async () => {
      const { result } = renderHook(() => useAppContext(), {
        wrapper: AppProvider,
      });

      await waitFor(() => {
        expect(result.current.latitudeState).toBe(28.4636);
        expect(result.current.longitudeState).toBe(-16.2518);
      });
    });

    it('should verify token on initialization if present', async () => {
      const mockUser = {
        id: 'user1',
        name: 'Test User',
        email: 'test@test.com',
        profilePic: '',
        bio: 'Test bio',
      };

      localStorageMock.getItem.mockReturnValue('mock-token');
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ user: mockUser }),
      });

      const { result } = renderHook(() => useAppContext(), {
        wrapper: AppProvider,
      });

      await waitFor(() => {
        expect(result.current.currentUser).toEqual(mockUser);
      });
    });

    it('should clear token if verification fails', async () => {
      localStorageMock.getItem.mockReturnValue('invalid-token');
      global.fetch.mockResolvedValue({
        ok: false,
      });

      const { result } = renderHook(() => useAppContext(), {
        wrapper: AppProvider,
      });

      await waitFor(() => {
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('artemis_token');
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('artemis_user');
      });
    });
  });

  describe('User Actions', () => {
    //it('should login user', () => {
    //  const { result } = renderHook(() => useAppContext(), {
    //    wrapper: AppProvider,
    //  });
//
    //  const userData = {
    //    id: 'user1',
    //    name: 'Test User',
    //    email: 'test@test.com',
    //    profilePic: 'pic.jpg',
    //    bio: 'Test bio',
    //  };
//
    //  act(() => {
    //    result.current.loginUser(userData);
    //  });
//
    //  expect(result.current.currentUser).toEqual(userData);
    //  expect(localStorageMock.setItem).toHaveBeenCalledWith(
    //    'artemis_user',
    //    JSON.stringify(userData)
    //  );
    //});

    it('should logout user', async () => {
      const { result } = renderHook(() => useAppContext(), {
        wrapper: AppProvider,
      });

      act(() => {
        result.current.loginUser({
          id: 'user1',
          name: 'Test User',
          email: 'test@test.com',
        });
      });

      act(() => {
        result.current.logoutUser();
      });

      expect(result.current.currentUser).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('artemis_user');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('artemis_token');
    });

    it('should update user profile', () => {
      const { result } = renderHook(() => useAppContext(), {
        wrapper: AppProvider,
      });

      act(() => {
        result.current.loginUser({
          id: 'user1',
          name: 'Test User',
          email: 'test@test.com',
          bio: 'Old bio',
        });
      });

      act(() => {
        result.current.updateUserProfile('user1', { bio: 'New bio' });
      });

      expect(result.current.currentUser.bio).toBe('New bio');
    });
  });

  describe('Photo Actions', () => {
    const mockUser = {
      id: 'user1',
      name: 'Test User',
      email: 'test@test.com',
    };

    const mockPhoto = {
      _id: 'photo1',
      userId: 'user1',
      title: 'Test Photo',
      description: 'Test description',
      imageUrl: 'data:image/png;base64,test',
      moonPhase: 50,
      location: { lat: 28.4636, lng: -16.2518 },
      likes: [],
      comments: [],
      metadata: {
        camera: 'Canon',
        lens: '50mm',
        iso: '800',
        exposure: '1/100',
        aperture: 'f/2.8',
      },
    };

    //it('should add photo', async () => {
    //  api.createPhoto.mockResolvedValue(mockPhoto);
//
    //  const { result } = renderHook(() => useAppContext(), {
    //    wrapper: AppProvider,
    //  });
//
    //  act(() => {
    //    result.current.loginUser(mockUser);
    //  });
//
    //  await waitFor(() => {
    //    expect(result.current.loadingImages).toBe(false);
    //  });
//
    //  await act(async () => {
    //    await result.current.addPhoto({
    //      title: 'Test Photo',
    //      description: 'Test description',
    //      imageUrl: 'data:image/png;base64,test',
    //      moonPhase: 50,
    //      location: { lat: 28.4636, lng: -16.2518 },
    //      camera: 'Canon',
    //      lens: '50mm',
    //      iso: '800',
    //      exposure: '1/100',
    //      aperture: 'f/2.8',
    //    });
    //  });
//
    //  expect(result.current.photos).toContainEqual(mockPhoto);
    //});

    it('should delete photo', async () => {
      api.fetchPhotos.mockResolvedValue([mockPhoto]);
      api.deletePhoto.mockResolvedValue({});

      const { result } = renderHook(() => useAppContext(), {
        wrapper: AppProvider,
      });

      act(() => {
        result.current.loginUser(mockUser);
      });

      await waitFor(() => {
        expect(result.current.photos.length).toBe(1);
      });

      await act(async () => {
        await result.current.deletePhoto('photo1');
      });

      expect(result.current.photos).toEqual([]);
    });

    it('should handle delete photo error when not logged in', async () => {
      const { result } = renderHook(() => useAppContext(), {
        wrapper: AppProvider,
      });

      await expect(
        act(async () => {
          await result.current.deletePhoto('photo1');
        })
      ).rejects.toThrow('Debes estar logueado para eliminar fotos');
    });

    it('should like photo', async () => {
      api.fetchPhotos.mockResolvedValue([mockPhoto]);
      api.likePhoto.mockResolvedValue({});

      const { result } = renderHook(() => useAppContext(), {
        wrapper: AppProvider,
      });

      act(() => {
        result.current.loginUser(mockUser);
      });

      await waitFor(() => {
        expect(result.current.photos.length).toBe(1);
      });

      await act(async () => {
        await result.current.likePhoto('photo1');
      });

      expect(result.current.photos[0].likes).toContain('user1');
    });

    it('should unlike photo', async () => {
      const likedPhoto = { ...mockPhoto, likes: ['user1'] };
      api.fetchPhotos.mockResolvedValue([likedPhoto]);
      api.unlikePhoto.mockResolvedValue({});

      const { result } = renderHook(() => useAppContext(), {
        wrapper: AppProvider,
      });

      act(() => {
        result.current.loginUser(mockUser);
      });

      await waitFor(() => {
        expect(result.current.photos[0].likes).toContain('user1');
      });

      await act(async () => {
        await result.current.unlikePhoto('photo1');
      });

      expect(result.current.photos[0].likes).not.toContain('user1');
    });

    it('should add comment to photo', async () => {
      const updatedPhoto = {
        ...mockPhoto,
        comments: [{ userId: 'user1', text: 'Great photo!' }],
      };
      api.fetchPhotos.mockResolvedValue([mockPhoto]);
      api.addComment.mockResolvedValue(updatedPhoto);

      const { result } = renderHook(() => useAppContext(), {
        wrapper: AppProvider,
      });

      act(() => {
        result.current.loginUser(mockUser);
      });

      await waitFor(() => {
        expect(result.current.photos.length).toBe(1);
      });

      await act(async () => {
        await result.current.addCommentToPhoto('photo1', 'Great photo!');
      });

      expect(result.current.photos[0].comments.length).toBe(1);
    });

    it('should not like photo when not logged in', async () => {
      const { result } = renderHook(() => useAppContext(), {
        wrapper: AppProvider,
      });

      await act(async () => {
        await result.current.likePhoto('photo1');
      });

      expect(api.likePhoto).not.toHaveBeenCalled();
    });

    it('should handle add photo error', async () => {
      api.createPhoto.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useAppContext(), {
        wrapper: AppProvider,
      });

      act(() => {
        result.current.loginUser(mockUser);
      });

      await waitFor(() => {
        expect(result.current.loadingImages).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.addPhoto({
            title: 'Test Photo',
            description: 'Test description',
            imageUrl: 'data:image/png;base64,test',
          });
        })
      ).rejects.toThrow('Network error');
    });
  });

  describe('Post Actions', () => {
    const mockUser = {
      id: 'user1',
      name: 'Test User',
      email: 'test@test.com',
    };

    const mockPost = {
      _id: 'post1',
      userId: 'user1',
      userName: 'Test User',
      title: 'Test Post',
      description: 'Test description',
      photos: [],
      likes: [],
      comments: [],
    };

    //it('should add post', async () => {
    //  api.createPost.mockResolvedValue(mockPost);
//
    //  const { result } = renderHook(() => useAppContext(), {
    //    wrapper: AppProvider,
    //  });
//
    //  act(() => {
    //    result.current.loginUser(mockUser);
    //  });
//
    //  await waitFor(() => {
    //    expect(result.current.loadingPosts).toBe(false);
    //  });
//
    //  await act(async () => {
    //    await result.current.addPost({
    //      title: 'Test Post',
    //      description: 'Test description',
    //      photos: [],
    //    });
    //  });
//
    //  expect(result.current.posts).toContainEqual(mockPost);
    //});

    it('should delete post', async () => {
      api.fetchPosts.mockResolvedValue([mockPost]);
      api.deletePost.mockResolvedValue({});

      const { result } = renderHook(() => useAppContext(), {
        wrapper: AppProvider,
      });

      act(() => {
        result.current.loginUser(mockUser);
      });

      await waitFor(() => {
        expect(result.current.posts.length).toBe(1);
      });

      await act(async () => {
        await result.current.deletePost('post1');
      });

      expect(result.current.posts).toEqual([]);
    });

    it('should handle delete post error when not logged in', async () => {
      const { result } = renderHook(() => useAppContext(), {
        wrapper: AppProvider,
      });

      await expect(
        act(async () => {
          await result.current.deletePost('post1');
        })
      ).rejects.toThrow('Debes estar logueado para eliminar posts');
    });

    it('should like post', async () => {
      api.fetchPosts.mockResolvedValue([mockPost]);
      api.likePost.mockResolvedValue({});

      const { result } = renderHook(() => useAppContext(), {
        wrapper: AppProvider,
      });

      act(() => {
        result.current.loginUser(mockUser);
      });

      await waitFor(() => {
        expect(result.current.posts.length).toBe(1);
      });

      await act(async () => {
        await result.current.likePost('post1');
      });

      expect(result.current.posts[0].likes).toContain('user1');
    });

    it('should unlike post', async () => {
      const likedPost = { ...mockPost, likes: ['user1'] };
      api.fetchPosts.mockResolvedValue([likedPost]);
      api.unlikePost.mockResolvedValue({});

      const { result } = renderHook(() => useAppContext(), {
        wrapper: AppProvider,
      });

      act(() => {
        result.current.loginUser(mockUser);
      });

      await waitFor(() => {
        expect(result.current.posts[0].likes).toContain('user1');
      });

      await act(async () => {
        await result.current.unlikePost('post1');
      });

      expect(result.current.posts[0].likes).not.toContain('user1');
    });

    it('should add comment to post', async () => {
      const updatedPost = {
        ...mockPost,
        comments: [{ 
          userId: 'user1', 
          userName: 'Test User',
          userProfilePic: '',
          text: 'Great post!' 
        }],
      };
      api.fetchPosts.mockResolvedValue([mockPost]);
      api.addPostComment.mockResolvedValue(updatedPost);

      const { result } = renderHook(() => useAppContext(), {
        wrapper: AppProvider,
      });

      act(() => {
        result.current.loginUser(mockUser);
      });

      await waitFor(() => {
        expect(result.current.posts.length).toBe(1);
      });

      await act(async () => {
        await result.current.addCommentToPost('post1', 'Great post!');
      });

      expect(result.current.posts[0].comments.length).toBe(1);
    });

    it('should delete comment from post', async () => {
      const postWithComment = {
        ...mockPost,
        comments: [{ _id: 'comment1', userId: 'user1', text: 'Test' }],
      };
      api.fetchPosts.mockResolvedValue([postWithComment]);
      api.deletePostComment.mockResolvedValue(mockPost);

      const { result } = renderHook(() => useAppContext(), {
        wrapper: AppProvider,
      });

      act(() => {
        result.current.loginUser(mockUser);
      });

      await waitFor(() => {
        expect(result.current.posts[0].comments.length).toBe(1);
      });

      await act(async () => {
        await result.current.deleteCommentFromPost('post1', 'comment1');
      });

      expect(result.current.posts[0].comments.length).toBe(0);
    });

    it('should handle delete comment error when not logged in', async () => {
      const { result } = renderHook(() => useAppContext(), {
        wrapper: AppProvider,
      });

      await expect(
        act(async () => {
          await result.current.deleteCommentFromPost('post1', 'comment1');
        })
      ).rejects.toThrow('Debes estar logueado para eliminar comentarios');
    });

    it('should not like post when not logged in', async () => {
      const { result } = renderHook(() => useAppContext(), {
        wrapper: AppProvider,
      });

      await act(async () => {
        await result.current.likePost('post1');
      });

      expect(api.likePost).not.toHaveBeenCalled();
    });
  });

  describe('Event Actions', () => {
    it('should add event', () => {
      const { result } = renderHook(() => useAppContext(), {
        wrapper: AppProvider,
      });

      act(() => {
        result.current.addEvent({
          type: 'eclipse',
          date: new Date('2025-12-20'),
          description: 'Solar Eclipse',
          location: { lat: 28.4636, lng: -16.2518 },
        });
      });

      expect(result.current.events.length).toBe(1);
      expect(result.current.events[0].type).toBe('eclipse');
    });

    it('should get upcoming events', () => {
      const { result } = renderHook(() => useAppContext(), {
        wrapper: AppProvider,
      });

      act(() => {
        result.current.addEvent({
          type: 'eclipse',
          date: new Date(Date.now() + 86400000), // Tomorrow
          description: 'Future Eclipse',
          location: { lat: 28.4636, lng: -16.2518 },
        });
      });

      const upcomingEvents = result.current.getUpcomingEvents();
      expect(upcomingEvents.length).toBeGreaterThan(0);
    });
  });

  describe('Configuration Actions', () => {
    it('should update location', () => {
      const { result } = renderHook(() => useAppContext(), {
        wrapper: AppProvider,
      });

      act(() => {
        result.current.updateLocation({ lat: 40.4168, lng: -3.7038 });
      });

      expect(result.current.location).toEqual({ lat: 40.4168, lng: -3.7038 });
      expect(result.current.latitudeState).toBe(40.4168);
      expect(result.current.longitudeState).toBe(-3.7038);
    });

    it('should update selected date', () => {
      const { result } = renderHook(() => useAppContext(), {
        wrapper: AppProvider,
      });

      const newDate = new Date('2025-12-20');

      act(() => {
        result.current.updateSelectedDate(newDate);
      });

      expect(result.current.selectedDate).toEqual(newDate);
    });

    it('should update actual date', () => {
      const { result } = renderHook(() => useAppContext(), {
        wrapper: AppProvider,
      });

      const newDate = new Date('2025-12-20');

      act(() => {
        result.current.updateActualDate(newDate);
      });

      expect(result.current.actualDate.toDate().toDateString()).toBe(
        newDate.toDateString()
      );
    });

    it('should toggle time speed', () => {
      const { result } = renderHook(() => useAppContext(), {
        wrapper: AppProvider,
      });

      expect(result.current.timeSpeed).toBe(1);

      act(() => {
        result.current.toggleTimeSpeed();
      });

      expect(result.current.timeSpeed).toBe(10000);

      act(() => {
        result.current.toggleTimeSpeed();
      });

      expect(result.current.timeSpeed).toBe(1);
    });
  });

  describe('Loading States', () => {
    it('should set loadingImages when fetching photos', async () => {
      api.fetchPhotos.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve([]), 100))
      );

      const { result } = renderHook(() => useAppContext(), {
        wrapper: AppProvider,
      });

      act(() => {
        result.current.loginUser({
          id: 'user1',
          name: 'Test User',
          email: 'test@test.com',
        });
      });

      await waitFor(() => {
        expect(result.current.loadingImages).toBe(false);
      });
    });

    it('should set loadingPosts when fetching posts', async () => {
      api.fetchPosts.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve([]), 100))
      );

      const { result } = renderHook(() => useAppContext(), {
        wrapper: AppProvider,
      });

      act(() => {
        result.current.loginUser({
          id: 'user1',
          name: 'Test User',
          email: 'test@test.com',
        });
      });

      await waitFor(() => {
        expect(result.current.loadingPosts).toBe(false);
      });
    });

    it('should handle error when loading photos', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      api.fetchPhotos.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useAppContext(), {
        wrapper: AppProvider,
      });

      act(() => {
        result.current.loginUser({
          id: 'user1',
          name: 'Test User',
          email: 'test@test.com',
        });
      });

      await waitFor(() => {
        expect(result.current.loadingImages).toBe(false);
        expect(result.current.photos).toEqual([]);
      });

      consoleErrorSpy.mockRestore();
    });

    it('should handle error when loading posts', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      api.fetchPosts.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useAppContext(), {
        wrapper: AppProvider,
      });

      act(() => {
        result.current.loginUser({
          id: 'user1',
          name: 'Test User',
          email: 'test@test.com',
        });
      });

      await waitFor(() => {
        expect(result.current.loadingPosts).toBe(false);
        expect(result.current.posts).toEqual([]);
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Edge Cases', () => {
    it('should handle adding post without user', async () => {
      api.createPost.mockResolvedValue({
        _id: 'post1',
        userId: 1,
        userName: 'Unknown User',
        title: 'Test',
        description: 'Test',
        photos: [],
        likes: [],
        comments: [],
      });

      const { result } = renderHook(() => useAppContext(), {
        wrapper: AppProvider,
      });

      await act(async () => {
        await result.current.addPost({
          title: 'Test',
          description: 'Test',
        });
      });

      expect(result.current.posts.length).toBe(1);
    });

    it('should clear photos when user logs out', async () => {
      api.fetchPhotos.mockResolvedValue([
        { _id: 'photo1', title: 'Test Photo', likes: [], comments: [] },
      ]);

      const { result } = renderHook(() => useAppContext(), {
        wrapper: AppProvider,
      });

      act(() => {
        result.current.loginUser({
          id: 'user1',
          name: 'Test User',
          email: 'test@test.com',
        });
      });

      await waitFor(() => {
        expect(result.current.photos.length).toBe(1);
      });

      act(() => {
        result.current.logoutUser();
      });

      await waitFor(() => {
        expect(result.current.photos).toEqual([]);
      });
    });

    it('should clear posts when user logs out', async () => {
      api.fetchPosts.mockResolvedValue([
        { _id: 'post1', title: 'Test Post', likes: [], comments: [] },
      ]);

      const { result } = renderHook(() => useAppContext(), {
        wrapper: AppProvider,
      });

      act(() => {
        result.current.loginUser({
          id: 'user1',
          name: 'Test User',
          email: 'test@test.com',
        });
      });

      await waitFor(() => {
        expect(result.current.posts.length).toBe(1);
      });

      act(() => {
        result.current.logoutUser();
      });

      await waitFor(() => {
        expect(result.current.posts).toEqual([]);
      });
    });

    it('should not update profile for different user', () => {
      const { result } = renderHook(() => useAppContext(), {
        wrapper: AppProvider,
      });

      act(() => {
        result.current.loginUser({
          id: 'user1',
          name: 'Test User',
          email: 'test@test.com',
          bio: 'Original bio',
        });
      });

      act(() => {
        result.current.updateUserProfile('user2', { bio: 'New bio' });
      });

      expect(result.current.currentUser.bio).toBe('Original bio');
    });

    it('should update location with only lat', () => {
      const { result } = renderHook(() => useAppContext(), {
        wrapper: AppProvider,
      });

      act(() => {
        result.current.updateLocation({ lat: 40.4168 });
      });

      expect(result.current.latitudeState).toBe(40.4168);
    });

    it('should update location with only lng', () => {
      const { result } = renderHook(() => useAppContext(), {
        wrapper: AppProvider,
      });

      act(() => {
        result.current.updateLocation({ lng: -3.7038 });
      });

      expect(result.current.longitudeState).toBe(-3.7038);
    });
  });
});
