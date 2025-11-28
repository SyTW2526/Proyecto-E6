import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        error: "No autorizado. Token no proporcionado.",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "tu_secreto_temporal"
    );

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({
        error: "Usuario no encontrado",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error en autenticación:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Token inválido" });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expirado" });
    }

    res.status(500).json({
      error: "Error de autenticación",
    });
  }
};

// GET /api/users/profile
router.get("/profile", authenticate, async (req, res) => {
  try {
    res.status(200).json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        profilePic: req.user.profilePic,
        bio: req.user.bio,
        followers: req.user.followers,
        following: req.user.following,
        photos: req.user.photos,
        createdAt: req.user.createdAt,
      },
    });
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    res.status(500).json({
      error: "Error al obtener perfil",
    });
  }
});

// PUT /api/users/profile
router.put("/profile", authenticate, async (req, res) => {
  try {
    const { name, bio, profilePic } = req.body;

    // Validar que al menos venga un campo para actualizar
    if (!name && !bio && !profilePic) {
      return res.status(400).json({
        error: "No hay datos para actualizar",
      });
    }

    // Actualizar solo los campos que vengan
    if (name) req.user.name = name;
    if (bio !== undefined) req.user.bio = bio;
    if (profilePic) req.user.profilePic = profilePic;

    await req.user.save();

    res.status(200).json({
      message: "Perfil actualizado exitosamente",
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        profilePic: req.user.profilePic,
        bio: req.user.bio,
        followers: req.user.followers,
        following: req.user.following,
        photos: req.user.photos,
      },
    });
  } catch (error) {
    console.error("Error al actualizar perfil:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ error: messages.join(", ") });
    }

    res.status(500).json({
      error: "Error al actualizar perfil",
    });
  }
});

// PUT /api/users/email
router.put("/email", authenticate, async (req, res) => {
  try {
    const { newEmail, password } = req.body;

    if (!newEmail || !password) {
      return res.status(400).json({
        error: "Se requiere nuevo email y contraseña actual",
      });
    }

    // Verificar contraseña actual
    const user = await User.findById(req.user._id).select("+password");
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: "Contraseña incorrecta",
      });
    }

    // Verificar si el nuevo email ya existe
    const emailExists = await User.findOne({
      email: newEmail.toLowerCase(),
      _id: { $ne: user._id },
    });

    if (emailExists) {
      return res.status(400).json({
        error: "Este email ya está registrado",
      });
    }

    // Actualizar email
    user.email = newEmail.toLowerCase();
    await user.save();

    res.status(200).json({
      message: "Email actualizado exitosamente",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
        bio: user.bio,
      },
    });
  } catch (error) {
    console.error("Error al cambiar email:", error);
    res.status(500).json({
      error: "Error al cambiar email",
    });
  }
});

// PUT /api/users/password
router.put("/password", authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: "Se requiere contraseña actual y nueva contraseña",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: "La nueva contraseña debe tener al menos 6 caracteres",
      });
    }

    // Verificar contraseña actual
    const user = await User.findById(req.user._id).select("+password");
    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: "Contraseña actual incorrecta",
      });
    }

    // Actualizar contraseña (se hasheará automáticamente por el middleware pre-save)
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      message: "Contraseña actualizada exitosamente",
    });
  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    res.status(500).json({
      error: "Error al cambiar contraseña",
    });
  }
});


// DELETE /api/users/account
router.delete("/account", authenticate, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        error: "Se requiere contraseña para eliminar la cuenta",
      });
    }

    // Verificar contraseña
    const user = await User.findById(req.user._id).select("+password");
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: "Contraseña incorrecta",
      });
    }

    // Eliminar usuario
    await User.findByIdAndDelete(req.user._id);

    res.status(200).json({
      message: "Cuenta eliminada exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar cuenta:", error);
    res.status(500).json({
      error: "Error al eliminar cuenta",
    });
  }
});

export default router;