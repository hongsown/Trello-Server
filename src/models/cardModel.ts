import { GET_DB } from "@/config/mongodb";
import { CardType } from "@/types/cardType";
import { ColumnType } from "@/types/columnType";
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '@/utils/validators';
import Joi from 'joi';
import { DeleteManyModel, DeleteResult, InsertOneResult, ObjectId } from "mongodb";
const INVALID_UPDATE_FIELDS = ['_id', 'boardId', 'createdAt'];
// Define Collection (name & schema)

const CARD_COLLECTION_NAME = 'cards';
const CARD_COLLECTION_SCHEMA = Joi.object({
    boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    columnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),

    title: Joi.string().required().min(3).max(50).trim().strict(),
    description: Joi.string().optional(),

    createdAt: Joi.date().timestamp('javascript').default(Date.now),
    updatedAt: Joi.date().timestamp('javascript').default(null),
    _destroy: Joi.boolean().default(false)
});
const validateBeforeCreate = async(data: CardType): Promise<CardType> => {
    return await CARD_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false }) as CardType;
};
const createNew = async(data: CardType): Promise<InsertOneResult<Document>> => {
    try {
        const validData = await validateBeforeCreate(data);
     
        const createdCard = await GET_DB().collection(CARD_COLLECTION_NAME).insertOne({ ...validData, boardId: new ObjectId(validData.boardId), columnId: new ObjectId(validData.columnId) });
       
        return createdCard;
    } catch (err: unknown){
        throw new Error(err as string);
    }
};
const findOneById = async(id: ObjectId): Promise<CardType> => {
    try {
        const card = await GET_DB().collection(CARD_COLLECTION_NAME).findOne({ _id: id });
    
        return card as CardType;
    } catch (err: unknown){
        throw new Error(err as string);
    }

};
const update = async(cardId: string, updateData: ColumnType|object): Promise<ColumnType> => {
    try {
        Object.keys(updateData).forEach((key) => {
            if (INVALID_UPDATE_FIELDS.includes(key)){
                delete updateData[key as keyof typeof updateData];
            }
        });
      
        const result = await GET_DB().collection(CARD_COLLECTION_NAME).findOneAndUpdate(
            { _id: new ObjectId(cardId) },
            { $set: updateData }, {
                returnDocument: 'after'
            }
    
        );
     
        return result as ColumnType;
    } catch (err: unknown){
        throw new Error(err as string);
    
    }
};
const deleteManyByColumnId = async(columnId: ObjectId): Promise<DeleteResult> => {
    try {
        const result: DeleteResult = await GET_DB().collection(CARD_COLLECTION_NAME).deleteMany({ columnId: columnId });
    
        return result;
    } catch (err: unknown){
        throw new Error(err as string);
    }

};
export const cardModel = {
    CARD_COLLECTION_NAME,
    CARD_COLLECTION_SCHEMA,
    createNew,
    findOneById,
    update,
    deleteManyByColumnId
};