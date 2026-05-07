<script lang="ts">
  import type { Motion } from '$types/index';

  interface Props {
    motion: Motion | null;
    onclose: () => void;
  }

  let { motion, onclose }: Props = $props();

  type IssueType = 'incorrect_text' | 'wrong_result' | 'wrong_votes' | 'wrong_maker' | 'wrong_year' | 'missing_data' | 'other';

  const ISSUE_LABELS: Record<IssueType, string> = {
    incorrect_text: 'Incorrect motion text',
    wrong_result: 'Wrong result (carried/failed/etc.)',
    wrong_votes: 'Wrong vote count',
    wrong_maker: 'Wrong maker or second',
    wrong_year: 'Wrong year',
    missing_data: 'Missing data',
    other: 'Other'
  };

  let issueType = $state<IssueType>('incorrect_text');
  let description = $state('');
  let correction = $state('');
  let source = $state('');
  let contact = $state('');
  let honeypot = $state('');
  let submitStatus = $state<'idle' | 'submitting' | 'success' | 'error'>('idle');
  let errorMsg = $state('');

  const workerUrl = import.meta.env.VITE_CORRECTION_WORKER_URL;

  async function submit(e: SubmitEvent) {
    e.preventDefault();
    if (!description.trim() || honeypot) return;

    if (!workerUrl) {
      submitStatus = 'error';
      errorMsg = 'Submission not configured — please open a GitHub issue directly.';
      return;
    }

    submitStatus = 'submitting';
    errorMsg = '';

    try {
      const res = await fetch(workerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issue_type: issueType,
          description: description.trim(),
          correction: correction.trim() || null,
          source: source.trim() || null,
          contact: contact.trim() || null,
          motion: motion ? { year: motion.year, motion_number: motion.motion_number, motion_text: motion.motion_text.slice(0, 300) } : null
        })
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? `Server error ${res.status}`);
      }

      submitStatus = 'success';
    } catch (err) {
      submitStatus = 'error';
      errorMsg = err instanceof Error ? err.message : 'Unknown error';
    }
  }

  function handleKey(e: KeyboardEvent) {
    if (e.key === 'Escape') onclose();
  }
</script>

<svelte:window onkeydown={handleKey} />

