
import { Router } from 'express'

import models from '../models';


const router = Router();

router.get('/', async (req, res) => {
    const { limit, offset } = req.query;

    try{
        const products = await models.Product.findAll({
            attributes: [ 'name', 'seller', 'createdAt' ],
            include: [
                {
                    separate: true,
                    model: models.ProductVariant,
                    as: 'variants',
                    attributes: [ 'inStock'],
                    // required: true makes inner join as opposed to default outer join
                    // not really applicable here since every product has variants
                    required: true,
                    include: Object.values(models.Variants).map((val) => {
                        return {
                            model: val,
                            attributes: [ 'name' ],
                        }
                    })
                }
            ],
            limit,
            offset,
            subQuery: false,
            // https://github.com/sequelize/sequelize/issues/9869
            district: true
        });
        const formattedProducts = products.map(formatProduct);
        res.status(200).json(formattedProducts);

    }catch(error){
        console.log(error)
        res.sendStatus(500);
    }
});


const formatProduct = (products) => {
    const plainProducts = products.get({plain: true});

    const variants = plainProducts.variants.map((variant) => {
        let newVariant = {}

        Object.keys(variant).map((property) => {
            if(variant[property] != null){
                if(property == 'inStock'){
                    newVariant[property] = variant[property]
                }else{
                    newVariant[property] = variant[property]['name']
                }
            }
        })
        return newVariant
    })

    let variantToOption = {}
    const options = variants.map((variant) => {

        for(const property in variant){
            if(property in models.Variants){

                if( !(property in variantToOption) ){
                    variantToOption[property] = [variant[property]];
                }else{
                    if( !(variantToOption[property].includes(variant[property])) ){
                        variantToOption[property].push(variant[property])
                    }
                }
            }
        }
    })

    return {
        ...plainProducts,
        variants: variants,
        options: variantToOption
    }
}

const validateProductBody = async (req, res, next) => {
    const variants = req.body.variants;

    if(variants){
        for( const [variantName, options] of Object.entries(variants)){

            // check that options are of lengths 2 or more
            if (options.length < 2){
                return res.status(400).json({message: "Must be more than one variant option for all variants"});
            }

            // all variants must exist in our database already
            if(!(variantName in models.Variants)){
                return res.status(400).json({message: "Variant not in database"});
            }
        }
    }
    next();
}



const postProduct = async (req, res) => {

    try{
        const count = await models.Product.count({
            where: {
                name: req.body.name
            }
        });
        if(count > 0){
            return res.status(409).json({message: "This product already exists"})
        }
        const product = await models.Product.create(
            { // should unique name validator check for caps?
                name: req.body.name,
                seller: req.body.seller
            }
        );

        // maps variant objects with options names to variant objects with option objects (which has the option's id)
        let variants = req.body.variants;
        if(variants && !isEmpty(variants)){
            variants = (await Promise.all(Object.keys(variants).map( async (variantName) => {

                let options = variants[variantName];
                options = await Promise.all(options.map( async (option) => {

                    return (await models.Variants[variantName].findOrCreate({
                        where: {
                            name: option
                        }
                    }))[0].dataValues

                }));
                return {
                    variantName,
                    options
                }

            })));
                
            const variantCombinations = getVariantCombinations([], variants);


            for(const comb of variantCombinations){
                let mappedVariants = {}
                for(const variantComb of comb){
                    mappedVariants[variantComb.variantName + "Id"] = variantComb.option.id;
                }
                const productVariant = await models.ProductVariant.create(
                    {
                        productId: product.id,
                        ...mappedVariants
                    }
                );
            }
        }else{
            const productVariant = await models.ProductVariant.create(
                {
                    productId: product.id,
                }
            );
        }

        res.status(201).json(product)

    }catch(error){
        console.log('post validation error: ',error)
        res.sendStatus(500);
    }
};


const getVariantCombinations = (currentPairs, variantsRemaining) => {
    let finishedPairs = [];

    const {variantName, options } = variantsRemaining[0];

    for(let i = 0; i < options.length; i += 1){
        let updatedPairs = [...currentPairs];
        updatedPairs.push({
            variantName,
            option: options[i]
        });

        if(variantsRemaining.length > 1){
            finishedPairs = finishedPairs.concat(getVariantCombinations(updatedPairs, variantsRemaining.slice(1)));
        }else{
            // always bottom of recursion
            finishedPairs.push(updatedPairs);
        }
    }
    return finishedPairs;
}

const isEmpty = (object) => {
    for (let key in object) {
        if (object.hasOwnProperty(key)) {
            return false;
        }
    }
    return true;
}

router.post('/', validateProductBody, postProduct);

export default router