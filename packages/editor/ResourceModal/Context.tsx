import { ICategory } from '@shared/types/library';
import {
  Dimension,
  IData,
  IImportState,
  IState,
  ResourceTypeInModal,
  SidebarType,
  ImportStatus,
  IAIData,
} from './type';
import create from 'zustand';

export const useModalState = create<{
  modalState: IState['modalState'];
  updateModalState: (v: Partial<IState['modalState']>) => void;
  getModalState: () => IState['modalState'];
}>((set, get) => ({
  modalState: {
    keyword: '',
    categoryId: '1',
    sidebarType: SidebarType.Store,
    dimension: Dimension.D2,
    resourceType: ResourceTypeInModal.Component2D,
    previewId: 0,
    selectedItems: [],
    page: 1,
    total: 0,
  },
  updateModalState: (values: Partial<IState['modalState']>) =>
    set(state => ({ modalState: { ...state.modalState, ...values } })),
  getModalState: () => get().modalState,
}));

export const useCategories = create<{
  categories: IState['categories'];
  updateCategories: (type: 'store' | 'team', v: ICategory[]) => void;
}>(set => ({
  categories: { store: [], team: [] },
  updateCategories: (type, values) =>
    set(state => ({
      categories: {
        ...state.categories,
        [type]: values,
      },
    })),
}));

export const useData = create<{
  data: IData[];
  updateData: (values: IData[]) => void;
}>(set => ({
  data: [],
  updateData: values => set(() => ({ data: values })),
}));

export const useSelectedList = create<{
  selectedList: IData[];
  selectedAIList: IAIData[];
  getSelectedList: () => IData[];
  getSelectedAIList: () => IAIData[];
  updateSelectedList: (values: IData[]) => void;
  updateSelectedAIList: (values: IAIData[]) => void;
}>((set, get) => ({
  selectedList: [],
  selectedAIList: [],
  getSelectedList: () => get().selectedList,
  getSelectedAIList: () => get().selectedAIList,
  updateSelectedList: values => set(() => ({ selectedList: values })),
  updateSelectedAIList: values => set(() => ({ selectedAIList: values })),
}));

export const useDetail = create<{
  detail: IData | undefined;
  updateDetail: (value: IData | undefined) => void;
}>(set => ({
  detail: undefined,
  updateDetail: value => set(() => ({ detail: value })),
}));

const initialState = {
  status: ImportStatus.rest,
  desc: '',
  percent: 0,
  error: [],
  finish: 0,
  total: 0,
};
export const useImportState = create<{
  state: IImportState;
  finishOne: () => void;
  errorOne: (s: string) => void;
  resetState: () => void;
  start: (v: Partial<IImportState>) => void;
  updateImportState: (v: Partial<IImportState>) => void;
  getState: () => IImportState;
  onFinish: () => void;
}>((set, get) => ({
  state: initialState,
  start: (values: Partial<IImportState>) =>
    set(state => ({ state: { ...state.state, ...values, status: ImportStatus.handing } })),
  finishOne: () => set(state => ({ state: { ...state.state, finish: state.state.finish + 1 } })),
  errorOne: (msg: string) => set(state => ({ state: { ...state.state, error: [...state.state.error, msg] } })),
  updateImportState: (values: Partial<IImportState>) => set(state => ({ state: { ...state.state, ...values } })),
  resetState: () => set(() => ({ state: initialState })),
  getState: () => get().state,
  onFinish: () => set(state => ({ state: { ...state.state, status: ImportStatus.finish } })),
}));

export const useExistData = create<{
  data: IData[];
  initialFetch: boolean;
  updateData: (values: Partial<{ data: IData[]; initialFetch: boolean }>) => void;
}>(set => ({
  data: [],
  initialFetch: false,
  updateData: (values: Partial<{ data: IData[]; initialFetch: boolean }>) => set(state => ({ ...state, ...values })),
}));
