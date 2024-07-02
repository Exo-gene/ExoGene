<script lang="ts">
  import { goto } from "$app/navigation";
  import "./styles.css";
  import "../app.css";
  import { authStore } from "../stores/Auth.Store";
  import { onMount } from "svelte";
  import { LoginRequest } from "$lib/Models/Requests/Auth.Request.Model";
  import { Supabase } from "$lib/Supabase/Supabase.Client";
  import { IconMail, IconSquareX } from "@tabler/icons-svelte";

  const loginRequest: LoginRequest = new LoginRequest();
  let errorMessage: string | null = null;

  export async function navigateTo() {
    return goto("/dashboard/home");
  }

  onMount(async () => {
    await CheckAuth();
  });

  async function CheckAuth() {
    await authStore.getAuth();
    if ($authStore) {
      return goto("/dashboard/home");
    }
  }

  async function fetchEmailByPhone(phone: string) {
    const { data, error } = await Supabase.client
      .from("users")
      .select("email")
      .eq("phoneNumber", phone)
      .single();

    if (error) {
      throw new Error("Phone number not found");
    }

    return data.email;
  }

  function isValidEmail(email: string): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  function isValidPhoneNumber(phone: string): boolean {
    const phonePattern = /^077\d{8}$/;
    return phonePattern.test(phone);
  }

  async function login(loginRequest: LoginRequest) {
    try {
      let identifier = loginRequest.email;

      // Check if the identifier is a phone number
      if (/^\d+$/.test(identifier)) {
        if (!isValidPhoneNumber(identifier)) {
          throw new Error("Phone number should be in the format 07702223311");
        }
        identifier = await fetchEmailByPhone(identifier);
      } else if (!isValidEmail(identifier)) {
        throw new Error(
          "Invalid email format should be in the format example@gmail.com"
        );
      }

      const response = await authStore.login(identifier, loginRequest.password);
      if (response) {
        await CheckAuth();
        return goto("/dashboard/home");
      } else {
        throw new Error("Invalid email or password");
      }
    } catch (error) {
      console.error(error);
      errorMessage = error.message;
    }
  }
</script>

<div
  class="bg-gray-100 h-screen overflow-hidden flex items-center justify-center"
>
  <div
    class="bg-white border rounded lg:w-5/12 md:6/12 w-10/12 shadow-3xl relative"
  >
    <div
      class="bg-gradient-to-b from-gray-900 to-[#1E90FF] absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full p-4 md:p-8"
    >
      <IconMail stroke={2} class="text-gray-100 w-10 h-10" />
    </div>
    <form
      class="p-12 md:p-24"
      on:submit|preventDefault={() => login(loginRequest)}
    >
      {#if errorMessage}
        <div
          class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <strong class="font-bold">Error:</strong>
          <span class="block sm:inline p-3">{errorMessage}</span>
          <span
            on:click={() => (errorMessage = null)}
            class="absolute top-0 bottom-0 right-0 px-4 py-3"
          >
            <IconSquareX stroke={2} class="text-red-700 cursor-pointer" />
          </span>
        </div>
      {/if}
      <div class="flex items-center text-lg mb-6 md:mb-8">
        <svg class="absolute ml-3" width="24" viewBox="0 0 24 24">
          <path
            d="M20.822 18.096c-3.439-.794-6.64-1.49-5.09-4.418 4.72-8.912 1.251-13.678-3.732-13.678-5.082 0-8.464 4.949-3.732 13.678 1.597 2.945-1.725 3.641-5.09 4.418-3.073.71-3.188 2.236-3.178 4.904l.004 1h23.99l.004-.969c.012-2.688-.092-4.222-3.176-4.935z"
          />
        </svg>
        <input
          bind:value={loginRequest.email}
          type="text"
          id="identifier"
          class="bg-gray-100 border border-gray-200 rounded pl-12 py-2 md:py-4 focus:outline-none w-full"
          placeholder="Email or Phone Number"
        />
      </div>
      <div class="flex items-center text-lg mb-6 md:mb-8">
        <svg class="absolute ml-3" viewBox="0 0 24 24" width="24">
          <path
            d="m18.75 9h-.75v-3c0-3.309-2.691-6-6-6s-6 2.691-6 6v3h-.75c-1.24 0-2.25 1.009-2.25 2.25v10.5c0 1.241 1.01 2.25 2.25 2.25h13.5c1.24 0 2.25-1.009 2.25-2.25v-10.5c0-1.241-1.01-2.25-2.25-2.25zm-10.75-3c0-2.206 1.794-4 4-4s4 1.794 4 4v3h-8zm5 10.722v2.278c0 .552-.447 1-1 1s-1-.448-1-1v-2.278c-.595-.347-1-.985-1-1.722 0-1.103.897-2 2-2s2 .897 2 2c0 .737-.405 1.375-1 1.722z"
          />
        </svg>
        <input
          bind:value={loginRequest.password}
          type="password"
          id="password"
          class="bg-gray-100 border border-gray-200 rounded pl-12 py-2 md:py-4 focus:outline-none w-full"
          placeholder="Password"
        />
      </div>
      <button
        type="submit"
        class="rounded bg-gradient-to-b from-gray-900 to-[#1E90FF] font-medium p-2 md:p-4 text-white uppercase w-full"
        >Login</button
      >
    </form>
  </div>
</div>
