export class Photo {
  constructor(id, userId, imageUrl, title, description, moonPhase = null, date = null, location = null) {
    this.id = id;
    this.userId = userId;
    this.imageUrl = imageUrl; // URL de la imagen (puede ser base64 o URL del servidor)
    this.title = title; // Título de la imagen
    this.description = description; // Descripción de la imagen
    this.moonPhase = moonPhase; // porcentaje de iluminación (opcional)
    this.date = date || new Date().toISOString(); // Fecha de creación
    this.location = location; // {lat, lng} (opcional)
    this.likes = [];
    this.comments = [];
    this.metadata = {
      camera: '',
      lens: '',
      iso: '',
      exposure: '',
      aperture: ''
    };
    this.createdAt = new Date().toISOString(); // Timestamp de creación
  }

  // Método estático para crear una Photo desde los datos del AddImageDialog
  static fromDialogData(imageData, userId) {
    const photo = new Photo(
      Date.now(), // ID único basado en timestamp
      userId,
      imageData.preview, // La imagen en base64
      imageData.title,
      imageData.description,
      imageData.moonPhase, // Fase lunar desde el diálogo
      new Date().toISOString(),
      imageData.location // Ubicación desde el diálogo
    );
    
    // Asignar metadata si existe
    if (imageData.metadata) {
      photo.metadata = imageData.metadata;
    }
    
    return photo;
  }

  // Método estático para crear desde datos del servidor
  static fromServerData(data) {
    const photo = new Photo(
      data.id,
      data.userId,
      data.imageUrl,
      data.title,
      data.description,
      data.moonPhase,
      data.date,
      data.location
    );
    photo.likes = data.likes || [];
    photo.comments = data.comments || [];
    photo.metadata = data.metadata || photo.metadata;
    photo.createdAt = data.createdAt;
    return photo;
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

  getCommentsCount() {
    return this.comments.length;
  }

  // Convertir a objeto simple para guardar o enviar al servidor
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      imageUrl: this.imageUrl,
      title: this.title,
      description: this.description,
      moonPhase: this.moonPhase,
      date: this.date,
      location: this.location,
      likes: this.likes,
      comments: this.comments,
      metadata: this.metadata,
      createdAt: this.createdAt
    };
  }

  // Actualizar metadata de la foto
  setMetadata(metadata) {
    this.metadata = { ...this.metadata, ...metadata };
  }

  // Actualizar información básica
  update(updates) {
    if (updates.title !== undefined) this.title = updates.title;
    if (updates.description !== undefined) this.description = updates.description;
    if (updates.moonPhase !== undefined) this.moonPhase = updates.moonPhase;
    if (updates.location !== undefined) this.location = updates.location;
  }
}