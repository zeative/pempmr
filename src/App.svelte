<script>
  import { Router, Route } from 'svelte-routing'
  import VotingPage from './routes/VotingPage.svelte'
  import AdminDashboard from './routes/AdminDashboard.svelte'

  const base = '';
</script>

<Router {base}>
  <Route path="/" component={VotingPage} />
  <Route path="/dashboard/admin" component={AdminDashboard} />
</Router>
