// Ours
const run = require('./run')
const match = require('./helpers/match')
const migrate = require('./helpers/migrate')

async function runToggle (context, issue, sha, deps) {
  const { github, log } = context

  // 5. Add or remove the label
  var foundOpenIssue = false

  if (deps.length > 0) {
    log('Found ' + deps.length + ' dependencies, checking if they are open')
    // Check each dependant issue
    for (const number of deps) {
      // Get issue details
      const dependentIssue = await github.issues.get({ ...issue, number })

      // The actual test
      if (dependentIssue.data.state === 'open') {
        // Add the label
        log('Adding label')
        await github.issues.addLabels({ ...issue, labels: ['Dependent'] })
        foundOpenIssue = true
        break
      }
    }
  }

  // If there were no dependencies or no open dependencies then remove the label
  if (deps.length == 0 || foundOpenIssue == false) {
    try {
      // Remove it
      log('No dependencies found, removing the label')
      await github.issues.removeLabel({ ...issue, name: 'Dependent' })
    } catch (err) {
      // Nothing need to be done. Resolves (#14)
      log("The label doesn't exist. It's OK!")
    }
  }

  // 6. Run checks anyway
  log('Running checks')
  return run(github, issue, sha, deps)
}

module.exports = runToggle