<div class="bg-primary-900/60 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm dark:bg-black/70" role="dialog" aria-modal="true" aria-label="Suggest a correction">
  <div class="border-primary-200 dark:border-primary-700 flex max-h-[90vh] w-full max-w-lg flex-col rounded-xl border bg-white shadow-2xl dark:bg-[#141e2e]">
    <!-- Header -->
    <div class="border-primary-200 dark:border-primary-700 flex items-center justify-between border-b px-6 py-5">
      <div>
        <h2 class="text-primary-900 dark:text-primary-100 font-[--font-serif] text-lg font-bold">Suggest a Correction</h2>
        {#if motion}
          <p class="text-primary-400 dark:text-primary-500 mt-0.5 font-mono text-xs">{motion.year} &middot; Motion {motion.motion_number ?? '—'}</p>
        {:else}
          <p class="text-primary-400 dark:text-primary-500 mt-0.5 text-xs">General correction or feedback</p>
        {/if}
      </div>
      <button
        onclick={onclose}
        class="text-primary-400 hover:bg-primary-100 hover:text-primary-600 dark:hover:bg-primary-800 dark:hover:text-primary-200 rounded-lg p-2 transition-colors"
        aria-label="Close"
      >
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    {#if submitStatus === 'success'}
      <div class="flex flex-1 flex-col items-center justify-center px-8 py-14 text-center">
        <div class="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
          <svg class="h-7 w-7 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 class="text-primary-900 dark:text-primary-100 font-[--font-serif] text-lg font-bold">Correction submitted</h3>
        <p class="text-primary-500 dark:text-primary-400 mt-2 text-sm">A GitHub issue has been opened and will be reviewed. Thank you.</p>
        <button
          onclick={onclose}
          class="border-primary-200 dark:border-primary-700 dark:bg-primary-800/40 text-primary-700 dark:text-primary-300 hover:border-primary-300 mt-6 rounded-lg border bg-white px-5 py-2 text-sm font-medium transition-colors"
        >
          Close
        </button>
      </div>
    {:else}
      <form onsubmit={submit} class="flex min-h-0 flex-1 flex-col">
        <div class="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
          {#if motion}
            <div class="bg-primary-50 dark:bg-primary-900/40 border-primary-200 dark:border-primary-700 rounded-lg border px-4 py-3">
              <p class="text-primary-600 dark:text-primary-300 line-clamp-3 text-xs leading-relaxed">{motion.motion_text}</p>
            </div>
          {/if}

          <div>
            <label for="issue-type" class="text-primary-700 dark:text-primary-300 mb-1.5 block text-xs font-semibold tracking-wide uppercase">Issue type</label>
            <select
              id="issue-type"
              bind:value={issueType}
              class="border-primary-200 dark:border-primary-600 dark:bg-primary-800/60 text-primary-900 dark:text-primary-100 focus:border-accent-400 focus:ring-accent-400 block w-full rounded-lg border bg-[#faf8f5] p-2.5 text-sm focus:ring-1"
            >
              {#each Object.entries(ISSUE_LABELS) as [val, label] (val)}
                <option value={val}>{label}</option>
              {/each}
            </select>
          </div>

          <div>
            <label for="correction-description" class="text-primary-700 dark:text-primary-300 mb-1.5 block text-xs font-semibold tracking-wide uppercase">
              What's incorrect <span class="text-rose-500">*</span>
            </label>
            <textarea
              id="correction-description"
              bind:value={description}
              required
              rows="3"
              placeholder="Describe what appears to be wrong..."
              class="border-primary-200 dark:border-primary-600 dark:bg-primary-800/60 text-primary-900 dark:text-primary-100 placeholder-primary-400 dark:placeholder-primary-500 focus:border-accent-400 focus:ring-accent-400 block w-full resize-none rounded-lg border bg-[#faf8f5] p-2.5 text-sm focus:ring-1"
            ></textarea>
          </div>

          <div>
            <label for="correction-fix" class="text-primary-700 dark:text-primary-300 mb-1.5 block text-xs font-semibold tracking-wide uppercase">Suggested correction</label>
            <textarea
              id="correction-fix"
              bind:value={correction}
              rows="2"
              placeholder="What should it say instead? (optional)"
              class="border-primary-200 dark:border-primary-600 dark:bg-primary-800/60 text-primary-900 dark:text-primary-100 placeholder-primary-400 dark:placeholder-primary-500 focus:border-accent-400 focus:ring-accent-400 block w-full resize-none rounded-lg border bg-[#faf8f5] p-2.5 text-sm focus:ring-1"
            ></textarea>
          </div>

          <div>
            <label for="correction-source" class="text-primary-700 dark:text-primary-300 mb-1.5 block text-xs font-semibold tracking-wide uppercase">Source / Reference</label>
            <input
              id="correction-source"
              type="text"
              bind:value={source}
              placeholder="e.g. WSC 2024 Summary PDF, page 12 (optional)"
              class="border-primary-200 dark:border-primary-600 dark:bg-primary-800/60 text-primary-900 dark:text-primary-100 placeholder-primary-400 dark:placeholder-primary-500 focus:border-accent-400 focus:ring-accent-400 block w-full rounded-lg border bg-[#faf8f5] p-2.5 text-sm focus:ring-1"
            />
          </div>

          <div>
            <label for="correction-contact" class="text-primary-700 dark:text-primary-300 mb-1.5 block text-xs font-semibold tracking-wide uppercase">
              Email <span class="text-primary-400 font-normal normal-case">(optional, for follow-up only)</span>
            </label>
            <input
              id="correction-contact"
              type="email"
              bind:value={contact}
              placeholder="not displayed publicly"
              class="border-primary-200 dark:border-primary-600 dark:bg-primary-800/60 text-primary-900 dark:text-primary-100 placeholder-primary-400 dark:placeholder-primary-500 focus:border-accent-400 focus:ring-accent-400 block w-full rounded-lg border bg-[#faf8f5] p-2.5 text-sm focus:ring-1"
            />
          </div>

          <!-- Honeypot — invisible to real users -->
          <input type="text" bind:value={honeypot} name="website" tabindex="-1" autocomplete="off" class="hidden" aria-hidden="true" />
        </div>

        <div class="border-primary-200 dark:border-primary-700 flex items-center justify-between border-t px-6 py-4">
          <p class="text-primary-400 dark:text-primary-500 text-xs">Opens a GitHub issue for review.</p>
          <div class="flex items-center gap-3">
            {#if submitStatus === 'error'}
              <p class="max-w-[160px] truncate text-xs text-rose-600 dark:text-rose-400" title={errorMsg}>{errorMsg}</p>
            {/if}
            <button type="button" onclick={onclose} class="text-primary-500 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-200 text-sm font-medium transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!description.trim() || submitStatus === 'submitting'}
              class="bg-accent-600 hover:bg-accent-700 focus:ring-accent-500 rounded-lg px-5 py-2 text-sm font-semibold text-white transition-colors focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitStatus === 'submitting' ? 'Submitting…' : 'Submit'}
            </button>
          </div>
        </div>
      </form>
    {/if}
  </div>
</div>
