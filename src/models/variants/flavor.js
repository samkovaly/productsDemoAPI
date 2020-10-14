

const flavor = (sequelize, DataTypes) => {
    const Flavor = sequelize.define('flavor', {
        name: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            validate: {
                notEmpty: true,
            }
        }
        
    });
    Flavor.associate = models => {
        Flavor.hasMany(models.ProductVariant);
    }
    return Flavor
}
export default flavor