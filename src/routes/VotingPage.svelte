<script>
  import { onMount } from 'svelte'
  import { candidates } from '../lib/candidates.js'
  import { submitVote, checkDeviceVote, getVotingResults } from '../lib/supabase.js'
  import FingerprintJS from '@fingerprintjs/fingerprintjs'

  let selectedVotes = {
    ketua: null,
    sekretaris: null,
    bendahara: null
  }

  let hasVoted = false
  let isSubmitting = false
  let message = ''
  let messageType = ''
  let deviceFingerprint = ''
  let votingResults = { ketua: {}, sekretaris: {}, bendahara: {} }
  let totalVotes = 0

  onMount(async () => {
    // Initialize FingerprintJS and check if device has already voted
    try {
      const fp = await FingerprintJS.load()
      const result = await fp.get()
      deviceFingerprint = result.visitorId

      // Check if this device has already voted
      const voteCheck = await checkDeviceVote(deviceFingerprint)
      if (voteCheck.hasVoted) {
        hasVoted = true
        message = 'Anda sudah melakukan voting sebelumnya. Terima kasih atas partisipasinya!'
        messageType = 'info'
      }
      
      // Load actual voting results
      await loadVotingResults()
    } catch (error) {
      console.error('Error initializing fingerprint:', error)
      message = 'Terjadi kesalahan saat memverifikasi perangkat. Silakan coba lagi.'
      messageType = 'error'
    }
  })

  function selectCandidate(position, candidateId) {
    if (hasVoted) return
    selectedVotes[position] = candidateId
  }

  async function handleSubmit() {
    if (hasVoted) return

    // Validate all positions are selected
    if (!selectedVotes.ketua || !selectedVotes.sekretaris || !selectedVotes.bendahara) {
      message = 'Harap pilih kandidat untuk semua posisi (Ketua, Sekretaris, dan Bendahara)'
      messageType = 'error'
      return
    }

    isSubmitting = true
    message = ''

    try {
      // Get candidate names for submission
      const ketuaCandidate = candidates.ketua.find(c => c.id === selectedVotes.ketua)
      const sekretarisCandidate = candidates.sekretaris.find(c => c.id === selectedVotes.sekretaris)
      const bendaharaCandidate = candidates.bendahara.find(c => c.id === selectedVotes.bendahara)

      const voteData = {
        ketua: ketuaCandidate.name,
        sekretaris: sekretarisCandidate.name,
        bendahara: bendaharaCandidate.name
      }

      const result = await submitVote(voteData, deviceFingerprint)

      if (result.success) {
        hasVoted = true
        message = 'Voting berhasil! Terima kasih atas partisipasinya.'
        messageType = 'success'
        // Reload voting results to update the count
        await loadVotingResults()
      } else {
        message = `Error: ${result.error}`
        messageType = 'error'
      }
    } catch (error) {
      message = `Terjadi kesalahan: ${error.message}`
      messageType = 'error'
    } finally {
      isSubmitting = false
    }
  }

  function getCandidateById(position, id) {
    return candidates[position].find(c => c.id === id)
  }

  function getTotalCandidates() {
    return candidates.ketua.length + candidates.sekretaris.length + candidates.bendahara.length
  }

  function getSelectedCount() {
    return Object.values(selectedVotes).filter(vote => vote !== null).length
  }

  function getProgressPercentage() {
    return (getSelectedCount() / 3) * 100
  }

  function getProgressText() {
    const selected = getSelectedCount()
    return `${selected}/3 Posisi Dipilih`
  }

  async function loadVotingResults() {
    try {
      const result = await getVotingResults()
      if (result.success) {
        votingResults = result.results
        totalVotes = result.totalVotes
      }
    } catch (error) {
      console.error('Error loading voting results:', error)
    }
  }
</script>

<!-- Floating Particles Background Removed for Performance -->

<!-- Navigation Header -->
<nav class="fixed top-0 left-0 right-0 z-50 bg-white  border-b border-gray-200">
  <div class="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between">
    <div class="flex items-center gap-x-6 w-full">
      <img src="/logo/pmr.jpg" alt="Logo PMR" class=" h-12 w-auto object-contain" />
      <img src="/logo/sma-punung.png" alt="Logo SMA Punung" class="ml-auto h-12 w-auto object-contain" />
    </div>
  </div>
</nav>

