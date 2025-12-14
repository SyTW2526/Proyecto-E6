import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Photo } from './Photo';

describe('Photo Model', () => {
  let mockDate;

  beforeEach(() => {
    // Mock Date to have consistent timestamps
    mockDate = new Date('2025-01-15T12:00:00.000Z');
    vi.setSystemTime(mockDate);
  });

  describe('Constructor', () => {
    it('should create a Photo instance with all basic properties', () => {
      const photo = new Photo(
        '123',
        'user1',
        'http://example.com/image.jpg',
        'Sunset Photo',
        'Beautiful sunset',
        0.75,
        '2025-01-15T12:00:00.000Z',
        { lat: 40.4168, lng: -3.7038 }
      );

      expect(photo.id).toBe('123');
      expect(photo.userId).toBe('user1');
      expect(photo.imageUrl).toBe('http://example.com/image.jpg');
      expect(photo.title).toBe('Sunset Photo');
      expect(photo.description).toBe('Beautiful sunset');
      expect(photo.moonPhase).toBe(0.75);
      expect(photo.date).toBe('2025-01-15T12:00:00.000Z');
      expect(photo.location).toEqual({ lat: 40.4168, lng: -3.7038 });
    });

    it('should initialize with empty likes and comments arrays', () => {
      const photo = new Photo('123', 'user1', 'url', 'title', 'desc');

      expect(photo.likes).toEqual([]);
      expect(photo.comments).toEqual([]);
    });

    it('should initialize with default metadata structure', () => {
      const photo = new Photo('123', 'user1', 'url', 'title', 'desc');

      expect(photo.metadata).toEqual({
        camera: '',
        lens: '',
        iso: '',
        exposure: '',
        aperture: ''
      });
    });

    it('should set date to current date if not provided', () => {
      const photo = new Photo('123', 'user1', 'url', 'title', 'desc');

      expect(photo.date).toBe('2025-01-15T12:00:00.000Z');
    });

    it('should set createdAt to current date', () => {
      const photo = new Photo('123', 'user1', 'url', 'title', 'desc');

      expect(photo.createdAt).toBe('2025-01-15T12:00:00.000Z');
    });

    it('should handle null moonPhase', () => {
      const photo = new Photo('123', 'user1', 'url', 'title', 'desc', null);

      expect(photo.moonPhase).toBeNull();
    });

    it('should handle null location', () => {
      const photo = new Photo('123', 'user1', 'url', 'title', 'desc', null, null, null);

      expect(photo.location).toBeNull();
    });
  });

  describe('fromDialogData', () => {
    it('should create Photo from dialog data', () => {
      const imageData = {
        preview: 'data:image/png;base64,iVBORw0KG...',
        title: 'Moon Photo',
        description: 'Full moon capture',
        moonPhase: 0.98,
        location: { lat: 28.2916, lng: -16.6291 },
        metadata: {
          camera: 'Canon EOS R5',
          lens: '100-400mm',
          iso: '1600',
          exposure: '1/250',
          aperture: 'f/5.6'
        }
      };

      const photo = Photo.fromDialogData(imageData, 'user123');

      expect(photo.userId).toBe('user123');
      expect(photo.imageUrl).toBe('data:image/png;base64,iVBORw0KG...');
      expect(photo.title).toBe('Moon Photo');
      expect(photo.description).toBe('Full moon capture');
      expect(photo.moonPhase).toBe(0.98);
      expect(photo.location).toEqual({ lat: 28.2916, lng: -16.6291 });
      expect(photo.metadata).toEqual({
        camera: 'Canon EOS R5',
        lens: '100-400mm',
        iso: '1600',
        exposure: '1/250',
        aperture: 'f/5.6'
      });
    });

    it('should generate unique ID based on timestamp', () => {
      const imageData = {
        preview: 'url',
        title: 'Title',
        description: 'Desc'
      };

      const photo1 = Photo.fromDialogData(imageData, 'user1');
      
      // Advance time slightly
      vi.setSystemTime(new Date('2025-01-15T12:00:01.000Z'));
      
      const photo2 = Photo.fromDialogData(imageData, 'user1');

      expect(photo1.id).not.toBe(photo2.id);
    });

    it('should handle missing metadata', () => {
      const imageData = {
        preview: 'url',
        title: 'Title',
        description: 'Desc'
      };

      const photo = Photo.fromDialogData(imageData, 'user1');

      expect(photo.metadata).toEqual({
        camera: '',
        lens: '',
        iso: '',
        exposure: '',
        aperture: ''
      });
    });

    it('should handle partial metadata', () => {
      const imageData = {
        preview: 'url',
        title: 'Title',
        description: 'Desc',
        metadata: {
          camera: 'Nikon D850',
          iso: '800'
        }
      };

      const photo = Photo.fromDialogData(imageData, 'user1');

      expect(photo.metadata).toEqual({
        camera: 'Nikon D850',
        iso: '800'
      });
    });
  });

  describe('fromServerData', () => {
    it('should create Photo from server data', () => {
      const serverData = {
        id: 'server123',
        userId: 'user456',
        imageUrl: 'https://server.com/image.jpg',
        title: 'Galaxy Photo',
        description: 'Milky Way',
        moonPhase: 0.25,
        date: '2025-01-10T20:00:00.000Z',
        location: { lat: 40.0, lng: -3.0 },
        likes: ['user1', 'user2', 'user3'],
        comments: [
          { userId: 'user1', text: 'Amazing!' },
          { userId: 'user2', text: 'Beautiful!' }
        ],
        metadata: {
          camera: 'Sony A7III',
          lens: '24mm',
          iso: '3200',
          exposure: '30s',
          aperture: 'f/2.8'
        },
        createdAt: '2025-01-10T20:00:00.000Z'
      };

      const photo = Photo.fromServerData(serverData);

      expect(photo.id).toBe('server123');
      expect(photo.userId).toBe('user456');
      expect(photo.imageUrl).toBe('https://server.com/image.jpg');
      expect(photo.title).toBe('Galaxy Photo');
      expect(photo.description).toBe('Milky Way');
      expect(photo.moonPhase).toBe(0.25);
      expect(photo.date).toBe('2025-01-10T20:00:00.000Z');
      expect(photo.location).toEqual({ lat: 40.0, lng: -3.0 });
      expect(photo.likes).toEqual(['user1', 'user2', 'user3']);
      expect(photo.comments).toHaveLength(2);
      expect(photo.metadata.camera).toBe('Sony A7III');
      expect(photo.createdAt).toBe('2025-01-10T20:00:00.000Z');
    });

    it('should handle missing likes array', () => {
      const serverData = {
        id: '1',
        userId: 'user1',
        imageUrl: 'url',
        title: 'Title',
        description: 'Desc'
      };

      const photo = Photo.fromServerData(serverData);

      expect(photo.likes).toEqual([]);
    });

    it('should handle missing comments array', () => {
      const serverData = {
        id: '1',
        userId: 'user1',
        imageUrl: 'url',
        title: 'Title',
        description: 'Desc'
      };

      const photo = Photo.fromServerData(serverData);

      expect(photo.comments).toEqual([]);
    });

    it('should handle missing metadata', () => {
      const serverData = {
        id: '1',
        userId: 'user1',
        imageUrl: 'url',
        title: 'Title',
        description: 'Desc'
      };

      const photo = Photo.fromServerData(serverData);

      expect(photo.metadata).toEqual({
        camera: '',
        lens: '',
        iso: '',
        exposure: '',
        aperture: ''
      });
    });
  });

  describe('addLike', () => {
    it('should add a like from a user', () => {
      const photo = new Photo('1', 'user1', 'url', 'title', 'desc');

      photo.addLike('user2');

      expect(photo.likes).toEqual(['user2']);
    });

    it('should add multiple likes from different users', () => {
      const photo = new Photo('1', 'user1', 'url', 'title', 'desc');

      photo.addLike('user2');
      photo.addLike('user3');
      photo.addLike('user4');

      expect(photo.likes).toEqual(['user2', 'user3', 'user4']);
    });

    it('should not add duplicate likes from the same user', () => {
      const photo = new Photo('1', 'user1', 'url', 'title', 'desc');

      photo.addLike('user2');
      photo.addLike('user2');
      photo.addLike('user2');

      expect(photo.likes).toEqual(['user2']);
    });
  });

  describe('removeLike', () => {
    it('should remove a like from a user', () => {
      const photo = new Photo('1', 'user1', 'url', 'title', 'desc');
      photo.likes = ['user2', 'user3', 'user4'];

      photo.removeLike('user3');

      expect(photo.likes).toEqual(['user2', 'user4']);
    });

    it('should handle removing non-existent like', () => {
      const photo = new Photo('1', 'user1', 'url', 'title', 'desc');
      photo.likes = ['user2', 'user3'];

      photo.removeLike('user999');

      expect(photo.likes).toEqual(['user2', 'user3']);
    });

    it('should handle removing from empty likes array', () => {
      const photo = new Photo('1', 'user1', 'url', 'title', 'desc');

      photo.removeLike('user2');

      expect(photo.likes).toEqual([]);
    });
  });

  describe('addComment', () => {
    it('should add a comment', () => {
      const photo = new Photo('1', 'user1', 'url', 'title', 'desc');
      const comment = { userId: 'user2', text: 'Great photo!' };

      photo.addComment(comment);

      expect(photo.comments).toHaveLength(1);
      expect(photo.comments[0]).toEqual(comment);
    });

    it('should add multiple comments', () => {
      const photo = new Photo('1', 'user1', 'url', 'title', 'desc');
      const comment1 = { userId: 'user2', text: 'Great!' };
      const comment2 = { userId: 'user3', text: 'Amazing!' };
      const comment3 = { userId: 'user4', text: 'Beautiful!' };

      photo.addComment(comment1);
      photo.addComment(comment2);
      photo.addComment(comment3);

      expect(photo.comments).toHaveLength(3);
      expect(photo.comments).toEqual([comment1, comment2, comment3]);
    });
  });

  describe('getLikesCount', () => {
    it('should return 0 for no likes', () => {
      const photo = new Photo('1', 'user1', 'url', 'title', 'desc');

      expect(photo.getLikesCount()).toBe(0);
    });

    it('should return correct count of likes', () => {
      const photo = new Photo('1', 'user1', 'url', 'title', 'desc');
      photo.likes = ['user2', 'user3', 'user4', 'user5'];

      expect(photo.getLikesCount()).toBe(4);
    });
  });

  describe('getCommentsCount', () => {
    it('should return 0 for no comments', () => {
      const photo = new Photo('1', 'user1', 'url', 'title', 'desc');

      expect(photo.getCommentsCount()).toBe(0);
    });

    it('should return correct count of comments', () => {
      const photo = new Photo('1', 'user1', 'url', 'title', 'desc');
      photo.comments = [
        { userId: 'user2', text: 'Comment 1' },
        { userId: 'user3', text: 'Comment 2' },
        { userId: 'user4', text: 'Comment 3' }
      ];

      expect(photo.getCommentsCount()).toBe(3);
    });
  });

  describe('toJSON', () => {
    it('should convert Photo to JSON object with all properties', () => {
      const photo = new Photo(
        '123',
        'user1',
        'http://example.com/image.jpg',
        'Moon Photo',
        'Beautiful moon',
        0.85,
        '2025-01-15T12:00:00.000Z',
        { lat: 40.0, lng: -3.0 }
      );
      photo.likes = ['user2', 'user3'];
      photo.comments = [{ userId: 'user2', text: 'Nice!' }];
      photo.metadata = {
        camera: 'Canon',
        lens: '200mm',
        iso: '800',
        exposure: '1/500',
        aperture: 'f/4'
      };

      const json = photo.toJSON();

      expect(json).toEqual({
        id: '123',
        userId: 'user1',
        imageUrl: 'http://example.com/image.jpg',
        title: 'Moon Photo',
        description: 'Beautiful moon',
        moonPhase: 0.85,
        date: '2025-01-15T12:00:00.000Z',
        location: { lat: 40.0, lng: -3.0 },
        likes: ['user2', 'user3'],
        comments: [{ userId: 'user2', text: 'Nice!' }],
        metadata: {
          camera: 'Canon',
          lens: '200mm',
          iso: '800',
          exposure: '1/500',
          aperture: 'f/4'
        },
        createdAt: '2025-01-15T12:00:00.000Z'
      });
    });

    it('should be serializable to JSON string', () => {
      const photo = new Photo('1', 'user1', 'url', 'title', 'desc');

      expect(() => JSON.stringify(photo)).not.toThrow();
      const jsonString = JSON.stringify(photo);
      const parsed = JSON.parse(jsonString);

      expect(parsed.id).toBe('1');
      expect(parsed.userId).toBe('user1');
      expect(parsed.title).toBe('title');
    });
  });

  describe('setMetadata', () => {
    it('should set metadata properties', () => {
      const photo = new Photo('1', 'user1', 'url', 'title', 'desc');

      photo.setMetadata({
        camera: 'Nikon D850',
        lens: '50mm',
        iso: '1600'
      });

      expect(photo.metadata.camera).toBe('Nikon D850');
      expect(photo.metadata.lens).toBe('50mm');
      expect(photo.metadata.iso).toBe('1600');
    });

    it('should merge with existing metadata', () => {
      const photo = new Photo('1', 'user1', 'url', 'title', 'desc');
      photo.metadata = {
        camera: 'Canon',
        lens: '24mm',
        iso: '',
        exposure: '',
        aperture: ''
      };

      photo.setMetadata({
        iso: '3200',
        exposure: '1/100'
      });

      expect(photo.metadata).toEqual({
        camera: 'Canon',
        lens: '24mm',
        iso: '3200',
        exposure: '1/100',
        aperture: ''
      });
    });

    it('should overwrite existing metadata properties', () => {
      const photo = new Photo('1', 'user1', 'url', 'title', 'desc');
      photo.metadata = {
        camera: 'Old Camera',
        lens: 'Old Lens',
        iso: '100',
        exposure: '1/60',
        aperture: 'f/2.8'
      };

      photo.setMetadata({
        camera: 'New Camera',
        lens: 'New Lens'
      });

      expect(photo.metadata.camera).toBe('New Camera');
      expect(photo.metadata.lens).toBe('New Lens');
      expect(photo.metadata.iso).toBe('100');
    });
  });

  describe('update', () => {
    it('should update title', () => {
      const photo = new Photo('1', 'user1', 'url', 'Old Title', 'desc');

      photo.update({ title: 'New Title' });

      expect(photo.title).toBe('New Title');
    });

    it('should update description', () => {
      const photo = new Photo('1', 'user1', 'url', 'title', 'Old Desc');

      photo.update({ description: 'New Description' });

      expect(photo.description).toBe('New Description');
    });

    it('should update moonPhase', () => {
      const photo = new Photo('1', 'user1', 'url', 'title', 'desc', 0.5);

      photo.update({ moonPhase: 0.75 });

      expect(photo.moonPhase).toBe(0.75);
    });

    it('should update location', () => {
      const photo = new Photo('1', 'user1', 'url', 'title', 'desc', null, null, { lat: 10, lng: 20 });

      photo.update({ location: { lat: 40.4168, lng: -3.7038 } });

      expect(photo.location).toEqual({ lat: 40.4168, lng: -3.7038 });
    });

    it('should update multiple properties at once', () => {
      const photo = new Photo('1', 'user1', 'url', 'Old Title', 'Old Desc', 0.3);

      photo.update({
        title: 'New Title',
        description: 'New Description',
        moonPhase: 0.9
      });

      expect(photo.title).toBe('New Title');
      expect(photo.description).toBe('New Description');
      expect(photo.moonPhase).toBe(0.9);
    });

    it('should not update properties with undefined values', () => {
      const photo = new Photo('1', 'user1', 'url', 'Original Title', 'Original Desc', 0.5);

      photo.update({
        title: undefined,
        description: undefined
      });

      expect(photo.title).toBe('Original Title');
      expect(photo.description).toBe('Original Desc');
    });

    it('should handle empty update object', () => {
      const photo = new Photo('1', 'user1', 'url', 'Title', 'Desc', 0.5);
      const originalTitle = photo.title;
      const originalDesc = photo.description;

      photo.update({});

      expect(photo.title).toBe(originalTitle);
      expect(photo.description).toBe(originalDesc);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete workflow: create, add likes, add comments, update', () => {
      // Create photo from dialog data
      const imageData = {
        preview: 'base64data',
        title: 'Moon Shot',
        description: 'First quarter moon',
        moonPhase: 0.25,
        location: { lat: 40.0, lng: -3.0 },
        metadata: { camera: 'Canon', iso: '800' }
      };

      const photo = Photo.fromDialogData(imageData, 'user1');

      // Add likes
      photo.addLike('user2');
      photo.addLike('user3');
      photo.addLike('user4');

      // Add comments
      photo.addComment({ userId: 'user2', text: 'Amazing!' });
      photo.addComment({ userId: 'user3', text: 'Beautiful!' });

      // Update photo
      photo.update({ 
        title: 'Updated Moon Shot',
        description: 'Updated description'
      });

      // Update metadata
      photo.setMetadata({ exposure: '1/250', aperture: 'f/5.6' });

      // Verify final state
      expect(photo.title).toBe('Updated Moon Shot');
      expect(photo.description).toBe('Updated description');
      expect(photo.getLikesCount()).toBe(3);
      expect(photo.getCommentsCount()).toBe(2);
      expect(photo.metadata.camera).toBe('Canon');
      expect(photo.metadata.exposure).toBe('1/250');

      // Convert to JSON
      const json = photo.toJSON();
      expect(json.likes).toHaveLength(3);
      expect(json.comments).toHaveLength(2);
    });

    it('should properly round-trip through server data', () => {
      // Create photo
      const originalPhoto = new Photo(
        'photo123',
        'user1',
        'url',
        'Title',
        'Description',
        0.75,
        '2025-01-15T12:00:00.000Z',
        { lat: 40.0, lng: -3.0 }
      );
      originalPhoto.addLike('user2');
      originalPhoto.addComment({ userId: 'user2', text: 'Comment' });
      originalPhoto.setMetadata({ camera: 'Canon' });

      // Convert to JSON (simulating server save)
      const json = originalPhoto.toJSON();

      // Recreate from server data
      const restoredPhoto = Photo.fromServerData(json);

      // Verify all data is preserved
      expect(restoredPhoto.id).toBe(originalPhoto.id);
      expect(restoredPhoto.userId).toBe(originalPhoto.userId);
      expect(restoredPhoto.title).toBe(originalPhoto.title);
      expect(restoredPhoto.description).toBe(originalPhoto.description);
      expect(restoredPhoto.moonPhase).toBe(originalPhoto.moonPhase);
      expect(restoredPhoto.getLikesCount()).toBe(originalPhoto.getLikesCount());
      expect(restoredPhoto.getCommentsCount()).toBe(originalPhoto.getCommentsCount());
      expect(restoredPhoto.metadata.camera).toBe(originalPhoto.metadata.camera);
    });
  });
});
