<script lang="ts">
	import AuthCheck from '$lib/components/AuthCheck.svelte';
	import { user, profile, storage, db } from '$lib/firebase';
	import { doc, updateDoc } from 'firebase/firestore';
	import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

	let previewURL: string;
	let uploading = false;
	$: href = `/${$profile?.id}/edit`;

	async function upload(e: any) {
		uploading = true;
		const file = e.target.files[0];
		previewURL = URL.createObjectURL(file);
		const storageRef = ref(storage, `profiles/${$user!.uid}/profile.png`);
		const result = await uploadBytes(storageRef, file);
		const url = await getDownloadURL(result.ref);

		await updateDoc(doc(db, 'profiles', $user!.uid), { photo_url: url });
		uploading = false;
	}
</script>

<AuthCheck>
	<h2>Photo</h2>
	<form class="max-w-screen-md w-full">
		<div class="form-control w-full max-w-xs my-10 mx-auto text-center">
			<img
				src={previewURL ?? $profile?.photo_url ?? '/user.png'}
				alt="photo_url"
				width="256"
				height="256"
				class="mx-auto"
			/>
			<label for="photoURL" class="label">
				<span class="label-text">Pick a file</span>
			</label>
			<input
				on:change={upload}
				name="photo_url"
				type="file"
				class="file-input file-input-bordered w-full max-w-xs"
				accept="image/png, image/jpeg, image/gif, image/webp"
			/>
			{#if uploading}
				<p>Uploading...</p>
				<progress class="progress progress-info w-56 mt-6" />
			{/if}
		</div>
	</form>
</AuthCheck>
