import { createSlice } from "@reduxjs/toolkit";

interface MasterDataState {
  status: {
    orders: [];
    total: number;
  };
  tags: [];
  taxes: [];
  fulfillmentTypes: [];
  paymentMethods: [];
  channels: [];
  loadedAt: string;
  errors: [];
}

const initialState: MasterDataState = {
  status: {
    orders: [],
    total: 0,
  },
  tags: [],
  taxes: [],
  fulfillmentTypes: [],
  paymentMethods: [],
  channels: [],
  loadedAt: "",
  errors: [],
};

const masterDataSlice = createSlice({
  name: "masterData",
  initialState,
  reducers: {
    setMasterData(state, action) {
      state.status = action.payload;
    },
    clearMasterData(state) {
      state.status = {
        orders: [],
        total: 0,
      };
    },
  },
});

export const { setMasterData, clearMasterData } = masterDataSlice.actions;
export default masterDataSlice.reducer;
