import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

// Esquema de Usuario para MongoDB
const userSchema = new mongoose.Schema({
  // Nombre completo del usuario
  name: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true,
    minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
    maxlength: [50, 'El nombre no puede exceder 50 caracteres']
  },
  
  // Email único como identificador principal
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Por favor ingresa un email válido']
  },
  
  // Contraseña hasheada (NUNCA se guarda en texto plano)
  password: {
    type: String,
    required: [true, 'La contraseña es requerida'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    select: false // No devolver la contraseña en las consultas por defecto
  },
  
  // Foto de perfil (URL o base64)
  profilePic: {
    type: String,
    default: 'https://via.placeholder.com/150'
  },
  
  // Biografía del usuario
  bio: {
    type: String,
    maxlength: [200, 'La biografía no puede exceder 200 caracteres'],
    default: ''
  },
  
  // Arrays de IDs de usuarios que sigue y lo siguen
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Array de IDs de fotos del usuario
  photos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Photo'
  }],
  
  // Fecha de creación y actualización automáticas
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // Añade createdAt y updatedAt automáticamente
});

// MIDDLEWARE: Hashear contraseña antes de guardar
// Se ejecuta automáticamente antes de crear o actualizar un usuario
userSchema.pre('save', async function(next) {
  // Solo hashear si la contraseña fue modificada
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    // Generar salt (aleatoriedad) y hashear
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// MÉTODO: Comparar contraseña ingresada con la hasheada
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    // bcrypt.compare() verifica si la contraseña coincide con el hash
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// MÉTODO: Obtener objeto de usuario sin información sensible
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  // Eliminar campos sensibles antes de enviar al cliente
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

const User = mongoose.model('User', userSchema);

export default User;
