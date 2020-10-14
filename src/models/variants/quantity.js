

const quantity = (sequelize, DataTypes) => {
    const Quantity = sequelize.define('quantity', {
        name: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            validate: {
                notEmpty: true,
            }
        }
        
    });
    Quantity.associate = models => {
        Quantity.hasMany(models.ProductVariant);
    }
    return Quantity
}
export default quantity