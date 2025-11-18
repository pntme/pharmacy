import Role from './Role';
import User from './User';
import Product from './Product';
import Inventory from './Inventory';
import Patient from './Patient';
import SalesOrder from './SalesOrder';

// Define associations
User.belongsTo(Role, { foreignKey: 'role_id' });
Role.hasMany(User, { foreignKey: 'role_id' });

Product.hasMany(Inventory, { foreignKey: 'product_id' });
Inventory.belongsTo(Product, { foreignKey: 'product_id' });

SalesOrder.belongsTo(Patient, { foreignKey: 'patient_id' });
Patient.hasMany(SalesOrder, { foreignKey: 'patient_id' });

SalesOrder.belongsTo(User, { as: 'CreatedBy', foreignKey: 'created_by_user_id' });
SalesOrder.belongsTo(User, { as: 'BilledBy', foreignKey: 'billed_by_user_id' });

// Export all models
export {
  Role,
  User,
  Product,
  Inventory,
  Patient,
  SalesOrder,
};

// Export a function to sync all models
export const syncModels = async (force: boolean = false): Promise<void> => {
  // Be careful with force: true in production as it drops tables
  await Role.sync({ force });
  await User.sync({ force });
  await Product.sync({ force });
  await Inventory.sync({ force });
  await Patient.sync({ force });
  await SalesOrder.sync({ force });
};
