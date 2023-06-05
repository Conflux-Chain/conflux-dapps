import { create } from 'zustand';

interface SideBarStore {
    expand: boolean;
}

export const sideBarStore = create<SideBarStore>(() => ({
    expand: localStorage.getItem('ConfluxHub-drawer-expand') === 'true' ? true : false,
}));

const sideBarSelector = (state: SideBarStore) => state.expand;
export const useExpand = () => sideBarStore(sideBarSelector);

export const changeExpand = () => {
    localStorage.setItem('ConfluxHub-drawer-expand', sideBarStore.getState().expand ? 'false' : 'true');
    sideBarStore.setState({ expand: !sideBarStore.getState().expand });
};
