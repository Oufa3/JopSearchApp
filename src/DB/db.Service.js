export const create = async ({ model, data = {} } = {}) => {
    const doucment = await model.create(data)
    return doucment
}

//finders
export const findAll = async ({ model, filter = {}, select = "", populate = [], skip = 0, limit = 1000 } = {}) => {
    const doucment = await model.find(filter).select(select).populate(populate).skip(skip).limit(limit);
    return doucment
}
export const findOne = async ({ model, filter = {}, select = "", populate = [], } = {}) => {
    const doucment = await model.findOne(filter).select(select).populate(populate);
    return doucment
}
export const findById = async ({ model, id = "", data = {}, options = {}, select = "", populate = [] } = {}) => {
    const doucment = await model.findById(id, data, options).select(select).populate(populate);
    return doucment
}

//update
export const findOneAndUpdate = async ({ model, filter = {}, data = {}, options = {}, select = "", populate = [] } = {}) => {
    const doucment = await model.findOneAndUpdate(filter, data, options).select(select).populate(populate)
    return doucment
}
export const findByIdAndUpdate = async ({ model, id = "", data = {}, options = {}, select = "", populate = [], } = {}) => {
    const doucment = await model.findByIdAndUpdate(id, data, options).select(select).populate(populate);
    return doucment
}
export const updateOne = async ({ model, filter = {}, data = {}, options = {}, } = {}) => {
    const doucments = await model.updateOne(filter, data, options);
    return doucments
}
export const updateMany = async ({ model, filter = {}, data = {}, options = {}, } = {}) => {
    const doucments = await model.updateMany(filter, data, options);
    return doucments
}

//delete
export const findOneAndDelete = async ({ model, filter = {}, select = "", populate = [], } = {}) => {
    const doucment = await model.findOneAndDelete(filter).select(select).populate(populate)
    return doucment
}
export const findByIdAndDelete = async ({ model, id = "", select = "", populate = [], } = {}) => {
    const doucment = await model.findByIdAndDelete(id).select(select).populate(populate);
    return doucment
}
export const deleteOne = async ({ model, filter = {}, } = {}) => {
    const doucment = await model.deleteOne(filter);
    return doucment
}
export const deleteMany = async ({ model, filter = {}, } = {}) => {
    const doucments = await model.deleteMany(filter);
    return doucments
}