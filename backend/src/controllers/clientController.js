const { Client } = require('../models');
const { buildTenantWhere } = require('../utils/tenantScope');
const auditLogger = require('../utils/auditLogger');

// OBTENER todos los clientes
exports.getAllClients = async (req, res) => {
  try {
    const where = buildTenantWhere(req);
    const clients = await Client.findAll({ where });
    
    // Log de acceso
    await auditLogger(req.user?.id, 'ACCESS_LIST', 'CLIENT', null, { 
      count: clients.length,
      tenantId: req.user?.tenantId 
    });

    res.status(200).json(clients);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los clientes', error: error.message });
  }
};

exports.getClientById = async (req, res) => {
  try {
    const { id } = req.params;
    const where = { id, ...buildTenantWhere(req) };
    const client = await Client.findOne({ where });
    if (!client) return res.status(404).json({ message: 'Cliente no encontrado' });

    // Log de acceso a detalle
    await auditLogger(req.user?.id, 'ACCESS_DETAIL', 'CLIENT', id, {
      clientName: client.name
    });

    res.json(client);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener detalle del cliente' });
  }
};

// CREAR un nuevo cliente
exports.createClient = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId || 1;
    const clientData = { ...req.body, tenantId };

    // Limpiar campos opcionales para evitar fallos de validación con strings vacíos
    if (clientData.email === '') clientData.email = null;
    if (clientData.phone2 === '') clientData.phone2 = null;

    const newClient = await Client.create(clientData);

    // Auditoría
    await auditLogger(req.user?.id, 'CREATE', 'CLIENT', newClient.id, {
      name: newClient.name
    });

    res.status(201).json(newClient);
  } catch (error) {
    console.error('[CreateClient] Error:', error);
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const errors = error.errors.map(err => err.message);
      return res.status(400).json({ message: 'Error de validación', errors });
    }
    res.status(500).json({ message: 'Error al crear el cliente' });
  }
};

// ACTUALIZAR cliente
exports.updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const where = { id, ...buildTenantWhere(req) };
    const client = await Client.findOne({ where });
    if (!client) return res.status(404).json({ message: 'Cliente no encontrado' });

    const oldData = { ...client.toJSON() };
    await client.update(req.body);

    // Auditoría
    await auditLogger(req.user?.id, 'UPDATE', 'CLIENT', id, {
      changes: req.body,
      prev: oldData
    });

    res.json(client);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar cliente' });
  }
};