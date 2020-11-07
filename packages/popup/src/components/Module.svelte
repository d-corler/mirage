<script lang="ts">
  import { module } from "../stores";

  export let name: string;
</script>

<main>
  <h2>{name}</h2>
  <div>Module : {$module.feature_1}</div>
  <ul>
    <li>
      <!--<label>Feature 1 <input type="checkbox" bind:checked={module} /> </label>-->
    </li>
  </ul>
</main>
