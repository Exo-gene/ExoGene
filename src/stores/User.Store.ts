import type { UserDto } from "$lib/Models/DTOS/User.DTO.Model";
import type { Store } from "$lib/Models/Responses/Store.Response.Model";
import { UsersRepository } from "$lib/Repositories/Implementation/Users.Repository";
import { get, writable } from "svelte/store";

const usersRepository = new UsersRepository();

const createUserStore = () => {
    const { subscribe, set, update } = writable<Store<UserDto>>({
        data: [],
        error: null,
        count: 0,
    });

    return {
        subscribe,
        set: (data: Store<UserDto>) => set(data),
        getUsers: async () => {
            try {
                const response = await usersRepository.getUsers();
                update((store) => {
                    store.data = response.data;
                    store.error = response.error;
                    store.count = response.count!;
                    return store;
                });
            } catch (error) {
                update((store) => {
                    store.error = error;
                    return store;
                });
            }
        },
    }