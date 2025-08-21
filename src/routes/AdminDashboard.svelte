<script>
  import { onMount } from 'svelte'
  import { getVotingResults, resetVotingData } from '../lib/supabase.js'
  import { candidates } from '../lib/candidates.js'

  let showResetConfirm = false
  let showFinalConfirm = false

  function handleResetClick() {
    showResetConfirm = true
  }

  async function handleFinalConfirm() {
    isResetting = true
    const result = await resetVotingData()
    if (result.success) {
      await loadResults()
    } else {
      error = `Gagal mereset data: ${result.error}`
    }
    showResetConfirm = false
    showFinalConfirm = false
    isResetting = false
  }

  function cancelReset() {
    showResetConfirm = false
    showFinalConfirm = false
  }

  let results = null
  let totalVotes = 0
  let loading = true
  let error = ''

  onMount(async () => {
    await loadResults()
  })

  async function loadResults() {
    loading = true
    error = ''
    
    try {
      const response = await getVotingResults()
      
      if (response.success) {
        results = response.results
        totalVotes = response.totalVotes
      } else {
        error = response.error
      }
    } catch (err) {
      error = 'Gagal memuat data hasil voting'
      console.error(err)
    } finally {
      loading = false
    }
  }

  function getPercentage(votes, total) {
    if (total === 0) return 0
    return ((votes / total) * 100).toFixed(1)
  }

  function getCandidatesByPosition(position) {
    return candidates[position] || []
  }

  function getVotesForCandidate(position, candidateName) {
    if (!results || !results[position]) return 0
    return results[position][candidateName] || 0
  }
</script>

