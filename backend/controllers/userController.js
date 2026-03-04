const { User } = require('../models');
const { Op } = require('sequelize');
const auditService = require('../services/auditService');
const { buildTenantWhere } = require('../utils/tenantScope');

exports.getAllUsers = async (req, res) => {
  try {
    const where = buildTenantWhere(req);
    const users = await User.findAll({
      where,
      attributes: { exclude: ['password'] },
      include: [
        { model: User, as: 'owner', attributes: ['id', 'name'] },
        { association: 'organization', attributes: ['name'] },
        { association: 'assignedBranch', attributes: ['name'] }
      ]
    });
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: 'Error al obtener usuarios', error: error.message });
  }
};

exports.getPendingUsers = async (req, res) => {
  try {
    const baseWhere = buildTenantWhere(req);
    const where = { ...baseWhere, status: 'PENDING' };

    const users = await User.findAll({
      where,
      attributes: { exclude: ['password'] }
    });
    res.json(users);
  } catch (e) {
    res.status(500).json({ message: 'Error obteniendo usuarios pendientes' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { username, name, email, password, role, isActive, branchId } = req.body;

    const isGlobalAdmin = req.user.role === 'SUPER_ADMIN' || req.user.role === 'ADMIN';
    const tenantId = isGlobalAdmin ? (req.body.tenantId || req.user.tenantId) : req.user.tenantId;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ message: 'El correo ya está registrado' });

    if (req.user.role !== 'SUPER_ADMIN') {
      const owner = await User.findOne({
        where: { tenantId, role: 'OWNER' }
      });

      if (owner) {
        const currentUsersCount = await User.count({
          where: { tenantId, role: { [Op.ne]: 'SUPER_ADMIN' } }
        });

        if (currentUsersCount >= owner.maxUsers) {
          return res.status(403).json({
            message: `Límite de empleados alcanzado. Contacta al administrador para ampliar tu plan.`,
            limit: owner.maxUsers,
            current: currentUsersCount
          });
        }
      }
    }

    const userPayload = {
      name: name || username,
      email,
      password,
      role: role || 'EMPLOYEE',
      tenantId,
      branchId,
      ownerId: req.user.role === 'OWNER' ? req.user.id : (req.user.ownerId || null)
    };

    if (isActive !== undefined) {
      userPayload.status = isActive ? 'ACTIVE' : 'BLOCKED';
    }

    const newUser = await User.create(userPayload);

    const userResp = newUser.toJSON();
    delete userResp.password;

    auditService.log('CREATE', 'USER', newUser.id, { email: newUser.email, role: newUser.role, tenantId }, req.user?.id);

    res.status(201).json(userResp);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: 'Error creando usuario', error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, password, status, isActive, branchId } = req.body;

    const isGlobalAdmin = req.user.role === 'SUPER_ADMIN' || req.user.role === 'ADMIN';
    const where = { id };
    if (!isGlobalAdmin) {
      where.tenantId = req.user.tenantId;
    }

    const user = await User.findOne({ where });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado o sin acceso' });

    if (name) user.name = name;
    if (role) user.role = role;
    if (password) user.password = password; 
    if (status) user.status = status;
    if (isActive !== undefined) user.status = isActive ? 'ACTIVE' : 'BLOCKED';
    if (branchId !== undefined) user.branchId = branchId;
    if (isGlobalAdmin && req.body.tenantId) user.tenantId = req.body.tenantId;

    await user.save();

    auditService.log('UPDATE', 'USER', user.id, { changes: req.body }, req.user?.id);

    res.json({ message: 'Usuario actualizado correctamente', user });
  } catch (error) {
    console.error("❌ Error updating user:", error);
    res.status(500).json({ message: 'Error actualizando usuario', error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const where = { id };
    if (req.user.role !== 'SUPER_ADMIN') {
      where.tenantId = req.user.tenantId;
    }

    const deleted = await User.destroy({ where });

    if (!deleted) {
      return res.status(444).json({ message: 'Usuario no encontrado o sin acceso' });
    }

    auditService.log('DELETE', 'USER', id, {}, req.user?.id);

    res.json({ message: 'Usuario eliminado' });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: 'Error eliminando usuario' });
  }
};