const dbConfig = require('../dbConfig/dbConfig');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    operatorsAliases: "",
    logging: false,
    pool: {
        max: dbConfig.pool.max,
        min: dbConfig.pool.min,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle,
    },
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Models
db.User        = require('./userModel')(sequelize, Sequelize);
db.Region      = require('./regionModel')(sequelize, Sequelize);
db.Retailer    = require('./retailerModel')(sequelize, Sequelize);
db.Product     = require('./productModel')(sequelize, Sequelize);
db.Batch       = require('./batchModel')(sequelize, Sequelize);
db.SalesTarget = require('./salesTargetModel')(sequelize, Sequelize);
db.Order       = require('./orderModel')(sequelize, Sequelize);
db.OrderItem   = require('./orderItemModel')(sequelize, Sequelize);
db.Invoice     = require('./invoiceModel')(sequelize, Sequelize);
db.Delivery    = require('./deliveryModel')(sequelize, Sequelize);
db.Payment     = require('./paymentModel')(sequelize, Sequelize);
db.Return      = require('./returnModel')(sequelize, Sequelize);
db.ReturnItem  = require('./returnItemModel')(sequelize, Sequelize);
db.Alert       = require('./alertModel')(sequelize, Sequelize);

// Region
db.Region.hasMany(db.User,       { foreignKey: 'region_id' });
db.User.belongsTo(db.Region,     { foreignKey: 'region_id' });
db.Region.hasMany(db.Retailer,   { foreignKey: 'region_id' });
db.Retailer.belongsTo(db.Region, { foreignKey: 'region_id' });

// Retailer
db.Retailer.hasMany(db.Order,    { foreignKey: 'retailer_id' });
db.Order.belongsTo(db.Retailer,  { foreignKey: 'retailer_id' });
db.Retailer.hasMany(db.Payment,  { foreignKey: 'retailer_id' });
db.Payment.belongsTo(db.Retailer,{ foreignKey: 'retailer_id' });
db.Retailer.hasMany(db.Return,   { foreignKey: 'retailer_id' });
db.Return.belongsTo(db.Retailer, { foreignKey: 'retailer_id' });

// User
db.User.hasMany(db.Order,        { foreignKey: 'sales_rep_id',       as: 'SalesOrders' });
db.Order.belongsTo(db.User,      { foreignKey: 'sales_rep_id',       as: 'SalesRep' });
db.User.hasMany(db.Delivery,     { foreignKey: 'delivery_person_id', as: 'Deliveries' });
db.Delivery.belongsTo(db.User,   { foreignKey: 'delivery_person_id', as: 'DeliveryPerson' });
db.User.hasMany(db.Payment,      { foreignKey: 'collected_by',       as: 'CollectedPayments' });
db.Payment.belongsTo(db.User,    { foreignKey: 'collected_by',       as: 'CollectedBy' });
db.User.hasMany(db.SalesTarget,  { foreignKey: 'user_id' });
db.SalesTarget.belongsTo(db.User,{ foreignKey: 'user_id' });
db.User.hasMany(db.Return,       { foreignKey: 'sales_rep_id',       as: 'ManagedReturns' });
db.Return.belongsTo(db.User,     { foreignKey: 'sales_rep_id',       as: 'SalesRep' });

// Product / Batch
db.Product.hasMany(db.Batch,     { foreignKey: 'product_id' });
db.Batch.belongsTo(db.Product,   { foreignKey: 'product_id' });

// Order
db.Order.hasMany(db.OrderItem,   { foreignKey: 'order_id' });
db.OrderItem.belongsTo(db.Order, { foreignKey: 'order_id' });
db.Order.hasOne(db.Invoice,      { foreignKey: 'order_id' });
db.Invoice.belongsTo(db.Order,   { foreignKey: 'order_id' });
db.Order.hasOne(db.Delivery,     { foreignKey: 'order_id' });
db.Delivery.belongsTo(db.Order,  { foreignKey: 'order_id' });
db.Order.hasMany(db.Return,      { foreignKey: 'order_id' });
db.Return.belongsTo(db.Order,    { foreignKey: 'order_id' });

// OrderItem
db.OrderItem.belongsTo(db.Product, { foreignKey: 'product_id' });
db.OrderItem.belongsTo(db.Batch,   { foreignKey: 'batch_id' });

// Invoice / Payment
db.Invoice.hasMany(db.Payment,   { foreignKey: 'invoice_id' });
db.Payment.belongsTo(db.Invoice, { foreignKey: 'invoice_id' });

// Return
db.Return.hasMany(db.ReturnItem,    { foreignKey: 'return_id' });
db.ReturnItem.belongsTo(db.Return,  { foreignKey: 'return_id' });
db.ReturnItem.belongsTo(db.Product, { foreignKey: 'product_id' });
db.ReturnItem.belongsTo(db.Batch,   { foreignKey: 'batch_id' });

sequelize.authenticate()
    .then(() => {
        console.log('Database connected successfully');
    })
    .catch(error => {
        console.error('Unable to connect to the database:', error);
    });

module.exports = db;