<div class="max-w-6xl mx-auto p-0 text-gray-800">
  <!-- Header with Logos -->
   <div class="border-b mb-8 h-fit px-4 pb-2 flex items-center justify-between">
    <div class="flex items-center my-auto gap-x-6 w-full">
      <img src="/logo/pmr.jpg" alt="Logo PMR" class=" h-12 w-auto object-contain" />
      <img src="/logo/sma-punung.png" alt="Logo SMA Punung" class="ml-auto h-12 w-auto object-contain" />
    </div>
  </div>


  <!-- Hero Section -->
  <div class="card flex flex-col md:flex-row gap-8 mb-10 p-8 relative overflow-hidden">
    <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-red-500"></div>
    <div class="flex-1 relative z-10">
      <div class="inline-block bg-gray-100/50 rounded-full px-5 py-2 mb-5 border border-gray-200/50">
        <span class="text-xs font-bold text-gray-800 uppercase tracking-wider">Dashboard Admin</span>
      </div>
      <h1 class="section-title">
        <span class="block">Hasil Pemilihan</span>
        <span class="block gradient-text">Pengurus PMR</span>
      </h1>
      <p class="text-gray-600 mb-7 leading-relaxed max-w-lg">Pantau hasil pemilihan pengurus PMR secara real-time dengan data yang akurat dan transparan.</p>
    </div>
    <div class="flex-1 flex justify-center items-center relative">
      <div class="card w-full max-w-80 aspect-[3/2] p-7 flex flex-col justify-center items-center text-center transform perspective-1000 hover:scale-105 transition-transform duration-300 relative overflow-hidden">
        <div class="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-radial from-blue-500/20 to-transparent opacity-80 pointer-events-none"></div>
        <div class="relative z-10">
          <div class="text-4xl mb-5 filter drop-">📊</div>
          <h3 class="text-xl font-bold text-gray-800 mb-3">Total Suara</h3>
          <p class="text-gray-600 font-medium">{totalVotes} suara terkumpul</p>
        </div>
      </div>
    </div>
  </div>

  <div class="space-y-8">
    {#if loading}
      <div class="text-center my-12 p-8 card">
        <p class="text-xl text-gray-600">Memuat data hasil voting...</p>
      </div>
    {:else if error}
      <div class="fixed top-6 left-1/2 transform -translate-x-1/2 p-4 px-7 rounded-lg text-white font-semibold shadow-xl z-50 flex items-center gap-3 animate-fade-in border border-white/20 backdrop-blur-lg max-w-[90%] w-auto bg-red-500/90">
        <div class="absolute top-0 left-0 w-1 h-full bg-red-600 rounded-tl-lg rounded-bl-lg"></div>
        <p>Error: {error}</p>
        <button on:click={loadResults} class="btn-secondary ml-2">Coba Lagi</button>
      </div>
    {:else}
      <div class="card p-5 relative overflow-hidden">
        <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-red-500"></div>
        <h2 class="section-title">Ringkasan Voting</h2>
        <div class="flex flex-wrap gap-6 mt-8">
          <div class="flex-1 min-w-[180px] card p-6 transition-all duration-300 hover:transform hover:-translate-y-2 relative overflow-hidden">
            <div class="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-600 to-red-500 rounded-tr-lg rounded-br-lg"></div>
            <div class="text-base font-semibold text-gray-600 mb-3 tracking-wide">Total Suara</div>
            <div class="text-4xl font-extrabold gradient-text tracking-tight">{totalVotes}</div>
          </div>
          <div class="flex-1 min-w-[180px] card p-6 transition-all duration-300 hover:transform hover:-translate-y-2 relative overflow-hidden">
            <div class="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-600 to-red-500 rounded-tr-lg rounded-br-lg"></div>
            <div class="text-base font-semibold text-gray-600 mb-3 tracking-wide">Posisi Tersedia</div>
            <div class="text-4xl font-extrabold gradient-text tracking-tight">3</div>
          </div>
          <div class="flex-1 min-w-[180px] card p-6 transition-all duration-300 hover:transform hover:-translate-y-2 relative overflow-hidden">
            <div class="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-600 to-red-500 rounded-tr-lg rounded-br-lg"></div>
            <div class="text-base font-semibold text-gray-600 mb-3 tracking-wide">Total Kandidat</div>
            <div class="text-4xl font-extrabold gradient-text tracking-tight">12</div>
          </div>
        </div>
      </div>

      <div class="flex flex-col mt-8 space-y-8">
        <!-- Ketua Results -->
        <div class="card p-5 relative overflow-hidden">
          <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-red-500"></div>
          <h2 class="section-title">Hasil Voting Ketua PMR</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {#each getCandidatesByPosition('ketua') as candidate}
              {@const votes = getVotesForCandidate('ketua', candidate.name)}
              {@const percentage = getPercentage(votes, totalVotes)}
              <div class="card p-6 relative overflow-hidden">
                <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-red-500 opacity-0 transition-opacity duration-300 hover:opacity-100"></div>
                <div class="flex flex-col items-center gap-4">
                  <img src={candidate.photo} alt={candidate.name} class="w-24 h-24 rounded-full object-cover border-3 border-blue-600 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-red-500 relative" />
                  <h3 class="text-xl font-bold text-gray-800 text-center tracking-tight">{candidate.name}</h3>
                  <div class="card p-4 mt-2 w-full">
                    <div class="text-lg font-bold text-gray-800 text-center mb-1">{votes} suara</div>
                    <div class="text-2xl font-extrabold gradient-text text-center mb-3">{percentage}%</div>
                    <div class="h-2.5 bg-gray-200/30 rounded-full overflow-hidden shadow-inner">
                      <div class="h-full bg-gradient-to-r from-blue-600 to-red-500 rounded-full transition-all duration-1000 ease-in-out" style="width: {percentage}%"></div>
                    </div>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </div>

        <!-- Sekretaris Results -->
        <div class="card p-5 relative overflow-hidden">
          <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-red-500"></div>
          <h2 class="section-title">Hasil Voting Sekretaris PMR</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {#each getCandidatesByPosition('sekretaris') as candidate}
              {@const votes = getVotesForCandidate('sekretaris', candidate.name)}
              {@const percentage = getPercentage(votes, totalVotes)}
              <div class="card p-6 relative overflow-hidden">
                <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-red-500 opacity-0 transition-opacity duration-300 hover:opacity-100"></div>
                <div class="flex flex-col items-center gap-4">
                  <img src={candidate.photo} alt={candidate.name} class="w-24 h-24 rounded-full object-cover border-3 border-blue-600 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-red-500 relative" />
                  <h3 class="text-xl font-bold text-gray-800 text-center tracking-tight">{candidate.name}</h3>
                  <div class="card p-4 mt-2 w-full">
                    <div class="text-lg font-bold text-gray-800 text-center mb-1">{votes} suara</div>
                    <div class="text-2xl font-extrabold gradient-text text-center mb-3">{percentage}%</div>
                    <div class="h-2.5 bg-gray-200/30 rounded-full overflow-hidden shadow-inner">
                      <div class="h-full bg-gradient-to-r from-blue-600 to-red-500 rounded-full transition-all duration-1000 ease-in-out" style="width: {percentage}%"></div>
                    </div>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </div>

        <!-- Bendahara Results -->
        <div class="card p-5 relative overflow-hidden">
          <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-red-500"></div>
          <h2 class="section-title">Hasil Voting Bendahara PMR</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {#each getCandidatesByPosition('bendahara') as candidate}
              {@const votes = getVotesForCandidate('bendahara', candidate.name)}
              {@const percentage = getPercentage(votes, totalVotes)}
              <div class="card p-6 relative overflow-hidden">
                <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-red-500 opacity-0 transition-opacity duration-300 hover:opacity-100"></div>
                <div class="flex flex-col items-center gap-4">
                  <img src={candidate.photo} alt={candidate.name} class="w-24 h-24 rounded-full object-cover border-3 border-blue-600 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-red-500 relative" />
                  <h3 class="text-xl font-bold text-gray-800 text-center tracking-tight">{candidate.name}</h3>
                  <div class="card p-4 mt-2 w-full">
                    <div class="text-lg font-bold text-gray-800 text-center mb-1">{votes} suara</div>
                    <div class="text-2xl font-extrabold gradient-text text-center mb-3">{percentage}%</div>
                    <div class="h-2.5 bg-gray-200/30 rounded-full overflow-hidden shadow-inner">
                      <div class="h-full bg-gradient-to-r from-blue-600 to-red-500 rounded-full transition-all duration-1000 ease-in-out" style="width: {percentage}%"></div>
                    </div>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>

      <div class="flex justify-center gap-4 mt-12 pb-4 text-sm">
        <button class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg" on:click={loadResults}>Refresh Data</button>
        <button class="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg " on:click={handleResetClick}>Reset Data</button>
      </div>

      <!-- First Reset Confirmation Modal -->
      {#if showResetConfirm}
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 class="font-bold text-gray-900 mb-4">Konfirmasi Reset Data</h3>
            <p class="text-gray-600 mb-6 text-sm">Apakah Anda yakin ingin mereset semua data voting? Tindakan ini tidak dapat dibatalkan.</p>
            <div class="flex justify-end gap-3 text-sm">
              <button class="px-4 py-2 text-gray-600 hover:text-gray-800" on:click={cancelReset}>Batal</button>
              <button class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700" on:click={() => { showResetConfirm = false; showFinalConfirm = true; }}>Lanjutkan Reset</button>
            </div>
          </div>
        </div>
      {/if}

      <!-- Final Reset Confirmation Modal -->
      {#if showFinalConfirm}
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 class="font-bold text-red-600 mb-4">Konfirmasi Final Reset Data</h3>
            <p class="text-gray-600 mb-6 text-sm">PERINGATAN: Anda akan menghapus SEMUA data voting. Tindakan ini TIDAK DAPAT DIBATALKAN. Apakah Anda benar-benar yakin?</p>
            <div class="flex justify-end gap-3 text-sm">
              <button class="px-4 py-2 text-gray-600 hover:text-gray-800" on:click={cancelReset}>Batal</button>
              <button class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700" on:click={handleFinalConfirm}>Ya, Reset Semua Data</button>
            </div>
          </div>
        </div>
      {/if}
    {/if}
  </div>
</div>
