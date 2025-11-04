export class AstronomicalEvent {
  constructor(id, type, date, description, location = null) {
    this.id = id;
    this.type = type; // 'eclipse', 'supermoon', 'meteor_shower', etc.
    this.date = date;
    this.description = description;
    this.location = location; // puede ser null si es visible desde todas partes
    this.visibility = "global"; // 'global' o 'regional'
  }

  isUpcoming() {
    return new Date(this.date) > new Date();
  }

  isPast() {
    return new Date(this.date) < new Date();
  }
}
