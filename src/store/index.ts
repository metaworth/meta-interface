import { createStore } from 'redux'

// Action Type
const LOADING = 'LOADING'

// Action
export const setLoading = (loading: boolean) => {
  return {
    type : LOADING,
    payload : loading
  }
}

// Reducer
const initialState = {
  isLoading: false
}

const loadingActionReducer = (state = initialState, action: any) => {
  switch(action.type) {
    case LOADING: return {
      ...state,
      isLoading : action.payload
    }
    default: return state
  }
}

//Store
export const store = createStore(loadingActionReducer)
