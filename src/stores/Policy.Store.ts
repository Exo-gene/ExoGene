import { Dto } from "$lib/Models/Conversion/ToDTO.Conversion.Model";
import type { PolicyDto } from "$lib/Models/DTOS/Policy.DTO.Model";
import type { Store } from "$lib/Models/Responses/Store.Response.Model";
import { PoliciesRepository } from "$lib/Repositories/Implementation/Policies.Repository";
import { writable } from "svelte/store";

const policiesRepository = new PoliciesRepository();

const createPolicyStore = () => {
  const { subscribe, set, update } = writable<Store<PolicyDto>>({
    data: [],
    error: null,
    count: 0,
  });

  return {
    subscribe,
    set: (data: Store<PolicyDto>) => set(data),
    getAll: async () => {
      try {
        const { data, error } = await policiesRepository.getPolicies();
        if (error) {
          throw error;
        }
        const dtos = data.map((entity) => Dto.ToPolicyDto(entity));
        set({ data: dtos, error: null, count: dtos.length });
        return dtos;
      } catch (error) {
        update((store) => {
          store.error = error;
          return store;
        });
      }
    },
    get: async (id: string) => {
      try {
        const data = await policiesRepository.getPolicy(id);
        const dto = Dto.ToPolicyDto(data);
        return dto;
      } catch (error) {
        update((store) => {
          store.error = error;
          return store;
        });
      }
    },
  };
};

export const policyStore = createPolicyStore();
