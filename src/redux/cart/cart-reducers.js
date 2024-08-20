import * as actionTypes from './cart-types';

const initialState={
    medications:[],
    cart:[],
    currentItem:null
}

const cartReducer=(state=initialState,action)=>{
    switch(action.type){

        case actionTypes.ADD_TO_CART:
            const item=action.payload
            const inCart=state.cart.find(item=> item.id===action.payload.id && item.branch_id===action.payload.branch_id ? true:false)
            return {
                ...state,
                cart: inCart? state.cart.map(item=> item.id === action.payload.id && item.branch_id===action.payload.branch_id ? {...item,qty:item.qty+action.payload.qty,total:(item.qty+action.payload.qty)*item.price} : item):[...state.cart,{...item,id:item.id,qty:item.qty,total:item.qty*item.price}]
            }

        case actionTypes.DECREASE_QTY:
            const my_item=state.cart.find(item=> item.id===action.payload.id && item.branch_id===action.payload.branch_id)
            let many;
            if(my_item){
                many=my_item.qty>1
            }
            else{
                many=false
            }
            return {
                ...state,
                cart: many? state.cart.map(item=> item.id === action.payload.id && item.branch_id===action.payload.branch_id ? {...item,qty:item.qty-1,total:(item.qty-1)*item.price} : item):state.cart.filter(item => item.id!==action.payload.id && item.branch_id===action.payload.branch_id)
            }

        case actionTypes.REMOVE_FROM_CART:
            return {
                ...state,
                cart:state.cart.filter(item => !(item.id===action.payload.id && item.branch_id===action.payload.branch_id))
            }

        case actionTypes.ADJUST_QTY:
            return {
                ...state,
                cart:state.cart.map(item=> item.id===action.payload.id && item.branch_id===action.payload.branch_id ? {...item,qty:action.payload.qty}:item)
            }

        case actionTypes.LOAD_CURRENT_ITEM:
            return {
                ...state,
                currentItem:action.payload,
            }
        case actionTypes.CLEAR_CART:
            return {
                ...state,
                medications:[],
                cart:[],
                currentItem:null
            }
        default:
            return state;
    }
}

export default cartReducer;