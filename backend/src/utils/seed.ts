import Role from '../models/Role';
import logger from './logger';

export const seedDefaultRoles = async (): Promise<void> => {
  try {
    const roleCount = await Role.count();

    // Only seed if roles table is empty
    if (roleCount === 0) {
      logger.info('Seeding default roles...');

      const defaultRoles = [
        {
          role_name: 'admin',
          role_description: 'System Administrator',
          permissions: { all: true },
        },
        {
          role_name: 'pharmacist',
          role_description: 'Licensed Pharmacist',
          permissions: {
            prescriptions: ['read', 'write', 'verify'],
            sales: ['read', 'write'],
            inventory: ['read'],
          },
        },
        {
          role_name: 'pharmacy_manager',
          role_description: 'Pharmacy Manager',
          permissions: {
            prescriptions: ['read', 'write', 'verify'],
            sales: ['read', 'write'],
            inventory: ['read', 'write'],
            reports: ['read'],
          },
        },
        {
          role_name: 'technician',
          role_description: 'Pharmacy Technician',
          permissions: {
            prescriptions: ['read', 'write'],
            sales: ['read'],
            inventory: ['read'],
          },
        },
        {
          role_name: 'cashier',
          role_description: 'Cashier',
          permissions: {
            sales: ['read', 'write'],
            inventory: ['read'],
          },
        },
        {
          role_name: 'inventory_manager',
          role_description: 'Inventory Manager',
          permissions: {
            inventory: ['read', 'write'],
            purchase: ['read', 'write'],
            reports: ['read'],
          },
        },
      ];

      await Role.bulkCreate(defaultRoles);
      logger.info('✅ Default roles seeded successfully');
      console.log('✅ Default roles created');
    } else {
      logger.info('Roles already exist, skipping seed');
    }
  } catch (error) {
    logger.error('Error seeding roles:', error);
    throw error;
  }
};
