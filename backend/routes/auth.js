import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// ======================
// RUTA: REGISTRO (Sign Up)
// ======================
// POST /api/auth/signup
// Crea un nuevo usuario en la base de datos
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Validar que lleguen todos los datos
    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Por favor proporciona nombre, email y contraseña",
      });
    }

    // 2. Verificar si el email ya está registrado
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        error: "Este email ya está registrado",
      });
    }

    // 3. Crear nuevo usuario
    // El middleware 'pre save' del modelo hasheará automáticamente la contraseña
    const user = new User({
      name,
      email: email.toLowerCase(),
      password, // Se hasheará automáticamente
      profilePic: "https://via.placeholder.com/150",
      bio: "",
    });

    // 4. Guardar en MongoDB
    await user.save();

    // 5. Generar token JWT
    // Este token se usa para mantener la sesión sin enviar la contraseña cada vez
    const token = jwt.sign(
      { userId: user._id }, // Payload: información a encriptar
      process.env.JWT_SECRET || "clave_temporal", // Clave secreta
      { expiresIn: "7d" } // Expira en 7 días
    );

    // 6. Preparar respuesta (sin contraseña)
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      profilePic: user.profilePic,
      bio: user.bio,
      followers: user.followers,
      following: user.following,
      photos: user.photos,
    };

    // 7. Enviar respuesta exitosa
    res.status(201).json({
      message: "Usuario creado exitosamente",
      user: userResponse,
      token,
    });
  } catch (error) {
    console.error("Error en signup:", error);

    // Manejar errores de validación de Mongoose
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ error: messages.join(", ") });
    }

    res.status(500).json({
      error: "Error al crear usuario. Intenta nuevamente.",
    });
  }
});

// ======================
// RUTA: LOGIN (Iniciar Sesión)
// ======================
// POST /api/auth/login
// Valida credenciales y devuelve token
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validar que lleguen los datos
    if (!email || !password) {
      return res.status(400).json({
        error: "Por favor proporciona email y contraseña",
      });
    }

    // 2. Buscar usuario por email
    // +password indica que queremos traer el campo password (normalmente oculto)
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );

    if (!user) {
      return res.status(401).json({
        error: "Email o contraseña incorrectos",
      });
    }

    // 3. Verificar contraseña
    // comparePassword es un método que definimos en el modelo
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: "Email o contraseña incorrectos",
      });
    }

    // 4. Generar token JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "tu_secreto_temporal",
      { expiresIn: "7d" }
    );

    // 5. Preparar respuesta (sin contraseña)
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      profilePic: user.profilePic,
      bio: user.bio,
      followers: user.followers,
      following: user.following,
      photos: user.photos,
    };

    // 6. Enviar respuesta exitosa
    res.status(200).json({
      message: "Login exitoso",
      user: userResponse,
      token,
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({
      error: "Error al iniciar sesión. Intenta nuevamente.",
    });
  }
});

// ======================
// RUTA: OBTENER USUARIO ACTUAL
// ======================
// GET /api/auth/me
// Devuelve información del usuario autenticado
router.get("/me", async (req, res) => {
  try {
    // 1. Obtener token del header
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        error: "No autorizado. Token no proporcionado.",
      });
    }

    // 2. Verificar y decodificar token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "tu_secreto_temporal"
    );

    // 3. Buscar usuario
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({
        error: "Usuario no encontrado",
      });
    }

    // 4. Enviar respuesta
    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
        bio: user.bio,
        followers: user.followers,
        following: user.following,
        photos: user.photos,
      },
    });
  } catch (error) {
    console.error("Error en /me:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Token inválido" });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expirado" });
    }

    res.status(500).json({
      error: "Error al obtener información del usuario",
    });
  }
});

export default router;
