export class Photo {
  constructor(id, userId, imageUrl, moonPhase, date, location) {
    this.id = id;
    this.userId = userId;
    this.imageUrl = imageUrl;
    this.moonPhase = moonPhase; // porcentaje de iluminación
    this.date = date;
    this.location = location; // {lat, lng}
    this.likes = [];
    this.comments = [];
    this.metadata = {
      camera: '',
      lens: '',
      iso: '',
      exposure: '',
      aperture: ''
    };
  }

  addLike(userId) {
    if (!this.likes.includes(userId)) {
      this.likes.push(userId);
    }
  }

  removeLike(userId) {
    this.likes = this.likes.filter(id => id !== userId);
  }

  addComment(comment) {
    this.comments.push(comment);
  }

  getLikesCount() {
    return this.likes.length;
  }
}