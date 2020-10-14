import Sequelize from 'sequelize';

import createProduct from './product'
import createProductVariant from './productVariant'
import createVariants from './variants'


const sequelize = new Sequelize(
    process.env.DB,
    process.env.DB_USER,
    process.env.DB_USER_PASSWORD,
    {
        dialect: 'postgres',
        define: {
            freezeTableName: true
        }
    }
);


let variants = {};
Object.keys(createVariants).map((variantKey) => {
    variants[variantKey] = createVariants[variantKey](sequelize, Sequelize)
})


const models = {
    Product: createProduct(sequelize, Sequelize),
    ProductVariant: createProductVariant(sequelize, Sequelize),
    Variants: variants
}


Object.keys(models).forEach(key => {
    if('associate' in models[key]){
        models[key].associate(models);
    }
})

Object.keys(models.Variants).forEach(key => {
    if('associate' in models.Variants[key]){
        models.Variants[key].associate(models);
    }
})


export { sequelize }
export default models