

const productVariant = (sequelize, DataTypes) => {
    const ProductVariant = sequelize.define('productVariant', {
        inStock: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
    });
    ProductVariant.associate = models => {
        ProductVariant.belongsTo(models.Product)
        
        for (const [variantKey, variant] of Object.entries(models.Variants)){
            ProductVariant.belongsTo(variant)
        }
        
    }
    return ProductVariant
}
export default productVariant