

const size = (sequelize, DataTypes) => {
    const Size = sequelize.define('size', {
        name: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            validate: {
                notEmpty: true,
            }
        }
        
    });
    Size.associate = models => {
        Size.hasMany(models.ProductVariant);
    }
    return Size
}
export default size