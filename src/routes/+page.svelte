<script lang="ts">
  import { goto } from "$app/navigation";
  import "./styles.css";
  import "../app.css";
  import logo from "../lib/images/logo.png";
  import { authStore } from "../stores/Auth.Store";
  import { onMount } from "svelte";
  import { LoginRequest } from "$lib/Models/Requests/Auth.Request.Model";

  const loginRequest: LoginRequest = new LoginRequest();

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

  async function login(loginRequest: LoginRequest) {
    
    const response = await authStore.login(loginRequest.email, loginRequest.password);
    if(response){
      await CheckAuth();
      return goto("/dashboard/home");
    }
  }
</script>

<div class="bg-gray-100 flex justify-center items-center h-screen">
  <!-- Left: Image -->
  <div
    class="w-1/2 h-screen hidden lg:flex bg-[#012853] justify-center items-center"
  >
    <img src={logo} alt="Placeholder Image" class="object-cover px-10" />
  </div>
  <!-- Right: Login Form -->
  <div class="lg:p-36 md:p-52 sm:20 p-8 w-full lg:w-1/2">
    <h1 class="text-2xl font-semibold mb-4">Login</h1>
    <form method="POST">
      <!-- Email Input -->
      <div class="mb-4">
        <label for="email" class="block text-gray-600">Email</label>
        <input
          bind:value={loginRequest.email}
          type="text"
          id="email"
          name="email"
          class="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-[#012853]"
          autocomplete="off"
        />
      </div>
      <!-- Password Input -->
      <div class="mb-4">
        <label for="password" class="block text-gray-600">Password</label>
        <input
          bind:value={loginRequest.password}
          type="password"
          id="password"
          name="password"
          class="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-[#012853]"
          autocomplete="off"
        />
      </div>
      <!-- Remember Me Checkbox -->
      <!-- <div class="mb-4 flex items-center">
        <input
          type="checkbox"
          id="remember"
          name="remember"
          class="text-[#012853]"
        />
        <label for="remember" class="text-gray-600 ml-2">Remember Me</label>
      </div> -->
      <!-- Forgot Password Link -->
      <div class="mb-6 text-[#012853]">
        <!-- <a href="#" class="hover:underline">Forgot Password?</a> -->
      </div>
      <!-- Login Button -->
      <button
        on:click|preventDefault={() => login(loginRequest)}
        type="submit"
        class="bg-[#012853] hover:bg-[#205ba0] text-white font-semibold rounded-md py-2 px-4 w-full"
        >Login</button
      >
    </form>
    <!-- Sign up  Link -->
    <!-- <div class="mt-6 text-[#012853] text-center">
      <a href="#" class="hover:underline">Sign up Here</a>
    </div> -->
  </div>
</div>
