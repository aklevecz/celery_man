<script>
	let { children } = $props();
	import '../app.css';
</script>

{@render children()}
<audio id="good-morning-paul" src="good_morning_paul.mp3" controls class="audio"></audio>
<audio id="first-sequence-of-the-day" src="first_sequence_of_the_day.mp3" controls class="audio"
></audio>
<audio id="yes-paul" src="yes_paul.mp3" controls class="audio"></audio>

<style>
	audio {
		display: none;
	}
</style>
