// Ours
const run = require('./run')
const match = require('./helpers/match')
const migrate = require('./helpers/migrate')
const runToggle = require('./runToggle')

async function toggle (context) {
  // 1. Extract necessary info
  const issue = context.issue()
  const { payload, github, log } = context
  const { sha } = payload.pull_request.head

  // 2. Migrate if necessary
  const body = await migrate(context)

  // 3. Match issue patterns
  const deps = await match({ body, issue_number: issue.number })

  // 4. Run the toggling behaviour
  return runToggle(context, issue.number, issue.owner, issue.repo, sha, deps)
}

module.exports = toggle