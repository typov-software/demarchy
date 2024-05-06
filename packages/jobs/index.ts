import {
  createSupaworker,
  type SupaworkerClientOptions,
  type SupaworkerOptions,
} from 'supaworker-js';

const clientOptions: SupaworkerClientOptions = {
  supabase_url: import.meta.env.PUBLIC_SUPABASE_URL ?? '',
  supabase_service_role_key: import.meta.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
};

const workerOptions: SupaworkerOptions = {
  queue: 'example',
};

const { enqueue, worker } = createSupaworker<{ message: string }>(
  clientOptions,
  workerOptions,
  async (job) => {
    console.log(job.payload!.message);
  },
);

await enqueue([
  {
    queue: 'example',
    payload: {
      message: 'Hello, World!',
    },
  },
]);

process.on('SIGINT', async () => {
  await worker.stop();
  process.exit();
});

await worker.start();
await worker.stop();
