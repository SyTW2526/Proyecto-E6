import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  fetchPhotos,
  createPhoto,
  updatePhoto,
  deletePhoto,
  likePhoto,
  unlikePhoto,
  addComment,
  fetchPosts,
  fetchUserPosts,
  createPost,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  addPostComment,
  deletePostComment,
} from './api';

// Mock global fetch
global.fetch = vi.fn();

describe('API Service - Photos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock console.error to avoid cluttering test output
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('fetchPhotos', () => {
    it('should fetch photos for a user successfully', async () => {
      const mockPhotos = [
        { _id: '1', title: 'Photo 1', userId: 'user1' },
        { _id: '2', title: 'Photo 2', userId: 'user1' },
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPhotos,
      });

      const result = await fetchPhotos('user1');

      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/photos/user/user1');
      expect(result).toEqual(mockPhotos);
    });

    it('should throw error when fetch fails', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(fetchPhotos('user1')).rejects.toThrow('Error al obtener fotos');
    });

    it('should handle network errors', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(fetchPhotos('user1')).rejects.toThrow('Network error');
    });
  });

  describe('createPhoto', () => {
    it('should create a photo successfully', async () => {
      const photoData = {
        title: 'New Photo',
        userId: 'user1',
        imageUrl: 'http://example.com/photo.jpg',
      };

      const mockResponse = { _id: '1', ...photoData };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await createPhoto(photoData);

      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/photos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(photoData),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when create fails', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(createPhoto({})).rejects.toThrow('Error al crear foto');
    });
  });

  describe('updatePhoto', () => {
    it('should update a photo successfully', async () => {
      const photoId = 'photo1';
      const photoData = { title: 'Updated Photo' };
      const mockResponse = { _id: photoId, ...photoData };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await updatePhoto(photoId, photoData);

      expect(fetch).toHaveBeenCalledWith(`http://localhost:5000/api/photos/${photoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(photoData),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when update fails', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(updatePhoto('photo1', {})).rejects.toThrow('Error al actualizar foto');
    });
  });

  describe('deletePhoto', () => {
    it('should delete a photo successfully', async () => {
      const photoId = 'photo1';
      const userId = 'user1';
      const mockResponse = { message: 'Photo deleted' };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await deletePhoto(photoId, userId);

      expect(fetch).toHaveBeenCalledWith(
        `http://localhost:5000/api/photos/${photoId}?userId=${userId}`,
        { method: 'DELETE' }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when delete fails', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Unauthorized' }),
      });

      await expect(deletePhoto('photo1', 'user1')).rejects.toThrow('Unauthorized');
    });

    it('should throw default error message when no message provided', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      });

      await expect(deletePhoto('photo1', 'user1')).rejects.toThrow('Error al eliminar foto');
    });
  });

  describe('likePhoto', () => {
    it('should like a photo successfully', async () => {
      const photoId = 'photo1';
      const userId = 'user1';
      const mockResponse = { likes: ['user1'] };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await likePhoto(photoId, userId);

      expect(fetch).toHaveBeenCalledWith(`http://localhost:5000/api/photos/${photoId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when like fails', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(likePhoto('photo1', 'user1')).rejects.toThrow('Error al dar like');
    });
  });

  describe('unlikePhoto', () => {
    it('should unlike a photo successfully', async () => {
      const photoId = 'photo1';
      const userId = 'user1';
      const mockResponse = { likes: [] };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await unlikePhoto(photoId, userId);

      expect(fetch).toHaveBeenCalledWith(
        `http://localhost:5000/api/photos/${photoId}/like/${userId}`,
        { method: 'DELETE' }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when unlike fails', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(unlikePhoto('photo1', 'user1')).rejects.toThrow('Error al quitar like');
    });
  });

  describe('addComment', () => {
    it('should add a comment to a photo successfully', async () => {
      const photoId = 'photo1';
      const userId = 'user1';
      const text = 'Great photo!';
      const mockResponse = {
        comments: [{ userId, text, date: new Date() }],
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await addComment(photoId, userId, text);

      expect(fetch).toHaveBeenCalledWith(`http://localhost:5000/api/photos/${photoId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, text }),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when adding comment fails', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(addComment('photo1', 'user1', 'text')).rejects.toThrow('Error al agregar comentario');
    });
  });
});

describe('API Service - Posts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('fetchPosts', () => {
    it('should fetch all posts successfully', async () => {
      const mockPosts = [
        { _id: '1', title: 'Post 1', userId: 'user1' },
        { _id: '2', title: 'Post 2', userId: 'user2' },
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPosts,
      });

      const result = await fetchPosts();

      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/posts');
      expect(result).toEqual(mockPosts);
    });

    it('should throw error when fetch fails', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(fetchPosts()).rejects.toThrow('Error al obtener posts');
    });
  });

  describe('fetchUserPosts', () => {
    it('should fetch posts for a specific user successfully', async () => {
      const userId = 'user1';
      const mockPosts = [
        { _id: '1', title: 'Post 1', userId: 'user1' },
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPosts,
      });

      const result = await fetchUserPosts(userId);

      expect(fetch).toHaveBeenCalledWith(`http://localhost:5000/api/posts/user/${userId}`);
      expect(result).toEqual(mockPosts);
    });

    it('should throw error when fetch fails', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(fetchUserPosts('user1')).rejects.toThrow('Error al obtener posts del usuario');
    });
  });

  describe('createPost', () => {
    it('should create a post successfully', async () => {
      const postData = {
        title: 'New Post',
        description: 'Description',
        userId: 'user1',
      };

      const mockResponse = { _id: '1', ...postData };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await createPost(postData);

      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when create fails', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(createPost({})).rejects.toThrow('Error al crear post');
    });
  });

  describe('updatePost', () => {
    it('should update a post successfully', async () => {
      const postId = 'post1';
      const postData = { title: 'Updated Post' };
      const mockResponse = { _id: postId, ...postData };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await updatePost(postId, postData);

      expect(fetch).toHaveBeenCalledWith(`http://localhost:5000/api/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when update fails', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(updatePost('post1', {})).rejects.toThrow('Error al actualizar post');
    });
  });

  describe('deletePost', () => {
    it('should delete a post successfully', async () => {
      const postId = 'post1';
      const userId = 'user1';
      const mockResponse = { message: 'Post deleted' };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await deletePost(postId, userId);

      expect(fetch).toHaveBeenCalledWith(
        `http://localhost:5000/api/posts/${postId}?userId=${userId}`,
        { method: 'DELETE' }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when delete fails', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Unauthorized' }),
      });

      await expect(deletePost('post1', 'user1')).rejects.toThrow('Unauthorized');
    });

    it('should throw default error message when no message provided', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      });

      await expect(deletePost('post1', 'user1')).rejects.toThrow('Error al eliminar post');
    });
  });

  describe('likePost', () => {
    it('should like a post successfully', async () => {
      const postId = 'post1';
      const userId = 'user1';
      const mockResponse = { likes: ['user1'] };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await likePost(postId, userId);

      expect(fetch).toHaveBeenCalledWith(`http://localhost:5000/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when like fails', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(likePost('post1', 'user1')).rejects.toThrow('Error al dar like al post');
    });
  });

  describe('unlikePost', () => {
    it('should unlike a post successfully', async () => {
      const postId = 'post1';
      const userId = 'user1';
      const mockResponse = { likes: [] };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await unlikePost(postId, userId);

      expect(fetch).toHaveBeenCalledWith(
        `http://localhost:5000/api/posts/${postId}/like/${userId}`,
        { method: 'DELETE' }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when unlike fails', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(unlikePost('post1', 'user1')).rejects.toThrow('Error al quitar like del post');
    });
  });

  describe('addPostComment', () => {
    it('should add a comment to a post successfully', async () => {
      const postId = 'post1';
      const userId = 'user1';
      const userName = 'User One';
      const userProfilePic = 'http://example.com/profile.jpg';
      const text = 'Great post!';
      const mockResponse = {
        comments: [{ userId, userName, userProfilePic, text, date: new Date() }],
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await addPostComment(postId, userId, userName, userProfilePic, text);

      expect(fetch).toHaveBeenCalledWith(`http://localhost:5000/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, userName, userProfilePic, text }),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when adding comment fails', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(
        addPostComment('post1', 'user1', 'User', 'pic.jpg', 'text')
      ).rejects.toThrow('Error al agregar comentario al post');
    });
  });

  describe('deletePostComment', () => {
    it('should delete a comment from a post successfully', async () => {
      const postId = 'post1';
      const commentId = 'comment1';
      const userId = 'user1';
      const mockResponse = { message: 'Comment deleted' };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await deletePostComment(postId, commentId, userId);

      expect(fetch).toHaveBeenCalledWith(
        `http://localhost:5000/api/posts/${postId}/comment/${commentId}?userId=${userId}`,
        { method: 'DELETE' }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when delete comment fails', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Unauthorized' }),
      });

      await expect(deletePostComment('post1', 'comment1', 'user1')).rejects.toThrow('Unauthorized');
    });

    it('should throw default error message when no message provided', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      });

      await expect(deletePostComment('post1', 'comment1', 'user1')).rejects.toThrow(
        'Error al eliminar comentario'
      );
    });
  });
});

describe('API Service - Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should log errors to console', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error');
    const error = new Error('Test error');
    
    global.fetch.mockRejectedValueOnce(error);

    await expect(fetchPhotos('user1')).rejects.toThrow();
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error:', error);
  });

  it('should handle JSON parsing errors', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => {
        throw new Error('Invalid JSON');
      },
    });

    await expect(fetchPhotos('user1')).rejects.toThrow('Invalid JSON');
  });
});
