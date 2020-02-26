// Ours
const report = require('./report')

async function run (github, repo, sha, deps) {
  // Tell GitHub we are working on it
  await report(github, repo, sha, 'pending')

  // Helpers
  let pass = true
  let blockers = []

  // Filter possible duplication
  deps = Array.from(new Set(deps))

  log('Checking status of ' + deps.length ' dependencies')
  for (const number of deps) {
    // Get issue details
    const issue = await github.issues.get({ ...repo, number })

    // The actual test
    if (issue.data.state === 'open') {
      log('Found open dependency')
      pass = false
      blockers.push(number)
    }
  }

  // Update the state
  log('Reporting ' (pass ? 'success' : 'failure') + ' status')
  return report(github, repo, sha, pass ? 'success' : 'failure', blockers)
}

module.exports = run