<div class="max-w-6xl mx-auto px-4 pt-32 pb-8">
  <!-- Hero Section -->
  <div class="flex flex-col lg:flex-row items-center gap-8 mb-12">
    <div class="flex-1 text-center lg:text-left">
      <div class="inline-block bg-blue-50 rounded-full px-4 py-2 mb-4">
        <span class="text-sm font-semibold text-blue-800 uppercase tracking-wide">Pemilihan 2025</span>
      </div>
      <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
        <span class="block text-gray-900">Pemilihan Pengurus</span>
        <span class="block text-blue-600">PMR</span>
      </h1>
      <p class="text-base text-gray-700 mb-6 leading-relaxed max-w-xl">Pilih kandidat terbaik untuk memimpin PMR periode mendatang dengan visi dan misi yang tepat</p>
      <div class="flex flex-wrap justify-center lg:justify-start gap-6">
        <div class="text-center">
          <div class="text-2xl font-bold text-blue-600">{getTotalCandidates()}</div>
          <div class="text-sm font-medium text-gray-600 uppercase tracking-wide">Kandidat</div>
        </div>
        <div class="w-px h-10 bg-gray-300 hidden sm:block"></div>
        <div class="text-center">
          <div class="text-2xl font-bold text-blue-600">3</div>
          <div class="text-sm font-medium text-gray-600 uppercase tracking-wide">Posisi</div>
        </div>
        <div class="w-px h-10 bg-gray-300 hidden sm:block"></div>
        <div class="text-center">
          <div class="text-2xl font-bold text-blue-600">{totalVotes}</div>
          <div class="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Suara</div>
        </div>
      </div>
    </div>
    <div class="flex-1 flex justify-center lg:justify-end">
      <div class="bg-white rounded-lg  p-6 border border-gray-200">
        <div class="flex justify-center mb-3">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <path d="M9 11H15M9 15H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L19.7071 9.70711C19.8946 9.89464 20 10.149 20 10.4142V19C20 20.1046 19.1046 21 18 21H17Z" stroke="#2563eb" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <h3 class="text-lg font-bold text-gray-900 text-center mb-1">Suara Anda</h3>
        <p class="text-gray-600 text-center text-sm">Menentukan Masa Depan</p>
      </div>
    </div>
  </div>

  {#if message}
    <div class="fixed top-20 left-1/2 transform -translate-x-1/2 p-3 px-5 rounded-lg text-white font-medium shadow-lg z-50 max-w-[90%] w-auto {messageType === 'success' ? 'bg-green-600' : messageType === 'error' ? 'bg-red-600' : 'bg-blue-600'}">
      <p class="text-sm">{message}</p>
    </div>
  {/if}

  {#if !hasVoted}
    <!-- Ketua Section -->
    <div class="mb-12">
      <h2 class="text-3xl font-extrabold text-gray-800 mb-8 text-center">Ketua PMR</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each candidates.ketua as candidate}
          <div 
            class="bg-white rounded-lg  border border-gray-200 p-6 cursor-pointer {selectedVotes.ketua === candidate.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'}"
            on:click={() => selectCandidate('ketua', candidate.id)}
          >
            <img src={candidate.photo} alt={candidate.name} class="w-20 h-20 rounded-full object-cover mx-auto mb-3 border-2 {selectedVotes.ketua === candidate.id ? 'border-blue-500' : 'border-gray-300'}" />
            <div class="text-center">
              <h3 class="text-lg font-semibold text-gray-800 mb-3">{candidate.name}</h3>
              <div class="text-left space-y-2">
                <div class="text-sm text-gray-600"><span class="font-bold">Visi:</span> {candidate.vision}</div>
                <div class="text-sm text-gray-600"><span class="font-bold">Misi:</span> {candidate.mission}</div>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>

    <!-- Sekretaris Section -->
    <div class="mb-12">
      <h2 class="text-3xl font-extrabold text-gray-800 mb-8 text-center">Sekretaris PMR</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each candidates.sekretaris as candidate}
          <div 
            class="bg-white rounded-lg  border border-gray-200 p-6 cursor-pointer {selectedVotes.sekretaris === candidate.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'}"
            on:click={() => selectCandidate('sekretaris', candidate.id)}
          >
            <img src={candidate.photo} alt={candidate.name} class="w-20 h-20 rounded-full object-cover mx-auto mb-3 border-2 {selectedVotes.sekretaris === candidate.id ? 'border-blue-500' : 'border-gray-300'}" />
            <div class="text-center">
               <h3 class="text-lg font-semibold text-gray-800 mb-3">{candidate.name}</h3>
              <div class="text-left space-y-2">
                <div class="text-sm text-gray-600"><span class="font-bold">Visi:</span> {candidate.vision}</div>
                <div class="text-sm text-gray-600"><span class="font-bold">Misi:</span> {candidate.mission}</div>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>

    <!-- Bendahara Section -->
    <div class="mb-12">
      <h2 class="text-3xl font-extrabold text-gray-800 mb-8 text-center">Bendahara PMR</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each candidates.bendahara as candidate}
          <div 
            class="bg-white rounded-lg  border border-gray-200 p-6 cursor-pointer {selectedVotes.bendahara === candidate.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'}"
            on:click={() => selectCandidate('bendahara', candidate.id)}
          >
            <img src={candidate.photo} alt={candidate.name} class="w-20 h-20 rounded-full object-cover mx-auto mb-3 border-2 {selectedVotes.bendahara === candidate.id ? 'border-blue-500' : 'border-gray-300'}" />
            <div class="text-center">
               <h3 class="text-lg font-semibold text-gray-800 mb-3">{candidate.name}</h3>
              <div class="text-left space-y-2">
                <div class="text-sm text-gray-600"><span class="font-bold">Visi:</span> {candidate.vision}</div>
                <div class="text-sm text-gray-600"><span class="font-bold">Misi:</span> {candidate.mission}</div>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>

    <!-- Submit Section -->
    <div class="flex justify-center mt-8">
      <button 
        class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-6 rounded-lg  disabled:cursor-not-allowed text-base min-w-[160px]" 
        on:click={handleSubmit}
        disabled={isSubmitting || !selectedVotes.ketua || !selectedVotes.sekretaris || !selectedVotes.bendahara}
      >
        {isSubmitting ? 'Mengirim...' : 'Submit Voting'}
      </button>
    </div>
  {:else}
    <!-- Already Voted Display -->
    <div class="text-center py-12">
      <h2 class="text-2xl font-bold text-gray-800 mb-4">Voting Selesai</h2>
      <p class="text-base text-gray-600">
        Terima kasih telah berpartisipasi dalam pemilihan pengurus PMR!
      </p>
    </div>
  {/if}
</div>
