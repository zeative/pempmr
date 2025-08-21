import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

export async function submitVote(votes, deviceFingerprint) {
  try {
    const { data, error } = await supabase
      .from('votes')
      .insert([
        {
          ketua: votes.ketua,
          sekretaris: votes.sekretaris,
          bendahara: votes.bendahara,
          device_fingerprint: deviceFingerprint,
          created_at: new Date().toISOString()
        }
      ])

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error submitting vote:', error)
    return { success: false, error: error.message }
  }
}

export async function getVotingResults() {
  try {
    const { data, error } = await supabase
      .from('votes')
      .select('*')

    if (error) throw error

    // Count votes for each position
    const results = {
      ketua: {},
      sekretaris: {},
      bendahara: {}
    }

    data.forEach(vote => {
      // Count ketua votes
      if (vote.ketua) {
        results.ketua[vote.ketua] = (results.ketua[vote.ketua] || 0) + 1
      }
      // Count sekretaris votes
      if (vote.sekretaris) {
        results.sekretaris[vote.sekretaris] = (results.sekretaris[vote.sekretaris] || 0) + 1
      }
      // Count bendahara votes
      if (vote.bendahara) {
        results.bendahara[vote.bendahara] = (results.bendahara[vote.bendahara] || 0) + 1
      }
    })

    return { success: true, results, totalVotes: data.length }
  } catch (error) {
    console.error('Error fetching results:', error)
    return { success: false, error: error.message }
  }
}

export async function checkDeviceVote(deviceFingerprint) {
  try {
    const { data, error } = await supabase
      .from('votes')
      .select('id')
      .eq('device_fingerprint', deviceFingerprint)
      .limit(1)

    if (error) throw error
    return { success: true, hasVoted: data && data.length > 0 }
  } catch (error) {
    console.error('Error checking device vote:', error)
    return { success: false, error: error.message, hasVoted: false }
  }
}

export async function resetVotingData() {
  try {
    const { error } = await supabase
      .from('votes')
      .delete()
      .neq('id', 0)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Error resetting votes:', error)
    return { success: false, error: error.message }
  }
}
