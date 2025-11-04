export class User {
  constructor(id, name, email, profilePic, bio = "") {
    this.id = id;
    this.name = name;
    this.email = email;
    this.profilePic = profilePic;
    this.bio = bio;
    this.photos = [];
    this.followers = [];
    this.following = [];
  }

  addPhoto(photo) {
    this.photos.push(photo);
  }

  getPhotoCount() {
    return this.photos.length;
  }
}
