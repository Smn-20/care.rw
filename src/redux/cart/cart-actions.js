import * as actionTypes from './cart-types';


export const addToCart=(item)=>{
    return {
        type:actionTypes.ADD_TO_CART,
        payload:item
    }
}

export const decreaseQty=(itemID)=>{
    return {
        type:actionTypes.DECREASE_QTY,
        payload:{
            id:itemID
        }
    }
}

export const removeFromCart=(itemID,branch_id)=>{
    return {
        type:actionTypes.REMOVE_FROM_CART,
        payload:{
            id:itemID,
            branch_id:branch_id
        }
    }
}

export const adjustQty=(itemID,value)=>{
    return {
        type:actionTypes.ADJUST_QTY,
        payload:{
            id:itemID,
            qty:value
        }
    }
}

export const loadCurrentItem=(item)=>{
    return {
        type:actionTypes.LOAD_CURRENT_ITEM,
        payload:item
    }
}

export const clearCart=()=>{
    return {
        type:actionTypes.CLEAR_CART,
    }
}