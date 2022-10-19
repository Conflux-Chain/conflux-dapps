import { getAPPs, getAPPCards, getAPPAPIs } from 'payment/src/utils/request';

export const createProvider = (set, get) => ({
    provider: {
        loading: false,
        error: null,
        data: {
            list: [],
            total: 0,
        },
        fetch: async (owner: string) => {
            set((state) => {
                state.provider.loading = true;
            });
            const data = await getAPPs(owner);
            set((state) => {
                state.provider.data.list = data;
                state.provider.data.total = data.length;
            });
            set((state) => {
                state.provider.loading = false;
            });
        },
    },
    subscription: {
        loading: false,
        error: null,
        data: {
            list: [],
            total: 0,
        },
        fetch: async (owner: string) => {
            set((state) => {
                state.subscription.loading = true;
            });
            const data = await getAPPCards(owner);
            set((state) => {
                state.subscription.data.list = data.list;
                state.subscription.data.total = data.total;
            });
            set((state) => {
                state.subscription.loading = false;
            });
        },
    },
    billing: {
        loading: false,
        error: null,
        data: {
            list: [],
            total: 0,
        },
        fetch: async (owner: string) => {
            set((state) => {
                state.billing.loading = true;
            });
            const data = await getAPPAPIs(owner);
            set((state) => {
                state.billing.data.list = data.list;
                state.billing.data.total = data.total;
            });
            set((state) => {
                state.billing.loading = false;
            });
        },
    },
});
