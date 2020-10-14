

const product = (sequelize, DataTypes) => {
    const Product = sequelize.define('product', {
        name: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            validate: {
                notEmpty: true,
            }
        },
        seller: {
            type: DataTypes.STRING,
            unique: false,
            allowNull: true,
        }
    });
    Product.associate = models => {
        Product.hasMany(models.ProductVariant, {
            as: 'variants',
            onDelete: 'CASCADE'
        });
    }
    return Product
}
export default product