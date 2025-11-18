import Role from './Role';
import User from './User';
import Product from './Product';

// Define associations
User.belongsTo(Role, { foreignKey: 'role_id' });
Role.hasMany(User, { foreignKey: 'role_id' });

// Export all models
export {
  Role,
  User,
  Product,
};

// Export a function to sync all models
export const syncModels = async (force: boolean = false): Promise<void> => {
  // Be careful with force: true in production as it drops tables
  await Role.sync({ force });
  await User.sync({ force });
  await Product.sync({ force });
};
